#!/usr/bin/env node
/**
 * Seed tz_on_call_schedule from the KB calendar in
 * docs/agent-training-answers.md section 3.
 *
 * Usage:
 *   node scripts/seed-on-call-schedule.mjs
 *
 * Reseeds the supervisor chain (Ty / Tyler / etc.) and the weekly tech
 * rotation for the calendar year. Safe to run repeatedly — clears
 * existing rows first.
 *
 * After a rotation swap, Tyler edits the KB calendar and re-runs this.
 * Later this will be driven from the Switchboard admin chat.
 */

import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env.local') })

const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('Missing POSTGRES_URL / DATABASE_URL')
  process.exit(1)
}

const sql = neon(databaseUrl)
const kbPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'agent-training-answers.md')
const kb = readFileSync(kbPath, 'utf8')

// Supervisor escalation chain (always-on, very long date range).
// Per the SOP, supervisors are Ty / Sam / Tyler.
// Pull from the KB "Supervisor / Owner Escalation" section.
const supervisorBlock = kb.match(
  /### Supervisor \/ Owner Escalation\s+([\s\S]*?)(?:\n###|\n---)/,
)
if (!supervisorBlock) {
  console.error('Could not find Supervisor / Owner Escalation section in KB')
  process.exit(1)
}

const supervisorLines = supervisorBlock[1]
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.startsWith('-'))

const supervisors = supervisorLines.map((line) => {
  // - **Ty Stein** (On-Call Supervisor) — 845-334-1410
  const m = line.match(/\*\*([^*]+)\*\*[^—]*—\s*([\d\-]+)/)
  if (!m) return null
  return { name: m[1].trim(), phone: m[2].trim() }
}).filter(Boolean)

// Also include Sam Tigges from the tech rotation, doubling as supervisor
// per the SOP wording "Ty / Sam / Tyler" — pull his number from the rotation.
const rotationBlock = kb.match(
  /### Primary Weekly On-Call Rotation \(electrical\)\s+([\s\S]*?)(?:\n###|\n---)/,
)
if (!rotationBlock) {
  console.error('Could not find Primary Weekly On-Call Rotation section in KB')
  process.exit(1)
}

const rotationLines = rotationBlock[1]
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => /^\d+\./.test(l))

const techRotation = rotationLines.map((line) => {
  // 1. Sam Tigges — 845-242-0928
  const m = line.match(/\d+\.\s+([^—]+)—\s*([\d\-]+)/)
  if (!m) return null
  return { name: m[1].trim(), phone: m[2].trim() }
}).filter(Boolean)

const samTigges = techRotation.find((t) => /sam tigges/i.test(t.name))
if (samTigges && !supervisors.find((s) => s.name === samTigges.name)) {
  supervisors.unshift(samTigges) // Ty / Sam / Tyler — Sam slots between
}

// Weekly rotation calendar.
const calendarBlock = kb.match(
  /### 2025\/2026 Coverage Calendar\s+\|[^\n]+\n\|[^\n]+\n([\s\S]*?)(?:\n###|\n---)/,
)
if (!calendarBlock) {
  console.error('Could not find 2025/2026 Coverage Calendar in KB')
  process.exit(1)
}

const calendarRows = calendarBlock[1]
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l.startsWith('|') && !l.startsWith('|---'))

// Build full dates from MM/DD ranges. The calendar table runs Dec 29 2025
// through Jan 3 2027 (52 weeks). Resolve year by detecting wrap.
const weeklyRotation = []
let currentYear = 2025
let lastStartMonth = 0
for (const row of calendarRows) {
  const cells = row.split('|').map((c) => c.trim()).filter(Boolean)
  if (cells.length < 3) continue
  const [weekRange, name, phone] = cells
  // weekRange like "12/29 – 1/4"
  const range = weekRange.match(/(\d+)\/(\d+)\s*[–-]\s*(\d+)\/(\d+)/)
  if (!range) continue
  const [, sm, sd, em, ed] = range.map((v) => Number.parseInt(v, 10) || v)
  if (sm < lastStartMonth) currentYear += 1 // wrapped past December
  lastStartMonth = sm
  const startYear = currentYear
  const endYear = em < sm ? currentYear + 1 : currentYear
  weeklyRotation.push({
    name: name.replace(/\s+/g, ' ').trim(),
    phone: phone.replace(/\s+/g, ''),
    startsOn: `${startYear}-${String(sm).padStart(2, '0')}-${String(sd).padStart(2, '0')}`,
    endsOn: `${endYear}-${String(em).padStart(2, '0')}-${String(ed).padStart(2, '0')}`,
  })
}

// HVAC + Plumbing emergency contacts (not in weekly rotation).
const emergencyBlock = kb.match(
  /### HVAC \/ Plumbing Emergency Contacts\s+([\s\S]*?)(?:\n###|\n---)/,
)
const emergencyContacts = emergencyBlock
  ? emergencyBlock[1].split('\n').map((l) => l.trim()).filter((l) => l.startsWith('-')).map((line) => {
      const m = line.match(/-\s*([^—]+)—\s*([\d\-]+)/)
      if (!m) return null
      return { name: m[1].trim(), phone: m[2].trim() }
    }).filter(Boolean)
  : []

// Clear and re-seed.
console.log('Clearing tz_on_call_schedule...')
await sql`DELETE FROM tz_on_call_schedule`

console.log(`Seeding ${supervisors.length} supervisor(s)...`)
for (const s of supervisors) {
  await sql`
    INSERT INTO tz_on_call_schedule (role, person_name, phone, starts_on, ends_on, notes)
    VALUES ('supervisor', ${s.name}, ${s.phone}, '2025-01-01'::date, '2099-12-31'::date,
            'Always-on supervisor escalation chain. Seeded from KB section 3.')
  `
}

console.log(`Seeding ${weeklyRotation.length} weekly tech slot(s)...`)
for (const w of weeklyRotation) {
  await sql`
    INSERT INTO tz_on_call_schedule (role, person_name, phone, starts_on, ends_on, notes)
    VALUES ('tech', ${w.name}, ${w.phone}, ${w.startsOn}::date, ${w.endsOn}::date,
            'Weekly on-call rotation. Seeded from KB section 3.')
  `
}

console.log(`Seeding ${emergencyContacts.length} HVAC/plumbing emergency contact(s)...`)
for (const c of emergencyContacts) {
  // Heuristic: Christopher Weiner = HVAC, Tyler Plaugher = plumbing.
  const role = /weiner/i.test(c.name) ? 'hvac_emergency' : 'plumbing_emergency'
  await sql`
    INSERT INTO tz_on_call_schedule (role, person_name, phone, starts_on, ends_on, notes)
    VALUES (${role}, ${c.name}, ${c.phone}, '2025-01-01'::date, '2099-12-31'::date,
            'Always-on emergency contact (not in weekly tech rotation).')
  `
}

console.log('Done.')
console.log('')
console.log('Sanity check — today\'s on-call:')
const todayIso = new Date().toISOString().slice(0, 10)
const today = await sql`
  SELECT role, person_name, phone, starts_on, ends_on
  FROM tz_on_call_schedule
  WHERE role = 'tech'
    AND starts_on <= ${todayIso}::date
    AND ends_on >= ${todayIso}::date
`
console.log(today)
