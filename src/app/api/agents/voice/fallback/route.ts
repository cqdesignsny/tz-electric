/**
 * Twilio voice fallback — fires when the primary voiceUrl (Vapi) returns
 * a 4xx/5xx or times out (Vapi gives Twilio a 15s deadline for inbound).
 *
 * Strategy: don't strand the caller. Briefly explain there's a tech
 * issue, then bridge them straight to the office line at (518) 678-1230
 * via <Dial>. The office's own carrier (HCP Voice) handles ring + after-
 * hours behavior, so the caller gets whatever the office gives them when
 * dialing directly. If the bridge fails for any reason, a final spoken
 * message tells them to call back.
 *
 * Twilio fetches this URL with POST by default; some retry paths use
 * GET, so we handle both.
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

function buildFallbackTwiML(): string {
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

function twimlResponse(): NextResponse {
  return new NextResponse(buildFallbackTwiML(), {
    status: 200,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

export async function POST(): Promise<NextResponse> {
  return twimlResponse()
}

export async function GET(): Promise<NextResponse> {
  return twimlResponse()
}
