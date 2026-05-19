#!/usr/bin/env node
/**
 * One-off Twilio outbound smoke test. Sends a single SMS to the
 * recipient passed via --to (E.164 or 10-digit US number) using the
 * TWILIO_* env vars already on the project. Used to verify the
 * outbound integration is live before the first real after-hours
 * dispatch fires.
 *
 * Usage:
 *   node scripts/test-twilio-outbound.mjs --to=8459789617
 *   node scripts/test-twilio-outbound.mjs --to=+18459789617 --voice
 *
 * Flags:
 *   --to=NUMBER   destination phone (required)
 *   --voice       also place a test call with a spoken message
 */

import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env.local') })

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const eq = a.indexOf('=')
    if (eq === -1) return [a.replace(/^-+/, ''), true]
    return [a.slice(0, eq).replace(/^-+/, ''), a.slice(eq + 1)]
  }),
)

const to = args.to
if (!to) {
  console.error('Missing --to=NUMBER')
  process.exit(1)
}

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error('Missing TWILIO_* env vars')
  process.exit(1)
}

function normalize(raw) {
  const digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return digits
}

const toE164 = normalize(to)
const auth = 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

console.log(`From: ${TWILIO_PHONE_NUMBER}`)
console.log(`To:   ${toE164}`)
console.log('')

// SMS test
const smsBody = new URLSearchParams({
  To: toE164,
  From: TWILIO_PHONE_NUMBER,
  Body: 'TZ Electric — Twilio outbound smoke test. If you got this, SMS dispatch is live. Reply STOP to opt out.',
})

const smsRes = await fetch(
  `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
  {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: smsBody.toString(),
  },
)
const smsJson = await smsRes.json()
console.log(`SMS:    ${smsRes.status} ${smsRes.ok ? 'OK' : 'FAIL'}`)
console.log(`        sid=${smsJson.sid || 'none'}`)
if (!smsRes.ok) console.log(`        error=${smsJson.message}`)

// Optional voice test
if (args.voice) {
  const twiml =
    '<Response><Say voice="Polly.Joanna-Neural">This is a test call from T Z Electric. The outbound voice integration is working. Goodbye.</Say><Pause length="1"/></Response>'
  const callBody = new URLSearchParams({
    To: toE164,
    From: TWILIO_PHONE_NUMBER,
    Twiml: twiml,
  })
  const callRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
    {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: callBody.toString(),
    },
  )
  const callJson = await callRes.json()
  console.log(`Voice:  ${callRes.status} ${callRes.ok ? 'OK' : 'FAIL'}`)
  console.log(`        sid=${callJson.sid || 'none'}`)
  if (!callRes.ok) console.log(`        error=${callJson.message}`)
}

console.log('')
console.log('Done.')
