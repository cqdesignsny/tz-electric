#!/usr/bin/env node
/**
 * One-shot: walk every voice conversation in tz_agent_conversations,
 * fetch the matching Vapi call's artifact, and persist any user +
 * assistant turns that aren't already in tz_agent_messages.
 *
 * Needed because the original handleEndOfCallReport filter rejected
 * Vapi's `bot` role (Claire's side), so early calls landed with only
 * the user side of the transcript. The route handler now maps `bot` →
 * `assistant`; this script catches up the historical rows.
 *
 * Idempotent: each artifact message is keyed by `external_id =
 * "${callId}:${time}"` so reruns won't duplicate.
 *
 * Usage: node scripts/backfill-voice-transcripts.mjs [--dry-run]
 *
 * Requires DATABASE_URL_UNPOOLED + VAPI_PRIVATE_KEY in .env.local.
 */
import { Pool } from '@neondatabase/serverless'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { config as loadDotenv } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadDotenv({ path: join(__dirname, '..', '.env.local') })

const dryRun = process.argv.includes('--dry-run')
const connStr = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
const vapiKey = process.env.VAPI_PRIVATE_KEY
if (!connStr) {
  console.error('DATABASE_URL_UNPOOLED missing in .env.local')
  process.exit(1)
}
if (!vapiKey) {
  console.error('VAPI_PRIVATE_KEY missing in .env.local')
  process.exit(1)
}

const pool = new Pool({ connectionString: connStr })

async function fetchVapiCall(callId) {
  const res = await fetch(`https://api.vapi.ai/call/${callId}`, {
    headers: { Authorization: `Bearer ${vapiKey}` },
  })
  if (!res.ok) {
    throw new Error(`Vapi GET /call/${callId} → ${res.status} ${await res.text()}`)
  }
  return res.json()
}

function normalize(role) {
  if (role === 'user') return 'user'
  if (role === 'assistant' || role === 'bot') return 'assistant'
  return null
}

try {
  const convs = (await pool.query(
    `SELECT id, external_call_id, customer_phone, created_at
     FROM tz_agent_conversations
     WHERE channel = 'voice' AND external_call_id IS NOT NULL
     ORDER BY created_at DESC`
  )).rows
  console.log(`scanning ${convs.length} voice conversations...`)

  let totalInserted = 0
  for (const c of convs) {
    let call
    try {
      call = await fetchVapiCall(c.external_call_id)
    } catch (e) {
      console.warn(`  ${c.external_call_id}: ${e.message}`)
      continue
    }
    const msgs = call?.artifact?.messages ?? []
    let inserted = 0
    for (const m of msgs) {
      const role = normalize(m.role)
      if (!role) continue
      const text = (m.message ?? '').trim()
      if (!text) continue
      const externalId = m.time ? `${c.external_call_id}:${m.time}` : null
      if (!externalId) continue

      // Skip if we already have this exact turn.
      const exists = (await pool.query(
        `SELECT 1 FROM tz_agent_messages
         WHERE conversation_id = $1 AND external_id = $2
         LIMIT 1`,
        [c.id, externalId]
      )).rowCount
      if (exists) continue

      if (dryRun) {
        console.log(`  [DRY] ${c.external_call_id} ${role}: ${text.slice(0, 80)}`)
      } else {
        await pool.query(
          `INSERT INTO tz_agent_messages (conversation_id, role, content, external_id)
           VALUES ($1, $2, $3, $4)`,
          [c.id, role, text, externalId]
        )
      }
      inserted++
    }
    if (inserted) {
      console.log(`  ${c.external_call_id} (${c.customer_phone || '-'}): +${inserted} message(s)`)
      totalInserted += inserted
    }
  }

  console.log(`\n${dryRun ? '[DRY] would insert' : 'inserted'} ${totalInserted} message(s)`)
} finally {
  await pool.end()
}
