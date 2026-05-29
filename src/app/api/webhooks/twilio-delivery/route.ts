/**
 * Twilio delivery-status webhook. Twilio POSTs here (the StatusCallback URL set
 * by sendSms/placeCall in src/lib/twilio-outbound.ts) with the final outcome of
 * each dispatch text/call. We match the SID to a tz_dispatch_attempts row and
 * write back the real status + delivery time + error code, so the after-hours
 * dispatch page shows whether the tech was ACTUALLY reached — not just that
 * Twilio accepted the request.
 *
 * Read-mostly: only UPDATEs attempt rows it can match by twilio_sid; never
 * creates or deletes anything, and ignores SIDs it doesn't recognize.
 *
 * Security: validates Twilio's X-Twilio-Signature (HMAC-SHA1 of the exact
 * callback URL + sorted POST params, keyed with the auth token).
 */
import crypto from 'node:crypto'

import { db } from '@/lib/db'
import { statusCallbackUrl } from '@/lib/twilio-outbound'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Validate the X-Twilio-Signature header against the auth token. */
function isValidTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
  signature: string,
): boolean {
  const sortedKeys = Object.keys(params).sort()
  let data = url
  for (const k of sortedKeys) data += k + params[k]
  const expected = crypto.createHmac('sha1', authToken).update(Buffer.from(data, 'utf-8')).digest('base64')
  try {
    const a = Buffer.from(expected)
    const b = Buffer.from(signature)
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/** Map Twilio's SMS/voice status strings to our attempt status enum. */
function mapStatus(twilioStatus: string): 'delivered' | 'failed' | null {
  switch (twilioStatus) {
    // SMS terminal-success / voice connected.
    case 'delivered':
    case 'completed':
      return 'delivered'
    // SMS + voice terminal-failure variants.
    case 'undelivered':
    case 'failed':
    case 'busy':
    case 'no-answer':
    case 'canceled':
      return 'failed'
    // Intermediate (queued/sending/sent/initiated/ringing/in-progress): ignore.
    default:
      return null
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const params = Object.fromEntries(new URLSearchParams(rawBody)) as Record<string, string>

  // Signature check (validate against the exact URL Twilio was given).
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const signature = request.headers.get('x-twilio-signature') || ''
  if (authToken) {
    const ok = isValidTwilioSignature(authToken, statusCallbackUrl(), params, signature)
    if (!ok) {
      console.warn('[twilio-delivery] invalid X-Twilio-Signature — rejecting')
      return new Response('Invalid signature', { status: 403 })
    }
  }

  // SMS sends MessageSid/MessageStatus; voice sends CallSid/CallStatus.
  const sid = params.MessageSid || params.CallSid || ''
  const twilioStatus = params.MessageStatus || params.CallStatus || ''
  const errorCode = params.ErrorCode || null

  if (!sid || !twilioStatus) {
    // Not a status payload we understand — ack so Twilio doesn't retry.
    return new Response('ok', { status: 200 })
  }

  const mapped = mapStatus(twilioStatus)
  if (!mapped) {
    // Intermediate status — nothing terminal to record yet.
    return new Response('ok', { status: 200 })
  }

  try {
    const sql = db()
    // Update only the matching attempt; leave everything else untouched.
    // delivered_at is set on success; error_code/error captured on failure.
    await sql`
      UPDATE tz_dispatch_attempts
      SET status       = ${mapped},
          delivered_at = CASE WHEN ${mapped} = 'delivered' THEN NOW() ELSE delivered_at END,
          error_code   = COALESCE(${errorCode}, error_code),
          error        = CASE
                           WHEN ${mapped} = 'failed'
                           THEN COALESCE(error, ${'Twilio status ' + twilioStatus + (errorCode ? ' (code ' + errorCode + ')' : '')})
                           ELSE error
                         END
      WHERE twilio_sid = ${sid}
    `
  } catch (err) {
    console.error('[twilio-delivery] DB update failed:', err)
    // Still 200 so Twilio doesn't hammer retries; we logged it.
    return new Response('ok', { status: 200 })
  }

  return new Response('ok', { status: 200 })
}
