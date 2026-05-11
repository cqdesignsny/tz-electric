#!/usr/bin/env node
import { Pool } from '@neondatabase/serverless'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { config as loadDotenv } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
loadDotenv({ path: join(__dirname, '..', '.env.local') })

const connStr = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!connStr) {
  console.error('DATABASE_URL_UNPOOLED missing.')
  process.exit(1)
}
const pool = new Pool({ connectionString: connStr })
try {
  const r = await pool.query(
    `SELECT * FROM tz_kb_overrides ORDER BY section_path LIMIT 50`
  )
  if (r.rows.length === 0) console.log('(no KB overrides set yet)')
  else for (const row of r.rows) console.log(row)
} finally {
  await pool.end()
}
