#!/usr/bin/env node
/**
 * One-off: send the welcome / invite email to users who were invited
 * before 2026-05-27 PM when the invite-email send was wired up. Before
 * that fix, `inviteUser()` only created a DB row and never told the
 * invitee they had access.
 *
 * Usage:
 *   node scripts/send-pending-invites.mjs           # dry-run (shows what would send)
 *   node scripts/send-pending-invites.mjs --send    # actually fire emails
 *
 * Reads DATABASE_URL_UNPOOLED and RESEND_API_KEY from .env.local in the
 * same dir layout as scripts/migrate.mjs.
 */
import { config } from 'dotenv'
import { Pool } from '@neondatabase/serverless'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, '..', '.env.local') })

const SEND = process.argv.includes('--send')
const SITE_URL = 'https://tzelectricinc.com'
const FROM =
  process.env.AGENT_TRAINING_FROM_EMAIL ||
  'TZ Switchboard <notifications@tzelectricinc.com>'
const REPLY_TO =
  process.env.AGENT_TRAINING_REPLY_TO || 'service@tzelectricinc.com'

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!dbUrl) {
  console.error('Missing DATABASE_URL(_UNPOOLED) in .env.local')
  process.exit(1)
}
const RESEND_API_KEY = process.env.RESEND_API_KEY
if (!RESEND_API_KEY && SEND) {
  console.error('Missing RESEND_API_KEY in .env.local')
  process.exit(1)
}

function buildEmail({ inviteeEmail, role, invitedByEmail }) {
  const loginUrl = `${SITE_URL}/switchboard/login`
  const niceRole = role.charAt(0).toUpperCase() + role.slice(1)
  const subject = `You've been added to TZ Switchboard (${niceRole} access)`

  const html = `<!doctype html><html><body style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1E293B;line-height:1.6;">
    <h2 style="color:#0F1C3F;margin:0 0 12px;">Welcome to TZ Switchboard</h2>
    <p>Hi,</p>
    <p><strong>${invitedByEmail}</strong> gave you access to TZ Switchboard, the internal control center for TZ Electric.</p>
    <p><strong>Your role:</strong> ${niceRole}<br/>
       <strong>Your email:</strong> ${inviteeEmail}</p>
    <p><strong>How to sign in:</strong></p>
    <ol>
      <li>Go to <a href="${loginUrl}" style="color:#1E40AF;">${loginUrl}</a></li>
      <li>Click <strong>Sign in with Google</strong></li>
      <li>Use your <strong>${inviteeEmail}</strong> Google account (no separate password)</li>
    </ol>
    <p style="margin-top:24px;"><a href="${loginUrl}" style="background:#1E40AF;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Sign in to TZ Switchboard</a></p>
    <p style="color:#6B7280;font-size:12px;margin-top:32px;">If "${inviteeEmail}" isn't a Google Workspace account yet, ask Tyler to set one up before signing in. If you weren't expecting this invite, ignore this email.</p>
  </body></html>`

  const text = [
    'Welcome to TZ Switchboard',
    '',
    `${invitedByEmail} gave you access to TZ Switchboard.`,
    '',
    `Role: ${niceRole}`,
    `Email: ${inviteeEmail}`,
    '',
    `Sign in at ${loginUrl} with Google using your ${inviteeEmail} account.`,
    '',
    "If you weren't expecting this invite, ignore this email.",
  ].join('\n')

  return { subject, html, text }
}

async function sendOne({ to, subject, html, text }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to: [to], reply_to: REPLY_TO, subject, html, text }),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => 'unknown')
    throw new Error(`Resend ${res.status}: ${errText}`)
  }
  const body = await res.json()
  return body
}

async function main() {
  const pool = new Pool({ connectionString: dbUrl })
  try {
    const { rows } = await pool.query(
      `SELECT email, role, login_count, invited_by, created_at
       FROM tz_users
       WHERE login_count = 0
         AND disabled_at IS NULL
         AND invited_by IS NOT NULL
       ORDER BY created_at ASC`,
    )
    if (rows.length === 0) {
      console.log('No pending invites — every invited user has signed in at least once.')
      return
    }
    console.log(`Found ${rows.length} pending invites (login_count=0):`)
    for (const r of rows) {
      console.log(`  - ${r.email}  role=${r.role}  invited_by=${r.invited_by}  created=${r.created_at.toISOString()}`)
    }
    if (!SEND) {
      console.log('\nDRY RUN. Re-run with --send to actually fire emails.')
      return
    }
    console.log('\nSending...')
    for (const r of rows) {
      const { subject, html, text } = buildEmail({
        inviteeEmail: r.email,
        role: r.role,
        invitedByEmail: r.invited_by,
      })
      try {
        const body = await sendOne({ to: r.email, subject, html, text })
        console.log(`  ✓ ${r.email}  →  Resend id ${body.id}`)
      } catch (e) {
        console.log(`  ✗ ${r.email}  →  ${e.message}`)
      }
    }
  } finally {
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
