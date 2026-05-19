/**
 * Outbound Twilio helpers — SMS and Voice via the REST API directly
 * (no SDK dependency). Used by the after-hours dispatch flow to text
 * + call the on-call technician and the supervisor escalation chain.
 *
 * Env vars (already set on Vercel, see HANDOFF):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER  — the FROM number (E.164 like +15186786153)
 */

type SendSmsInput = {
  to: string
  body: string
}

type PlaceCallInput = {
  to: string
  /** Spoken message (the cron worker turns this into TwiML <Say>). */
  message: string
  /** Optional callback URL Twilio fetches for additional TwiML. */
  twimlUrl?: string
}

export type TwilioOutboundResult =
  | { ok: true; sid: string }
  | { ok: false; error: string }

function getCreds(): { sid: string; token: string; from: string } | null {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER
  if (!sid || !token || !from) return null
  return { sid, token, from }
}

function basicAuth(sid: string, token: string): string {
  return 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64')
}

/** E.164-ish normalize. Accepts (518) 678-1230, 5186781230, +15186781230. */
export function normalizePhoneE164(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits
}

export async function sendSms(input: SendSmsInput): Promise<TwilioOutboundResult> {
  const creds = getCreds()
  if (!creds) {
    return { ok: false, error: 'TWILIO_* env vars missing' }
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${creds.sid}/Messages.json`
  const body = new URLSearchParams({
    To: normalizePhoneE164(input.to),
    From: creds.from,
    Body: input.body,
  })

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: basicAuth(creds.sid, creds.token),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
    const json = (await res.json()) as { sid?: string; message?: string; code?: number }
    if (!res.ok) {
      return { ok: false, error: json.message || `Twilio SMS failed (${res.status})` }
    }
    return { ok: true, sid: json.sid || '' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

export async function placeCall(input: PlaceCallInput): Promise<TwilioOutboundResult> {
  const creds = getCreds()
  if (!creds) {
    return { ok: false, error: 'TWILIO_* env vars missing' }
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${creds.sid}/Calls.json`
  const params = new URLSearchParams({
    To: normalizePhoneE164(input.to),
    From: creds.from,
  })

  if (input.twimlUrl) {
    params.set('Url', input.twimlUrl)
  } else {
    // Inline TwiML for a single-spoken-message ringer.
    // Voice "Polly.Joanna-Neural" is a clean Amazon Polly voice;
    // hangs up after the message + brief pause.
    const safe = input.message.replace(/[<>&"]/g, '')
    const twiml = `<Response><Say voice="Polly.Joanna-Neural">${safe}</Say><Pause length="2"/></Response>`
    params.set('Twiml', twiml)
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: basicAuth(creds.sid, creds.token),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const json = (await res.json()) as { sid?: string; message?: string; code?: number }
    if (!res.ok) {
      return { ok: false, error: json.message || `Twilio call failed (${res.status})` }
    }
    return { ok: true, sid: json.sid || '' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}
