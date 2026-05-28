/**
 * Admin Claire streaming endpoint — powers the chat at
 * /switchboard/agent-training where Tyler / Terry / Cesar talk to Claire
 * about the knowledge base, daily reports, and recent activity.
 *
 * Role gating: only `owner` and `admin` (per src/lib/users.ts) can hit
 * this. Office and viewer get 403. requireGoogleUser enforces a real
 * Google identity so KB edits have proper attribution.
 *
 * Model: Claude Opus 4.7 via Vercel AI Gateway. Higher intelligence
 * tier matches the analyzer model — Cesar wants the smarter reasoner
 * doing both the daily review and the in-line edit work.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  streamText,
  convertToModelMessages,
  gateway,
  isTextUIPart,
  stepCountIs,
  type UIMessage,
} from 'ai'

import { appendMessage } from '@/lib/agent-conversations'
import { buildAdminPrompt, describeSwitchboardPath } from '@/lib/agent-prompt'
import { buildAdminTools } from '@/lib/admin-tools'
import { requireGoogleUser } from '@/lib/current-user'
import { canEditKnowledgeBase } from '@/lib/users'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const MAX_OUTPUT_TOKENS = 4000
const MAX_TOOL_STEPS = 12 // higher than customer-side; admin work often
                          // chains list + lookup + propose in one turn.

// Pending edits Tyler proposed but hasn't approved yet, keyed first by
// conversationId then by section_path. Module-scoped — survives within
// a warm serverless instance, which is the typical case for admin chat
// (continuous bursts). Cold-start = Tyler re-proposes. Acceptable for
// V1. Phase 2 will persist to a tz_pending_admin_actions table so
// multi-day pending edits survive deploys.
const pendingEditsByConversation = new Map<
  string,
  Map<string, { sectionPath: string; newContent: string; rationale: string }>
>()

function getPendingEditsMap(
  conversationId: string,
): Map<string, { sectionPath: string; newContent: string; rationale: string }> {
  let m = pendingEditsByConversation.get(conversationId)
  if (!m) {
    m = new Map()
    pendingEditsByConversation.set(conversationId, m)
  }
  return m
}

type Body = {
  messages: UIMessage[]
  conversationId: string
  /** Optional. The Switchboard page Tyler is currently on. The panel
   *  passes this so Claire can reference "this call" / "this page". */
  currentPath?: string | null
}

export async function POST(req: NextRequest) {
  // Auth: signed-in Google user with owner or admin role.
  let actor
  try {
    actor = await requireGoogleUser()
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'unauthorized' },
      { status: 401 },
    )
  }
  if (!canEditKnowledgeBase(actor.role)) {
    return NextResponse.json(
      { error: 'admin_chat_requires_owner_or_admin' },
      { status: 403 },
    )
  }
  // role is narrowed to 'owner' | 'admin' from here on.
  const adminRole = actor.role as 'owner' | 'admin'

  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { messages, conversationId, currentPath } = body
  if (!conversationId || !UUID_RE.test(conversationId)) {
    return NextResponse.json({ error: 'invalid_conversation_id' }, { status: 400 })
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'no_messages' }, { status: 400 })
  }

  // Upsert the conversation. Customer-facing channels stash the caller's
  // contact info; here we stash the actor's email + role + name in the
  // customer_* columns so the transcript view shows who edited what.
  try {
    const sql = db()
    await sql`
      INSERT INTO tz_agent_conversations (
        id, channel, customer_name, customer_email, attribution_channel
      ) VALUES (
        ${conversationId},
        'admin_chat',
        ${actor.user?.name ?? null},
        ${actor.email},
        ${'Admin Chat: ' + adminRole}
      )
      ON CONFLICT (id) DO UPDATE SET
        customer_name = COALESCE(EXCLUDED.customer_name, tz_agent_conversations.customer_name),
        customer_email = COALESCE(EXCLUDED.customer_email, tz_agent_conversations.customer_email),
        updated_at = NOW()
    `
  } catch (e) {
    console.error('[admin-chat] conversation upsert failed:', e)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // Persist the latest user message.
  const last = messages[messages.length - 1]
  if (last?.role === 'user') {
    const text = uiMessageText(last)
    if (text) {
      try {
        await appendMessage({
          conversationId,
          role: 'user',
          content: text,
        })
      } catch (e) {
        console.error('[admin-chat] persist user message failed:', e)
      }
    }
  }

  const systemPrompt = await buildAdminPrompt({
    actorEmail: actor.email,
    actorRole: adminRole,
    actorName: actor.user?.name ?? null,
    currentPath: typeof currentPath === 'string' ? currentPath : null,
  })

  const tools = buildAdminTools({
    conversationId,
    actor: {
      email: actor.email,
      role: adminRole,
      name: actor.user?.name ?? null,
    },
    pendingEdits: getPendingEditsMap(conversationId),
  })

  const modelMessages = await convertToModelMessages(messages)

  // Inject the current Switchboard page into the LATEST user message
  // text so the most recent turn in conversation history carries the
  // most recent page context. Without this, Claire mirrors what she
  // said in an earlier turn ("you're on call logs") even after the
  // user has navigated to a different page. The system prompt also
  // has the current page (with anti-stale-history language), but
  // conversation history is more load-bearing for Anthropic models —
  // grounding the latest user turn directly is the reliable fix.
  // Cesar 2026-05-27 ~9:15 PM.
  if (typeof currentPath === 'string' && currentPath) {
    const pageDesc = describeSwitchboardPath(currentPath)
    const contextLine = `[Page context for this turn: I am on \`${currentPath}\` — ${pageDesc}. If you said earlier I was somewhere else, I have since navigated. Ground your reply in this URL.]`
    for (let i = modelMessages.length - 1; i >= 0; i--) {
      const m = modelMessages[i]
      if (m.role !== 'user') continue
      if (typeof m.content === 'string') {
        m.content = `${contextLine}\n\n${m.content}`
      } else if (Array.isArray(m.content)) {
        const idx = m.content.findIndex((p) => p.type === 'text')
        if (idx >= 0) {
          const part = m.content[idx]
          if (part.type === 'text') {
            m.content[idx] = { ...part, text: `${contextLine}\n\n${part.text}` }
          }
        } else {
          m.content.unshift({ type: 'text', text: contextLine })
        }
      }
      break
    }
  }

  const env = process.env.VERCEL_ENV || 'dev'

  const result = streamText({
    model: gateway('anthropic/claude-opus-4.7'),
    system: {
      role: 'system',
      content: systemPrompt,
      providerOptions: {
        anthropic: { cacheControl: { type: 'ephemeral' } },
      },
    },
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(MAX_TOOL_STEPS),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: {
      gateway: {
        user: actor.email,
        tags: ['feature:claire-admin-chat', `env:${env}`, `role:${adminRole}`],
      },
    },
    onError: ({ error }) => {
      console.error('[admin-chat] streamText error:', error)
    },
    onFinish: async ({ steps, text, totalUsage }) => {
      try {
        for (const step of steps) {
          for (const call of step.toolCalls ?? []) {
            await appendMessage({
              conversationId,
              role: 'tool_use',
              toolName: call.toolName,
              toolInput: call.input as Record<string, unknown>,
              toolUseId: call.toolCallId,
            })
          }
          for (const tr of step.toolResults ?? []) {
            const output = typeof tr.output === 'string' ? tr.output : JSON.stringify(tr.output)
            await appendMessage({
              conversationId,
              role: 'tool_result',
              toolName: tr.toolName,
              toolUseId: tr.toolCallId,
              content: output,
            })
          }
        }
        if (text && text.trim()) {
          await appendMessage({
            conversationId,
            role: 'assistant',
            content: text,
            inputTokens: totalUsage?.inputTokens ?? null,
            outputTokens: totalUsage?.outputTokens ?? null,
          })
        }
      } catch (e) {
        console.error('[admin-chat] persist on-finish failed:', e)
      }
    },
  })

  return result.toUIMessageStreamResponse()
}

function uiMessageText(m: UIMessage): string {
  if (!Array.isArray(m.parts)) return ''
  return m.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join('\n')
    .trim()
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/agents/admin-chat/stream',
    method: 'POST',
    purpose: 'Admin Claire (Switchboard chat) — KB editing + reports + activity lookup',
    model: 'anthropic/claude-opus-4.7',
    requires: 'Google sign-in with owner or admin role',
  })
}
