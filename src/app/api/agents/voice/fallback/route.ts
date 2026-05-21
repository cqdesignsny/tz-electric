/**
 * Twilio voice fallback — fires when the primary voiceUrl (Vapi) returns
 * a 4xx/5xx or times out (Vapi gives Twilio a 15s deadline for inbound).
 *
 * Two strategies based on how the call reached our Twilio number:
 *
 * 1) Caller dialed our Twilio number directly (no ForwardedFrom).
 *    Bridge them to the office at (518) 678-1230 so they aren't stranded.
 *
 * 2) Caller dialed the main office line and HCP Voice forwarded the call
 *    into us (ForwardedFrom = office number). We MUST NOT <Dial> back to
 *    the office — HCP would forward right back to us on no-answer and we'd
 *    chain forwarding hops until Twilio's cap. In that case, just play a
 *    polite "please call back" message and hang up. The customer is already
 *    on the office line in some sense, so the cleanest UX is to drop them
 *    with a clear callback prompt rather than loop.
 *
 * Twilio fetches this URL with POST and includes the original call's webhook
 * params in the body (CallSid, From, To, ForwardedFrom, etc.) as
 * application/x-www-form-urlencoded. Some retry paths use GET with no body;
 * for GET we default to the safe (no-Dial) variant.
 *
 * Wiring: set the Twilio number's `voiceFallbackUrl` to
 *   https://tzelectricinc.com/api/agents/voice/fallback
 * with `voiceFallbackMethod = POST`. Primary `voiceUrl` stays pointing
 * at https://api.vapi.ai/twilio/inbound_call.
 */
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const OFFICE_NUMBER = '+15186781230'
const OFFICE_SPOKEN = 'five one eight, six seven eight, one two three zero'

function normalizeDigits(value: string | null | undefined): string {
  return (value || '').replace(/\D/g, '')
}

function isForwardedFromOffice(forwardedFrom: string | null): boolean {
  const fwd = normalizeDigits(forwardedFrom)
  const office = normalizeDigits(OFFICE_NUMBER)
  if (!fwd || !office) return false
  // Compare the last 10 digits so we match regardless of country-code prefix.
  return fwd.slice(-10) === office.slice(-10)
}

/**
 * Caller dialed our Twilio number directly. Bridge them to the office; if
 * the bridge fails, give them a clean callback prompt.
 */
function buildBridgeTwiML(): string {
  // Polly.Joanna-Neural matches the voice used in src/lib/twilio-outbound.ts
  // for emergency dispatch calls, so the brand voice stays consistent.
  // <Dial> without callerId defaults to forwarding the caller's own
  // number, which is what the office wants for CRM matching.
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">
    Thanks for calling T Z Electric. We're having a brief technical issue with our smart assistant. Connecting you to our office now.
  </Say>
  <Dial timeout="25" answerOnBridge="true">${OFFICE_NUMBER}</Dial>
  <Say voice="Polly.Joanna-Neural">
    Sorry, we couldn't reach the office. Please call us back at ${OFFICE_SPOKEN}. We'll help you right away. Thank you.
  </Say>
</Response>`
}

/**
 * Call was forwarded from the office line via HCP Voice no-answer routing.
 * Skip the <Dial> (would re-forward into us). Tell the caller to call back
 * and hang up cleanly.
 */
function buildCallbackTwiML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">
    Thanks for calling T Z Electric. We're having a brief technical issue and our smart assistant isn't available right now. Please call us back in a few minutes at ${OFFICE_SPOKEN}. Sorry for the trouble, and thank you.
  </Say>
  <Hangup/>
</Response>`
}

function twimlResponse(body: string): NextResponse {
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export async function POST(req: Request): Promise<NextResponse> {
  // Twilio webhook body is application/x-www-form-urlencoded. ForwardedFrom
  // is the previous leg's "to" number, present only on forwarded calls.
  let forwardedFrom: string | null = null
  try {
    const form = await req.formData()
    forwardedFrom = (form.get('ForwardedFrom') as string | null) ?? null
  } catch {
    // If the body isn't form data (rare; some Twilio retry paths omit it),
    // fall through with forwardedFrom = null which routes to the safe
    // (no-Dial) callback variant.
    forwardedFrom = null
  }

  if (isForwardedFromOffice(forwardedFrom)) {
    return twimlResponse(buildCallbackTwiML())
  }
  return twimlResponse(buildBridgeTwiML())
}

export async function GET(): Promise<NextResponse> {
  // GET has no body, so we can't tell if it was forwarded. Default to the
  // safe no-Dial variant — it's the conservative choice and avoids any
  // chance of looping back into HCP.
  return twimlResponse(buildCallbackTwiML())
}
