/**
 * Housecall Pro customer mirror — call-time name recognition.
 *
 * A nightly cron (/api/cron/hcp-customer-sync) paginates HCP's /customers
 * endpoint and upserts every customer into the tz_hcp_customers table. The
 * voice route then does a single indexed lookup by the inbound caller's
 * normalized phone, so a returning customer shows up in the call logs by name
 * with no live HCP round-trip during the call.
 *
 * Recognition is SILENT by design (locked session 25): we attach the name +
 * hcp_customer_id to the conversation row, but Claire does NOT greet by name.
 * The lookup result is intentionally NOT fed into buildSystemPrompt.
 *
 * findExistingCustomer() in housecall-pro.ts still hits HCP live and is the
 * right tool for lead CREATION (authoritative, handles new phones/emails).
 * This mirror is purely a fast read cache for call-time recognition.
 */
import { db } from './db'

const HCP_BASE = 'https://api.housecallpro.com'

function getApiKey(): string {
  const key = process.env.HOUSECALL_PRO_API_KEY
  if (!key) throw new Error('HOUSECALL_PRO_API_KEY environment variable is not set')
  return key
}

/**
 * Normalize to a bare 10-digit US phone string, or null. MUST stay in lockstep
 * with the voice route's normalizePhone() so the stored key matches the
 * call-time lookup key. Strips a leading US country code and all punctuation.
 */
export function normalizeMobile10(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  if (digits.length === 10) return digits
  return null
}

type HcpCustomerApi = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  mobile_number: string | null
  home_number: string | null
  work_number: string | null
  addresses?: Array<{
    street?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
  }> | null
}

export type HcpCustomerMatch = {
  hcpCustomerId: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
}

/**
 * Call-time lookup. Returns a returning customer by normalized 10-digit phone,
 * or null on miss / error. Never throws — recognition is a nice-to-have and
 * must never block or fail an inbound call.
 */
export async function lookupHcpCustomerByPhone(
  phone10: string | null,
): Promise<HcpCustomerMatch | null> {
  if (!phone10) return null
  try {
    const sql = db()
    const rows = (await sql`
      SELECT hcp_customer_id, first_name, last_name
      FROM tz_hcp_customers
      WHERE mobile_phone = ${phone10}
      ORDER BY last_synced_at DESC
      LIMIT 1
    `) as Array<{ hcp_customer_id: string; first_name: string | null; last_name: string | null }>
    if (rows.length === 0) return null
    const r = rows[0]
    const fullName = [r.first_name, r.last_name].filter(Boolean).join(' ').trim() || null
    return { hcpCustomerId: r.hcp_customer_id, firstName: r.first_name, lastName: r.last_name, fullName }
  } catch (err) {
    console.error('[hcp-customers] lookupHcpCustomerByPhone error:', err)
    return null
  }
}

async function fetchCustomersPage(
  page: number,
  pageSize: number,
): Promise<{ customers: HcpCustomerApi[]; totalPages: number }> {
  const res = await fetch(`${HCP_BASE}/customers?page=${page}&page_size=${pageSize}`, {
    headers: { Authorization: `Bearer ${getApiKey()}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`HCP /customers page ${page} error ${res.status}: ${await res.text()}`)
  }
  const data = await res.json()
  return { customers: data.customers || [], totalPages: data.total_pages ?? 1 }
}

export type SyncResult = {
  pages: number
  fetched: number
  upserted: number
  withoutPhone: number
}

/**
 * Full paginate-and-upsert of HCP customers into tz_hcp_customers. Upserts are
 * batched one HTTP round-trip per page via sql.transaction(), keyed on
 * hcp_customer_id so reruns are idempotent. ~3,600 customers / 100 per page =
 * ~37 round-trips, well inside the cron's maxDuration.
 *
 * Customers with no usable phone are still mirrored (counted in withoutPhone);
 * they simply never match a phone lookup. mobile_phone falls back to
 * home/work numbers when mobile is blank.
 */
export async function syncHcpCustomers(
  opts: { pageSize?: number; maxPages?: number } = {},
): Promise<SyncResult> {
  const sql = db()
  const pageSize = opts.pageSize ?? 100
  let page = 1
  let totalPages = 1
  let fetched = 0
  let upserted = 0
  let withoutPhone = 0

  do {
    const { customers, totalPages: tp } = await fetchCustomersPage(page, pageSize)
    totalPages = tp

    const fragments = customers.map((c) => {
      fetched++
      const mobile10 =
        normalizeMobile10(c.mobile_number) ||
        normalizeMobile10(c.home_number) ||
        normalizeMobile10(c.work_number)
      if (!mobile10) withoutPhone++
      const addr = (c.addresses && c.addresses[0]) || {}
      return sql`
        INSERT INTO tz_hcp_customers (
          hcp_customer_id, first_name, last_name, mobile_phone, email,
          street, city, state, zip, last_synced_at
        ) VALUES (
          ${c.id}, ${c.first_name ?? null}, ${c.last_name ?? null}, ${mobile10}, ${c.email ?? null},
          ${addr.street ?? null}, ${addr.city ?? null}, ${addr.state ?? null}, ${addr.zip ?? null}, NOW()
        )
        ON CONFLICT (hcp_customer_id) DO UPDATE SET
          first_name     = EXCLUDED.first_name,
          last_name      = EXCLUDED.last_name,
          mobile_phone   = EXCLUDED.mobile_phone,
          email          = EXCLUDED.email,
          street         = EXCLUDED.street,
          city           = EXCLUDED.city,
          state          = EXCLUDED.state,
          zip            = EXCLUDED.zip,
          last_synced_at = NOW(),
          updated_at     = NOW()
      `
    })

    if (fragments.length > 0) {
      await sql.transaction(fragments)
      upserted += fragments.length
    }

    if (opts.maxPages && page >= opts.maxPages) break
    page++
  } while (page <= totalPages)

  return { pages: Math.min(page, totalPages), fetched, upserted, withoutPhone }
}
