/**
 * Lead persistence layer. Every form submission and AI agent intake is
 * write-through here in addition to HCP, so we have a structured source
 * of truth for analytics, search, hidden state, and historical replay
 * that HCP can't surface.
 *
 * As of 2026-04-28 (session 14) tz_leads is also the primary read source
 * for the TZ Switchboard Lead Pipeline view. HCP is still where the
 * office team works (estimates land under each customer), but everything
 * the office sees in HCP is mirrored here via hcp_customer_id +
 * hcp_estimate_id, so the Switchboard view can deep-link without
 * re-fetching from HCP every page load.
 */
import { db } from './db'

export type LeadSource = 'web_form' | 'sms_agent' | 'voice_agent' | 'web_chat' | 'manual'

export type InsertLeadInput = {
  hcpLeadId?: string | null
  hcpCustomerId?: string | null
  hcpEstimateId?: string | null
  hcpCustomerExisting?: boolean | null
  hcpMatchVia?: 'phone' | 'email' | 'name' | null
  hcpError?: string | null
  source: LeadSource
  serviceKey?: string | null
  serviceLabel?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  email?: string | null
  street?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  ownership?: 'homeowner' | 'renter' | null
  landlordName?: string | null
  landlordPhone?: string | null
  landlordEmail?: string | null
  qualification?: Record<string, string> | null
  customerNotes?: string | null
  referralSource?: string | null
  tracking?: Record<string, unknown> | null
  attributionChannel?: string | null
  attributionFirstTouch?: Record<string, unknown> | null
  attributionReferrer?: string | null
  attributionValueCents?: number | null
}

export type StoredLead = {
  id: string
  hcp_lead_id: string | null
  hcp_customer_id: string | null
  hcp_estimate_id: string | null
  hcp_customer_existing: boolean | null
  hcp_match_via: 'phone' | 'email' | 'name' | null
  hcp_error: string | null
  estimate_status: string | null
  estimate_status_synced_at: string | null
  source: LeadSource
  service_key: string | null
  service_label: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  email: string | null
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  ownership: 'homeowner' | 'renter' | null
  landlord_name: string | null
  landlord_phone: string | null
  landlord_email: string | null
  qualification: Record<string, string> | null
  customer_notes: string | null
  referral_source: string | null
  tracking: Record<string, unknown> | null
  attribution_channel: string | null
  attribution_first_touch: Record<string, unknown> | null
  attribution_referrer: string | null
  attribution_value_cents: number | null
  hidden: boolean
  created_at: string
  updated_at: string
}

/**
 * Insert a lead. Returns the generated UUID. Caller logs and continues if
 * this throws — DB persistence is non-blocking for the form submit flow.
 */
export async function insertLead(input: InsertLeadInput): Promise<string> {
  const sql = db()
  const rows = (await sql`
    INSERT INTO tz_leads (
      hcp_lead_id, hcp_customer_id, hcp_estimate_id,
      hcp_customer_existing, hcp_match_via, hcp_error,
      source,
      service_key, service_label,
      first_name, last_name, phone, email,
      street, city, state, zip,
      ownership, landlord_name, landlord_phone, landlord_email,
      qualification, customer_notes, referral_source, tracking,
      attribution_channel, attribution_first_touch, attribution_referrer, attribution_value_cents
    ) VALUES (
      ${input.hcpLeadId ?? null},
      ${input.hcpCustomerId ?? null},
      ${input.hcpEstimateId ?? null},
      ${input.hcpCustomerExisting ?? null},
      ${input.hcpMatchVia ?? null},
      ${input.hcpError ?? null},
      ${input.source},
      ${input.serviceKey ?? null}, ${input.serviceLabel ?? null},
      ${input.firstName ?? null}, ${input.lastName ?? null},
      ${input.phone ?? null}, ${input.email ?? null},
      ${input.street ?? null}, ${input.city ?? null},
      ${input.state ?? null}, ${input.zip ?? null},
      ${input.ownership ?? null},
      ${input.landlordName ?? null}, ${input.landlordPhone ?? null}, ${input.landlordEmail ?? null},
      ${input.qualification ? JSON.stringify(input.qualification) : null}::jsonb,
      ${input.customerNotes ?? null},
      ${input.referralSource ?? null},
      ${input.tracking ? JSON.stringify(input.tracking) : null}::jsonb,
      ${input.attributionChannel ?? null},
      ${input.attributionFirstTouch ? JSON.stringify(input.attributionFirstTouch) : null}::jsonb,
      ${input.attributionReferrer ?? null},
      ${input.attributionValueCents ?? null}
    )
    RETURNING id
  `) as Array<{ id: string }>
  return rows[0].id
}

export type ListLeadsOptions = {
  limit?: number
  offset?: number
  includeHidden?: boolean
}

export async function listStoredLeads(opts: ListLeadsOptions = {}): Promise<StoredLead[]> {
  const sql = db()
  const limit = Math.min(opts.limit ?? 100, 500)
  const offset = opts.offset ?? 0
  if (opts.includeHidden) {
    return (await sql`
      SELECT * FROM tz_leads
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as StoredLead[]
  }
  return (await sql`
    SELECT * FROM tz_leads
    WHERE hidden = FALSE
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as StoredLead[]
}

export async function setLeadHidden(id: string, hidden: boolean): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_leads SET hidden = ${hidden}, updated_at = NOW() WHERE id = ${id}
  `
}

export async function attachHcpLeadId(id: string, hcpLeadId: string): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_leads SET hcp_lead_id = ${hcpLeadId}, updated_at = NOW() WHERE id = ${id}
  `
}

export type AttachHcpEstimateInput = {
  hcpCustomerId: string
  hcpEstimateId?: string | null
  hcpCustomerExisting: boolean
  hcpMatchVia?: 'phone' | 'email' | 'name' | null
  hcpError?: string | null
}

export async function attachHcpEstimate(
  id: string,
  input: AttachHcpEstimateInput,
): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_leads
    SET hcp_customer_id = ${input.hcpCustomerId},
        hcp_estimate_id = ${input.hcpEstimateId ?? null},
        hcp_customer_existing = ${input.hcpCustomerExisting},
        hcp_match_via = ${input.hcpMatchVia ?? null},
        hcp_error = ${input.hcpError ?? null},
        updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function setLeadHcpError(id: string, message: string): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_leads SET hcp_error = ${message}, updated_at = NOW() WHERE id = ${id}
  `
}

/**
 * Lightweight projection of leads that have an HCP estimate id and need
 * their status refreshed. Used by the periodic estimate-status sync. Pass
 * `staleThresholdMs` to skip rows that were synced recently and `limit` to
 * cap the batch (HCP rate-limits ~5 req/sec, so keep this small enough to
 * fit in a single Vercel function invocation).
 */
export type LeadStatusSyncTarget = {
  id: string
  hcp_estimate_id: string
  estimate_status: string | null
  estimate_status_synced_at: string | null
}

export async function listLeadsNeedingStatusSync(
  staleThresholdMs: number,
  limit: number,
): Promise<LeadStatusSyncTarget[]> {
  const sql = db()
  const cutoff = new Date(Date.now() - staleThresholdMs).toISOString()
  return (await sql`
    SELECT id, hcp_estimate_id, estimate_status, estimate_status_synced_at
    FROM tz_leads
    WHERE hcp_estimate_id IS NOT NULL
      AND (estimate_status_synced_at IS NULL OR estimate_status_synced_at < ${cutoff})
    ORDER BY estimate_status_synced_at NULLS FIRST, created_at DESC
    LIMIT ${Math.min(limit, 100)}
  `) as LeadStatusSyncTarget[]
}

export async function setEstimateStatus(
  id: string,
  status: string | null,
): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_leads
    SET estimate_status = ${status},
        estimate_status_synced_at = NOW(),
        updated_at = NOW()
    WHERE id = ${id}
  `
}

export async function markStatusSyncAttempted(id: string): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_leads
    SET estimate_status_synced_at = NOW(),
        updated_at = NOW()
    WHERE id = ${id}
  `
}
