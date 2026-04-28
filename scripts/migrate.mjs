#!/usr/bin/env node
/**
 * Run any pending SQL migrations against the Neon database.
 *
 * Usage:
 *   node scripts/migrate.mjs
 *
 * Requires DATABASE_URL_UNPOOLED in the environment (set by `vercel env pull`).
 * Uses the unpooled connection because some statements (CREATE TYPE, etc.)
 * don't play nice with PgBouncer's transaction mode pooling.
 *
 * Tracks applied migrations in a `_migrations` table so reruns are safe.
 */
import { Pool } from '@neondatabase/serverless'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { config as loadDotenv } from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..')
loadDotenv({ path: join(repoRoot, '.env.local') })

const connStr = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!connStr) {
  console.error('DATABASE_URL_UNPOOLED (or DATABASE_URL) is not set. Run `vercel env pull .env.local --yes` first.')
  process.exit(1)
}

const pool = new Pool({ connectionString: connStr })

async function main() {
  const migrationsDir = join(repoRoot, 'migrations')
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const applied = await pool.query('SELECT filename FROM _migrations')
  const appliedSet = new Set(applied.rows.map((r) => r.filename))

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`SKIP   ${file}`)
      continue
    }
    const sql = readFileSync(join(migrationsDir, file), 'utf-8')
    console.log(`APPLY  ${file}`)
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`DONE   ${file}`)
    } catch (e) {
      await client.query('ROLLBACK')
      console.error(`FAIL   ${file}`)
      console.error(e)
      process.exit(1)
    } finally {
      client.release()
    }
  }

  await pool.end()
  console.log('All migrations applied.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
