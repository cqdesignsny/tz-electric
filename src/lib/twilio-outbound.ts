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

/**
 * Outbound SMS master switch. Until the Twilio number clears A2P 10DLC
 * registration, every outbound SMS is silently rejected by carriers with
 * error 30034 ("message from unregistered number"). Verified 2026-05-28:
 * all 8 recent outbound texts (after-hours dispatch + notify_team_member)
 * came back `undelivered / 30034`. Firing them anyway wastes attempts and
 * records a misleading "sent" status.
 *
 * Default OFF. The moment A2P is approved in Twilio, set
 * `TWILIO_SMS_ENABLED=true` on Vercel and every SMS path (dispatch +
 * team-member paging) starts delivering with no code change.
 */
export function isSmsOutboundEnabled(): boolean {
  return process.env.TWILIO_SMS_ENABLED === 'true'
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
  if (!isSmsOutboundEnabled()) {
    // A2P 10DLC not registered yet — carriers reject with 30034. Short-circuit
    // so callers get an honest "not delivered" result instead of a misleading
    // Twilio-accepted SID that silently fails downstream.
    return { ok: false, error: 'SMS outbound disabled pending A2P 10DLC registration (set TWILIO_SMS_ENABLED=true once approved)' }
  }

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
    // Voice "Polly.Joanna-Neural" is a clean Amazon Polly voice.
    // <Pause length="2"/> at the start gives Twilio's machine-detection
    // a buffer AND gives a live human a moment to put the phone to
    // their ear before the message starts. <Pause length="3"/> at the
    // end keeps Twilio from hanging up too aggressively so the tail of
    // the voicemail recording captures cleanly.
    const safe = input.message.replace(/[<>&"]/g, '')
    const twiml = `<Response><Pause length="2"/><Say voice="Polly.Joanna-Neural">${safe}</Say><Pause length="3"/></Response>`
    params.set('Twiml', twiml)
  }

  // Machine-detection settings so the voicemail-leaving works:
  // DetectMessageEnd waits for the answering-machine greeting to
  // finish before executing TwiML, so the full TTS lands on Jimmy's
  // voicemail instead of getting cut off after one word. Per Tyler
  // 2026-05-27 6:39 PM ("she's not leaving a voicemail or anything").
  // MachineDetectionTimeout=5 keeps live-answer latency short — worst
  // case Jimmy hears 5s of silence if Twilio still hasn't decided.
  params.set('MachineDetection', 'DetectMessageEnd')
  params.set('MachineDetectionTimeout', '5')

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
