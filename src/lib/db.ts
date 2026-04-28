/**
 * Neon Postgres connection helper.
 *
 * Uses `@neondatabase/serverless` HTTP driver (no connection pooling needed,
 * works in any runtime). Marketplace integration provisions DATABASE_URL
 * automatically in Production / Preview / Development. Local dev pulls via
 * `vercel env pull .env.local --yes`.
 *
 * Tables are prefixed `tz_` so this DB can host other things alongside.
 * See migrations/001_init.sql for the schema. Run `npm run migrate` to apply
 * any new migrations.
 */
import { neon } from '@neondatabase/serverless'

let client: ReturnType<typeof neon> | null = null

export function db() {
  if (client) return client
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Run `vercel env pull .env.local --yes` if developing locally, or attach the Neon DB to the Vercel project.',
    )
  }
  client = neon(url)
  return client
}
