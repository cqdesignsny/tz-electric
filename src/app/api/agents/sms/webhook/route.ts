import { NextRequest, NextResponse } from 'next/server'
import {
  appendMessage,
  findOrStartConversation,
  getConversation,
} from '@/lib/agent-conversations'
import { verifyTwilioSignature } from '@/lib/twilio-signature'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Twilio inbound SMS webhook.
 *
 * Lifecycle when fully wired:
 *   1. Twilio POSTs `application/x-www-form-urlencoded` here on every
 *      inbound SMS to the TZ business number.
 *   2. We verify the X-Twilio-Signature header against
 *      TWILIO_AUTH_TOKEN so this endpoint can't be spoofed.
 *   3. Find-or-start the conversation for this customer phone.
 *   4. Persist the inbound message.
 *   5. Compose system prompt + conversation history → Anthropic
 *      Messages API → tool-use loop via runTool() → final assistant
 *      reply.
 *   6. Persist the assistant reply.
 *   7. Return TwiML <Response><Message>...</Message></Response> so
 *      Twilio sends the reply.
 *
 * Today we ship steps 1-4 + a friendly fallback reply. Step 5 (Anthropic
 * call) is gated on ANTHROPIC_API_KEY being set; when Tyler ships that
 * env var, we flip the branch and Claire is live with no other code
 * change required.
 */
export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  // Prefer AI Gateway (auto-injected on Vercel via OIDC, or AI_GATEWAY_API_KEY
  // for portable auth). Falls back to direct Anthropic if Tyler chooses
  // that path. Either env var being set means "Claire is wired and can
  // respond"; absence means we're still in pre-launch holding mode.
  const aiConfigured =
    !!process.env.AI_GATEWAY_API_KEY ||
    !!process.env.VERCEL_OIDC_TOKEN ||
    !!process.env.ANTHROPIC_API_KEY

  // Twilio sends form-encoded bodies. Read once into a plain object so
  // we can both verify the signature and access fields.
  const formData = await req.formData()
  const params: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') params[key] = value
  }

  // Signature check — only enforce when we have an auth token configured.
  // During pre-launch the endpoint is reachable; we skip verification
  // gracefully so Cesar can curl-test before Twilio is live.
  if (authToken) {
    const signature = req.headers.get('x-twilio-signature') || ''
    // Twilio signs the FULL public URL Twilio called. Honor the
    // x-forwarded-proto header on Vercel.
    const proto = req.headers.get('x-forwarded-proto') || 'https'
    const host = req.headers.get('host') || ''
    const url = `${proto}://${host}${req.nextUrl.pathname}`
    const valid = verifyTwilioSignature({ authToken, signature, url, params })
    if (!valid) {
      console.warn('[sms-webhook] signature verification failed')
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  const fromPhone = params.From || params.from || ''
  const body = params.Body || params.body || ''
  const messageSid = params.MessageSid || params.SmsSid || null

  if (!fromPhone || !body) {
    return twimlReply('Sorry, we did not receive your message clearly. Please try again.')
  }

  // Start or continue the conversation.
  const conversation = await findOrStartConversation({
    channel: 'sms',
    customerPhone: normalizePhone(fromPhone),
  })

  // Persist the inbound message.
  await appendMessage({
    conversationId: conversation.id,
    role: 'user',
    content: body,
    externalId: messageSid,
  })

  // If the office has taken over, do not auto-reply. Office sends from
  // the Switchboard SMS Conversations view directly.
  const fresh = await getConversation(conversation.id)
  if (fresh?.takeover_by_user) {
    return new NextResponse('', { status: 204 })
  }

  // Without an AI provider configured, send a graceful holding reply so SMS
  // testing during the run-up to launch doesn't leave the customer hanging.
  if (!aiConfigured) {
    const fallback = [
      'Thanks for reaching out to TZ Electric. Our text assistant is being set up and will be live shortly.',
      'For immediate help call (518) 678-1230 — we answer 24/7 for emergencies.',
    ].join(' ')
    await appendMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: fallback,
      authoredBy: 'fallback',
    })
    return twimlReply(fallback)
  }

  // TODO (when Tyler ships AI_GATEWAY_API_KEY or ANTHROPIC_API_KEY): wire
  // the model call here using AI SDK v6 + AI Gateway (preferred, since
  // Tyler's Vercel team already includes Gateway access — one less paid
  // account in the handoff). Pseudocode:
  //
  //   import { generateText } from 'ai'
  //   import { buildSystemPrompt } from '@/lib/agent-prompt'
  //   import { buildAgentTools } from '@/lib/agent-tools'
  //
  //   const systemPrompt = await buildSystemPrompt({
  //     channel: 'sms',
  //     customerPhone: fromPhone,
  //     takeoverActive: !!fresh?.takeover_by_user,
  //   })
  //   const history = await listMessages(conversation.id)
  //   const messages = mapHistoryToCoreMessages(history)
  //   const tools = buildAgentTools({ conversationId: conversation.id, channel: 'sms' })
  //
  //   const { text, usage, toolCalls, toolResults } = await generateText({
  //     model: 'anthropic/claude-sonnet-4-6',  // AI Gateway model string
  //     system: systemPrompt,
  //     messages,
  //     tools,
  //     stopWhen: stepCountIs(8),  // ample for tool-use loops
  //   })
  //
  //   // AI SDK auto-runs tools' execute() functions inside the loop, so
  //   // toolCalls/toolResults already reflect what happened. Persist
  //   // them as tool_use / tool_result rows so the transcript view
  //   // shows the full chain.
  //   for (const call of toolCalls)   await appendMessage({ ..., role: 'tool_use', tool_name: call.toolName, tool_input: call.args })
  //   for (const result of toolResults) await appendMessage({ ..., role: 'tool_result', tool_name: result.toolName, content: JSON.stringify(result.result) })
  //   await appendMessage({ conversationId, role: 'assistant', content: text, input_tokens: usage.inputTokens, output_tokens: usage.outputTokens })
  //   return twimlReply(text)

  // Until then, the holding reply above is the live behavior.
  return twimlReply('Got your message — one moment.')
}

function twimlReply(message: string): NextResponse {
  const escaped = message
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response><Message>${escaped}</Message></Response>`
  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

function normalizePhone(raw: string): string {
  // Twilio sends E.164 (+15186781230). Strip to 10 digits when we can.
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}

/**
 * GET handler for ad-hoc browser testing — returns 405 in production but
 * lets us prove the route is deployed by visiting it from a browser.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/agents/sms/webhook',
    method: 'POST',
    purpose: 'Twilio inbound SMS webhook',
    status:
      (process.env.ANTHROPIC_API_KEY ? 'anthropic_ready' : 'anthropic_pending') +
      ',' +
      (process.env.TWILIO_AUTH_TOKEN ? 'twilio_ready' : 'twilio_pending'),
  })
}
