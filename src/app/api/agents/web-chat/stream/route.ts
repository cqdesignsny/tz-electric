import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  streamText,
  convertToModelMessages,
  gateway,
  isTextUIPart,
  stepCountIs,
  type UIMessage,
} from 'ai'

import {
  appendMessage,
  getConversation,
} from '@/lib/agent-conversations'
import { buildSystemPrompt } from '@/lib/agent-prompt'
import { buildAgentTools } from '@/lib/agent-tools'
import { db } from '@/lib/db'

// Abuse / cost guardrails. Tuned conservatively; relax later if real
// usage hits the ceiling.
const MAX_USER_MESSAGE_CHARS = 2000 // single-message length cap
const MAX_USER_MESSAGES_PER_CONVERSATION = 50 // forces a fresh thread after long sessions
const MAX_OUTPUT_TOKENS = 1200 // per-reply cap so a runaway answer can't drain the bill
const MAX_TOOL_STEPS = 8 // existing limit on the tool-use loop

/**
 * Web chat streaming endpoint for Claire on the public site (`/claire`).
 *
 * The client (ClaireChat) generates a UUID v4 for the conversation on first
 * mount, stashes it in sessionStorage, and passes it on every request. This
 * endpoint upserts the conversation row (idempotent) so we don't need a
 * separate "start conversation" round-trip — the same UUID is canonical
 * across reloads inside the same tab session.
 *
 * Lifecycle per request:
 *   1. Validate body. Reject without Vercel AI Gateway configured (OIDC
 *      auto-injected on Vercel, or AI_GATEWAY_API_KEY for local dev).
 *   2. Upsert the conversation, capturing first-touch attribution.
 *   3. Persist the latest user message for transcript parity with SMS.
 *   4. Honor takeover: if the office has the thread, the model is told to
 *      stay quiet (system prompt swap). The stream still returns cleanly.
 *   5. Stream the assistant reply back to the client. After the stream
 *      finishes, persist tool calls / tool results / final assistant text
 *      with token usage so the office sees the full chain.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Attribution = {
  channel?: string | null
  referrer?: string | null
  landingUrl?: string | null
  utm?: Record<string, string>
}

type Body = {
  messages: UIMessage[]
  conversationId: string
  attribution?: Attribution
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { messages, conversationId, attribution } = body

  if (!conversationId || !UUID_RE.test(conversationId)) {
    return NextResponse.json({ error: 'invalid_conversation_id' }, { status: 400 })
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'no_messages' }, { status: 400 })
  }

  // Reject oversized user messages early. A single 100KB blob has no
  // legitimate use here and racks up input tokens.
  const lastForCheck = messages[messages.length - 1]
  if (lastForCheck?.role === 'user') {
    const text = uiMessageText(lastForCheck)
    if (text.length > MAX_USER_MESSAGE_CHARS) {
      return NextResponse.json(
        {
          error: 'message_too_long',
          message: `Please keep messages under ${MAX_USER_MESSAGE_CHARS} characters. Try splitting your question into a couple of shorter ones.`,
        },
        { status: 413 },
      )
    }
  }

  // Auth is handled by @ai-sdk/gateway: AI_GATEWAY_API_KEY first,
  // then OIDC via @vercel/oidc on Vercel. We don't pre-check env vars
  // here because OIDC isn't always exposed as a process.env value;
  // letting the SDK try and surface its own error gives us better
  // diagnostics than a brittle env-name guess.

  // Upsert the conversation row. Client owns the UUID so we can be
  // idempotent across reloads / retries inside the same session.
  try {
    const sql = db()
    await sql`
      INSERT INTO tz_agent_conversations (
        id,
        channel,
        attribution_channel,
        attribution_first_touch
      ) VALUES (
        ${conversationId},
        'web_chat',
        ${attribution?.channel ?? null},
        ${attribution ? JSON.stringify(attribution) : null}::jsonb
      )
      ON CONFLICT (id) DO NOTHING
    `
  } catch (e) {
    console.error('[web-chat] conversation upsert failed:', e)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  // Per-conversation cap. Long sessions get cut off and forced to a
  // fresh thread (the "Start over" button on the UI) to limit how much
  // a single anonymous visitor can spend in one sitting.
  try {
    const sql = db()
    const rows = (await sql`
      SELECT COUNT(*)::int AS count FROM tz_agent_messages
      WHERE conversation_id = ${conversationId} AND role = 'user'
    `) as Array<{ count: number }>
    const userCount = rows[0]?.count ?? 0
    if (userCount >= MAX_USER_MESSAGES_PER_CONVERSATION) {
      return NextResponse.json(
        {
          error: 'conversation_limit_reached',
          message: `This conversation has reached its message limit. Hit "Start over" or call (518) 678-1230 and a real person can pick up where you left off.`,
        },
        { status: 429 },
      )
    }
  } catch (e) {
    console.error('[web-chat] message-count check failed:', e)
    // Non-fatal: don't block on a counter query failure.
  }

  // Persist the latest user message for the transcript view.
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
        console.error('[web-chat] persist user message failed:', e)
      }
    }
  }

  // Takeover honors the office staff: prompt asks the model to stay quiet.
  // Customer still gets a clean (empty) stream; the page UI surfaces a
  // "office is responding" notice from the conversation status.
  const conv = await getConversation(conversationId)
  const takeoverActive = !!conv?.takeover_by_user

  const systemPrompt = await buildSystemPrompt({
    channel: 'web_chat',
    takeoverActive,
  })
  const tools = buildAgentTools({ conversationId, channel: 'web_chat' })

  const modelMessages = await convertToModelMessages(messages)

  // Visitor identifier for AI Gateway per-user rate limiting + cost
  // attribution. Hash the IP so we don't store the raw value anywhere.
  // Configure RPM / TPD ceilings in the Vercel dashboard
  // (vercel.com/<team>/<project>/settings → AI Gateway → Rate Limits).
  const visitorIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  const visitorHash = createHash('sha256').update(visitorIp).digest('hex').slice(0, 24)
  const env = process.env.VERCEL_ENV || 'dev'

  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4.6'),
    system: systemPrompt,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(MAX_TOOL_STEPS),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    providerOptions: {
      gateway: {
        user: visitorHash,
        tags: ['feature:claire-web-chat', `env:${env}`],
      },
    },
    onError: ({ error }) => {
      // Surface the real upstream message in Vercel logs so we can debug
      // auth / model / tool failures without guessing.
      console.error('[web-chat] streamText error:', error)
    },
    onFinish: async ({ steps, text, totalUsage }) => {
      try {
        // Walk every step so the transcript reflects the full chain of
        // tool calls Claire ran on the office's behalf.
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
            const output =
              typeof tr.output === 'string' ? tr.output : JSON.stringify(tr.output)
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
        console.error('[web-chat] persist on-finish failed:', e)
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

/**
 * GET handler for ad-hoc deploy verification. Returns the route shape and
 * the AI Gateway auth modes the runtime can detect (OIDC is auto-injected
 * on Vercel and may not appear as a process env var, so a "false" here
 * doesn't necessarily mean the route is broken — try a real POST).
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/agents/web-chat/stream',
    method: 'POST',
    purpose: 'Web chat (Claire) streaming endpoint',
    detected_auth: {
      ai_gateway_api_key: !!process.env.AI_GATEWAY_API_KEY,
      vercel_oidc_token_env: !!process.env.VERCEL_OIDC_TOKEN,
    },
  })
}
