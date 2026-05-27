/**
 * Vapi Server URL — single dispatch endpoint for voice Claire.
 *
 * Vapi posts every server event (assistant-request, tool-calls,
 * end-of-call-report, status-update, transcript, conversation-update,
 * speech-update, etc.) to the same URL. We switch on `message.type`.
 *
 *   POST /api/agents/voice/server
 *
 * Authentication: every request must carry the Vapi Server URL secret
 * either as `Authorization: Bearer <secret>` or `X-Vapi-Secret`. Configure
 * the same value in Vapi assistant settings AND the
 * `VAPI_SERVER_URL_SECRET` env var.
 *
 * Conversation persistence:
 * - `assistant-request` creates a `tz_agent_conversations` row with the
 *   Vapi call id stored in `external_call_id` and the caller's phone
 *   from caller ID. Returns the dynamic assistant config (system
 *   prompt, voice, model, tools, opener) so each call always has the
 *   latest KB injected.
 * - `tool-calls` writes a `tool_use` + `tool_result` message pair to
 *   `tz_agent_messages` for live audit + Switchboard rendering, runs
 *   the tool, returns the Vapi-shaped results envelope.
 * - `end-of-call-report` persists every user + assistant turn from
 *   `artifact.messages` (skipping tool turns to avoid duplicates with
 *   the live writes above), records the recording URL, and closes the
 *   conversation.
 * - `status-update` and other informational events return 200 with no
 *   side effects beyond an updated_at touch.
 */
import { NextResponse } from 'next/server'

import {
  appendMessage,
  closeConversation,
  findConversationByExternalCallId,
  findOrStartConversation,
} from '@/lib/agent-conversations'
import { buildSystemPrompt } from '@/lib/agent-prompt'
import {
  buildVapiFunctionDefinitions,
  executeVapiToolCall,
  extractVapiCall,
  type VapiToolCall,
} from '@/lib/vapi-tools'
import { verifyVapiRequest } from '@/lib/vapi-signature'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Vapi enforces a 7.5s deadline for `assistant-request`. We need
// generous breathing room for KB read + system-prompt assembly, so
// raise the function timeout above the platform default.
export const maxDuration = 30

// Default voice + model settings. Override via env vars without
// redeploy. Provider strings match Vapi's expected values.
const VOICE_PROVIDER = process.env.VAPI_VOICE_PROVIDER || '11labs'
const VOICE_ID = process.env.VAPI_VOICE_ID || 'jBpfuIE2acCO8z3wKNLl' // Jenny on 11labs (placeholder default)
const MODEL_PROVIDER = process.env.VAPI_MODEL_PROVIDER || 'anthropic'
const MODEL_NAME = process.env.VAPI_MODEL_NAME || 'claude-3-5-sonnet-20241022'

const OPENER =
  'Hi, thanks for calling TZ Electric, Plumbing, Heating, and Cooling. This is Claire, your smart assistant. How can I help you today?'

type VapiCall = {
  id: string
  customer?: { number?: string | null; name?: string | null } | null
  phoneNumber?: { number?: string | null } | null
  status?: string | null
}

type VapiArtifactMessage = {
  // Vapi uses `bot` (not `assistant`) for the agent's spoken turns in
  // the end-of-call artifact. `tool_calls` / `tool_call_result` carry
  // the tool surface. `system` is the system prompt (not a turn).
  role: 'assistant' | 'bot' | 'user' | 'system' | 'tool_calls' | 'tool_call_result' | string
  message?: string
  time?: number
  endTime?: number
  secondsFromStart?: number
  toolCalls?: unknown
  name?: string
  result?: string
}

type VapiArtifact = {
  recording?: {
    stereoUrl?: string | null
    mono?: { combinedUrl?: string | null } | null
    combinedUrl?: string | null
  } | null
  transcript?: string | null
  messages?: VapiArtifactMessage[]
}

type VapiServerMessage = {
  type:
    | 'assistant-request'
    | 'tool-calls'
    | 'end-of-call-report'
    | 'status-update'
    | 'transcript'
    | 'speech-update'
    | 'conversation-update'
    | 'hang'
    | 'transfer-destination-request'
    | string
  call?: VapiCall
  status?: string
  endedReason?: string
  artifact?: VapiArtifact
  toolCallList?: VapiToolCall[]
  toolWithToolCallList?: Array<{ name?: string; toolCall?: VapiToolCall }>
}

type VapiServerPayload = { message: VapiServerMessage }

export async function POST(req: Request) {
  // Auth: closed-by-default. Set VAPI_SERVER_URL_SECRET on Vercel and
  // mirror it in the Vapi assistant Server URL config.
  if (!verifyVapiRequest(req, process.env.VAPI_SERVER_URL_SECRET)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: VapiServerPayload
  try {
    payload = (await req.json()) as VapiServerPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const message = payload?.message
  if (!message || typeof message.type !== 'string') {
    return NextResponse.json({ error: 'Missing message.type' }, { status: 400 })
  }

  try {
    switch (message.type) {
      case 'assistant-request':
        return await handleAssistantRequest(message)

      case 'tool-calls':
        return await handleToolCalls(message)

      case 'end-of-call-report':
        await handleEndOfCallReport(message)
        return NextResponse.json({ ok: true })

      case 'status-update':
        await handleStatusUpdate(message)
        return NextResponse.json({ ok: true })

      // Informational events we ignore in v1 but still 200 so Vapi
      // doesn't keep retrying.
      case 'transcript':
      case 'speech-update':
      case 'conversation-update':
      case 'hang':
      case 'transfer-destination-request':
      default:
        return NextResponse.json({ ok: true })
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[voice/server] ${message.type} handler threw:`, e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// assistant-request: start of every inbound call.
// ---------------------------------------------------------------------------

async function handleAssistantRequest(message: VapiServerMessage) {
  const call = message.call
  if (!call?.id) {
    return NextResponse.json({ error: 'Missing call.id' }, { status: 400 })
  }

  const callerPhone = normalizePhone(call.customer?.number ?? null)
  const callerName = call.customer?.name?.trim() || null

  // Idempotent: if Vapi retries the assistant-request for the same call
  // id, reuse the existing conversation row instead of creating a dup.
  const conversation = await findOrStartConversation({
    channel: 'voice',
    customerPhone: callerPhone,
    customerName: callerName,
    attributionChannel: 'Voice Claire',
    externalCallId: call.id,
  })

  const systemPrompt = await buildSystemPrompt({
    channel: 'voice',
    customerPhone: callerPhone,
    customerName: callerName,
  })

  const tools = buildVapiFunctionDefinitions({
    conversationId: conversation.id,
    channel: 'voice',
  })

  return NextResponse.json({
    assistant: {
      firstMessage: OPENER,
      voice: { provider: VOICE_PROVIDER, voiceId: VOICE_ID },
      model: {
        provider: MODEL_PROVIDER,
        model: MODEL_NAME,
        messages: [{ role: 'system', content: systemPrompt }],
        tools,
      },
      // End-of-call guardrails — fix for the 2026-05-27 PM glitch where
      // Claire kept saying "one moment" ~25x and never hung up. Three
      // layers of belt-and-suspenders:
      //   1. endCallFunctionEnabled lets the model call an `endCall`
      //      tool explicitly when its closing sentence has been said.
      //   2. endCallPhrases auto-hangs up when Claire's spoken output
      //      contains any of these polite sign-offs.
      //   3. silenceTimeoutSeconds hangs up if neither side speaks for
      //      30 seconds (catches stalled loops and forgotten-to-hangup
      //      callers).
      // backchannelingEnabled disabled so Claire doesn't blurt "uh huh"
      // during a voicemail recording (per the voicemail intent rule).
      endCallFunctionEnabled: true,
      endCallPhrases: [
        'have a good one',
        'have a great day',
        'have a great rest of your day',
        'take care',
        'goodbye',
        'bye',
        'thanks for calling',
        'you can hang up whenever you',
      ],
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 900, // 15 min hard cap (matches the prompt rule)
      backchannelingEnabled: false,
      // Vapi defaults a transcriber (Deepgram) and the call will use
      // whatever's set in the assistant dashboard if we omit it. We
      // leave it default to avoid pinning a provider.
    },
  })
}

// ---------------------------------------------------------------------------
// tool-calls: model decided to run a function mid-call.
// ---------------------------------------------------------------------------

async function handleToolCalls(message: VapiServerMessage) {
  const callId = message.call?.id
  if (!callId) {
    return NextResponse.json({ error: 'Missing call.id' }, { status: 400 })
  }

  const conversation = await findConversationByExternalCallId(callId)
  if (!conversation) {
    // Tool-calls before assistant-request shouldn't happen, but if it
    // does we still try to satisfy the call so the conversation
    // doesn't dead-air. Bootstrap a conversation row on the fly.
    console.warn(`[voice/server] tool-calls without conversation; bootstrapping for call ${callId}`)
    await findOrStartConversation({
      channel: 'voice',
      externalCallId: callId,
      customerPhone: normalizePhone(message.call?.customer?.number ?? null),
    })
  }

  const conv = conversation ?? (await findConversationByExternalCallId(callId))
  if (!conv) {
    return NextResponse.json({ error: 'Conversation lookup failed' }, { status: 500 })
  }

  // Normalize: Vapi sometimes sends toolCallList, sometimes
  // toolWithToolCallList. Prefer the explicit list; fall back to the
  // verbose one.
  const calls: VapiToolCall[] =
    message.toolCallList && message.toolCallList.length > 0
      ? message.toolCallList
      : (message.toolWithToolCallList ?? [])
          .map((entry) =>
            entry.toolCall
              ? ({ ...entry.toolCall, name: entry.toolCall.name ?? entry.name } as VapiToolCall)
              : null,
          )
          .filter((x): x is VapiToolCall => !!x)

  const results: Array<{ toolCallId: string; name: string; result: string }> = []

  for (const call of calls) {
    // Vapi wraps the tool name + args inside `call.function`. Reading
    // `call.name` / `call.arguments` directly persists NULL and ships
    // "Unknown tool: undefined" back to the model — the bug that made
    // every voice tool call a silent no-op from launch through 2026-05-27.
    // extractVapiCall unwraps both shapes safely.
    const { name: extractedName, args: extractedArgs } = extractVapiCall(call)

    // Persist the tool_use turn so the Switchboard sees the call live.
    await appendMessage({
      conversationId: conv.id,
      role: 'tool_use',
      toolName: extractedName,
      toolInput: extractedArgs,
      toolUseId: call.id,
      externalId: call.id,
    })

    const r = await executeVapiToolCall({
      ctx: { conversationId: conv.id, channel: 'voice' },
      call,
    })

    // Persist the tool_result turn alongside.
    await appendMessage({
      conversationId: conv.id,
      role: 'tool_result',
      content: r.result,
      toolName: r.name,
      toolUseId: r.toolCallId,
      externalId: r.toolCallId,
    })

    results.push({ toolCallId: r.toolCallId, name: r.name, result: r.result })
  }

  return NextResponse.json({ results })
}

// ---------------------------------------------------------------------------
// end-of-call-report: persist the full transcript, close the conversation.
// ---------------------------------------------------------------------------

async function handleEndOfCallReport(message: VapiServerMessage) {
  const callId = message.call?.id
  if (!callId) return

  const conv = await findConversationByExternalCallId(callId)
  if (!conv) {
    console.warn(`[voice/server] end-of-call-report without conversation: ${callId}`)
    return
  }

  // Vapi role conventions in the artifact transcript don't match our
  // tz_agent_messages roles 1:1. Normalize:
  //   - `bot` → `assistant` (Vapi calls Claire "bot" in the transcript)
  //   - `user` → `user`
  //   - `system` → skip (it's the system prompt, not a conversation turn)
  //   - `tool_calls` / `tool_call_result` → skip (already persisted live
  //     via the `tool-calls` webhook earlier in the call)
  const artifactMessages = message.artifact?.messages ?? []
  for (const m of artifactMessages) {
    const text = (m.message ?? '').trim()
    if (!text) continue

    let role: 'user' | 'assistant' | null = null
    if (m.role === 'user') role = 'user'
    else if (m.role === 'assistant' || m.role === 'bot') role = 'assistant'
    // Anything else (system prompt, tool_calls, tool_call_result, etc.)
    // we ignore here.
    if (!role) continue

    await appendMessage({
      conversationId: conv.id,
      role,
      content: text,
      externalId: m.time ? `${callId}:${m.time}` : null,
    })
  }

  // Stash the recording URL into closed_reason for now so it surfaces
  // in the conversations list even before we build a dedicated voice
  // viewer. A small loss of semantic purity for an immediate UX win.
  const recordingUrl =
    message.artifact?.recording?.stereoUrl ||
    message.artifact?.recording?.combinedUrl ||
    message.artifact?.recording?.mono?.combinedUrl ||
    null

  await closeConversation(
    conv.id,
    recordingUrl
      ? `voice_ended:${message.endedReason || 'normal'}|recording:${recordingUrl}`
      : `voice_ended:${message.endedReason || 'normal'}`,
  )
}

// ---------------------------------------------------------------------------
// status-update: lifecycle pings.
// ---------------------------------------------------------------------------

async function handleStatusUpdate(message: VapiServerMessage) {
  const callId = message.call?.id
  if (!callId) return
  const conv = await findConversationByExternalCallId(callId)
  if (!conv) return

  // Touch updated_at via a no-op append? Easier to skip — Switchboard
  // polling re-reads anyway. Log for debugging:
  console.log(
    `[voice/server] status-update ${callId} → ${message.status || message.call?.status}`,
  )
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function normalizePhone(raw: string | null): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  if (digits.length === 10) return digits
  return null
}
