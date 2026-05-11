#!/usr/bin/env node
import { Pool } from '@neondatabase/serverless'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { config as loadDotenv } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadDotenv({ path: join(__dirname, '..', '.env.local') })

const needle = process.argv[2]
if (!needle) {
  console.error('usage: node scripts/find-conversation.mjs <id-fragment>')
  process.exit(1)
}

const connStr = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!connStr) {
  console.error('DATABASE_URL_UNPOOLED missing. Run `vercel env pull .env.local --yes` first.')
  process.exit(1)
}

const pool = new Pool({ connectionString: connStr })
try {
  const lowered = needle.toLowerCase().replace(/\s+/g, '')
  const conv = await pool.query(
    `SELECT id, channel, customer_name, customer_phone, customer_email, status, created_at, updated_at, attribution_channel, hcp_customer_id, tz_lead_id
     FROM tz_agent_conversations
     WHERE REPLACE(LOWER(id::text), '-', '') LIKE '%' || $1 || '%'
     ORDER BY created_at DESC LIMIT 5`,
    [lowered]
  )
  if (conv.rows.length === 0) {
    console.error(`no conversation matched fragment "${needle}"`)
    process.exit(1)
  }
  for (const row of conv.rows) {
    console.log('---')
    console.log(row)
    const msgs = await pool.query(
      `SELECT id, role, content, tool_name, tool_input, authored_by, created_at
       FROM tz_agent_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [row.id]
    )
    console.log(`\n${msgs.rows.length} messages:\n`)
    for (const m of msgs.rows) {
      const stamp = new Date(m.created_at).toISOString().slice(11, 19)
      if (m.tool_name) {
        console.log(`[${stamp}] ${m.role}:${m.tool_name} input=${JSON.stringify(m.tool_input)?.slice(0, 400)}`)
      } else {
        const text = String(m.content ?? '').slice(0, 1200)
        console.log(`[${stamp}] ${m.role}${m.authored_by ? ` (${m.authored_by})` : ''}: ${text}`)
      }
    }
  }
} finally {
  await pool.end()
}
