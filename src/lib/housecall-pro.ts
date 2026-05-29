import { sendPlanSignupEmail } from './agent-notifications'

const HCP_BASE = 'https://api.housecallpro.com'

function getApiKey(): string {
  const key = process.env.HOUSECALL_PRO_API_KEY
  if (!key) throw new Error('HOUSECALL_PRO_API_KEY environment variable is not set')
  return key
}

async function hcpFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${HCP_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HCP API error ${res.status}: ${body}`)
  }

  return res.json()
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export type HCPAddress = {
  id: string
  type: string
  street: string
  street_line_2: string | null
  city: string
  state: string
  zip: string
}

export type HCPCustomer = {
  id: string
  first_name: string
  last_name: string
  email: string
  mobile_number: string
  home_number: string | null
  work_number: string | null
  notes: string | null
  tags: string[]
  addresses: HCPAddress[]
}

export type CustomerData = {
  firstName: string
  lastName: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
}

export type PlanInfo = {
  planName: string
  templateName: string
  billingCycle: 'Monthly' | 'Yearly'
  frequency: string
  amount: number
}

/**
 * Find an existing HCP customer by phone with optional name match. Used by the
 * plan-signup flow which needs an exact identity match before tagging.
 */
export async function searchCustomer(phone: string, firstName: string, lastName: string): Promise<HCPCustomer | null> {
  const normalized = normalizePhone(phone)

  try {
    const data = await hcpFetch(`/customers?phone_number=${encodeURIComponent(normalized)}`)
    const customers: HCPCustomer[] = data.customers || []

    const fullNameLower = `${firstName} ${lastName}`.toLowerCase()
    const match = customers.find((c) => {
      const hcpName = `${c.first_name} ${c.last_name}`.toLowerCase()
      return hcpName === fullNameLower
    })

    return match || null
  } catch (error) {
    console.error('HCP searchCustomer error:', error)
    return null
  }
}

/**
 * Find a customer by phone alone, returning the most likely match. Retained
 * for any caller that has only a phone number; new code should prefer
 * findExistingCustomer (which also matches on email and name).
 */
export async function findCustomerByPhone(phone: string): Promise<HCPCustomer | null> {
  const normalized = normalizePhone(phone)
  if (!normalized) return null

  try {
    const data = await hcpFetch(`/customers?phone_number=${encodeURIComponent(normalized)}`)
    const customers: HCPCustomer[] = data.customers || []
    if (customers.length === 0) return null
    return customers[0]
  } catch (error) {
    console.error('HCP findCustomerByPhone error:', error)
    return null
  }
}

/**
 * Find an existing HCP customer by ANY of phone, email, or full name.
 * Per Tyler's 2026-04-28 routing rules, a returning customer should be
 * matched if any single one of those three fields hits a record in HCP —
 * not all three combined. Examples this catches that phone-only would miss:
 *
 *   - Same person, new phone (matches by email or name)
 *   - Same person, mistyped name (matches by phone or email)
 *   - Spouse / household member submits with shared email (matches by email)
 *
 * Strategy: fire all three lookups in parallel, dedupe by customer id, and
 * return the first hit. Phone match is still the strongest signal so it's
 * preferred when multiple lookups hit different customers; falls back to
 * email, then name.
 *
 * Returns null on total miss or any unrecoverable error so callers can fall
 * through to creating a new customer.
 */
export type ExistingCustomerLookup = {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
}

export type ExistingCustomerMatch = {
  customer: HCPCustomer
  matchedBy: 'phone' | 'email' | 'name'
}

async function searchCustomersByQuery(query: string): Promise<HCPCustomer[]> {
  const trimmed = query.trim()
  if (!trimmed) return []
  try {
    const data = await hcpFetch(`/customers?q=${encodeURIComponent(trimmed)}`)
    return (data.customers as HCPCustomer[]) || []
  } catch (error) {
    console.error(`HCP /customers?q=${query} error:`, error)
    return []
  }
}

async function searchCustomersByPhone(phone: string): Promise<HCPCustomer[]> {
  const normalized = normalizePhone(phone)
  if (!normalized) return []
  try {
    const data = await hcpFetch(
      `/customers?phone_number=${encodeURIComponent(normalized)}`,
    )
    const customers = (data.customers as HCPCustomer[]) || []
    // HCP silently ignores the phone_number filter and returns its first
    // page of customers regardless of input (verified empirically
    // 2026-04-28). Filter client-side by exact match against any of the
    // customer's three phone fields.
    return customers.filter((c) => {
      const candidates = [c.mobile_number, c.home_number, c.work_number]
        .filter((n): n is string => !!n)
        .map(normalizePhone)
      return candidates.includes(normalized)
    })
  } catch (error) {
    console.error(`HCP /customers?phone_number=${normalized} error:`, error)
    return []
  }
}

export async function findExistingCustomer(
  lookup: ExistingCustomerLookup,
): Promise<ExistingCustomerMatch | null> {
  const fullName =
    [lookup.firstName?.trim(), lookup.lastName?.trim()]
      .filter(Boolean)
      .join(' ') || ''

  const tasks: Array<Promise<{ via: 'phone' | 'email' | 'name'; customers: HCPCustomer[] }>> = []
  if (lookup.phone) {
    tasks.push(
      searchCustomersByPhone(lookup.phone).then((customers) => ({
        via: 'phone',
        customers,
      })),
    )
  }
  if (lookup.email && lookup.email.trim()) {
    tasks.push(
      searchCustomersByQuery(lookup.email.trim()).then((customers) => ({
        via: 'email',
        // HCP /customers?q= matches across multiple fields so re-filter to
        // confirm the email actually appears on the customer record.
        customers: customers.filter(
          (c) => (c.email || '').toLowerCase() === lookup.email!.trim().toLowerCase(),
        ),
      })),
    )
  }
  if (fullName) {
    tasks.push(
      searchCustomersByQuery(fullName).then((customers) => ({
        via: 'name',
        // Confirm the full name actually matches; q= can return partial hits.
        customers: customers.filter((c) => {
          const hcpName = `${c.first_name || ''} ${c.last_name || ''}`
            .trim()
            .toLowerCase()
          return hcpName === fullName.toLowerCase()
        }),
      })),
    )
  }

  if (tasks.length === 0) return null

  const results = await Promise.all(tasks)
  // Phone is the strongest signal, then email, then name. Order results
  // accordingly; first non-empty wins.
  const order: Array<'phone' | 'email' | 'name'> = ['phone', 'email', 'name']
  for (const via of order) {
    const hit = results.find((r) => r.via === via && r.customers.length > 0)
    if (hit) return { customer: hit.customers[0], matchedBy: hit.via }
  }
  return null
}

export async function createCustomer(data: CustomerData, planInfo: PlanInfo): Promise<HCPCustomer> {
  const tag = `${planInfo.planName}-${planInfo.billingCycle}`
  const note = `ONLINE SIGNUP: ${planInfo.templateName} (${planInfo.billingCycle}, $${planInfo.amount}${planInfo.frequency === 'monthly' || planInfo.frequency === '3year' ? '/mo' : '/yr'}). Paid via Stripe on ${new Date().toISOString().split('T')[0]}. Needs manual plan assignment in HCP.`

  return hcpFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({
      first_name: data.firstName,
      last_name: data.lastName,
      mobile_number: normalizePhone(data.phone),
      addresses: [
        {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
          type: 'service',
        },
      ],
      tags: [tag],
      notes: note,
    }),
  })
}

/**
 * Bare-bones customer creation for the lead-form flow. Deliberately leaves
 * `notes` blank: per Tyler (2026-04-28), customer.notes is reserved for
 * persistent customer info ("don't wear shoes in the house") and should NOT
 * be polluted with job-specific lead details. Job details belong in the
 * estimate's private notes.
 */
export type LeadCustomerInput = {
  firstName: string
  lastName: string
  phone: string
  email?: string
  street?: string
  city?: string
  state?: string
  zip?: string
}

export async function createCustomerForLead(
  input: LeadCustomerInput,
): Promise<HCPCustomer> {
  const customer: Record<string, unknown> = {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    mobile_number: normalizePhone(input.phone),
  }
  if (input.email) customer.email = input.email.trim()

  if (input.street && input.city && input.state && input.zip) {
    customer.addresses = [
      {
        street: input.street,
        city: input.city,
        state: input.state,
        zip: input.zip,
        type: 'service',
      },
    ]
  }

  return hcpFetch('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  })
}

/**
 * Lead form submission via /leads (legacy path). Lands in HCP Job Inbox >
 * "API Leads" channel. Retained for reference; the website lead form has
 * moved to the create-customer + create-estimate path (see
 * createEstimateForLead) per Tyler's 2026-04-28 routing change. We still
 * call /leads alongside the estimate via createInboxLeadForEstimate
 * (below) so the office gets Job Inbox visibility on every new lead.
 *
 * Payload shape was verified empirically against the live HCP API on
 * 2026-04-27 (test leads numbered 14, 15, 17). HCP silently drops
 * unknown fields rather than echoing them back, so the only fields
 * that actually persist are:
 *   - customer.first_name, customer.last_name
 *   - customer.mobile_number  (NOT `phone`)
 *   - customer.email
 *   - customer.notes          (NOT top-level `notes`)
 *   - address.{street,city,state,zip}  (no `type` field)
 *   - tags (top-level array of strings)
 */
export type LeadPayload = {
  firstName: string
  lastName: string
  phone: string
  email?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  serviceType: string
  source: 'Website Lead Form' | 'TZ AI Agent'
  notes: string
  tags?: string[]
}

export type HCPLeadResponse = {
  id?: string
  [key: string]: unknown
}

export async function createLead(lead: LeadPayload): Promise<HCPLeadResponse> {
  const customer: Record<string, string> = {
    first_name: lead.firstName.trim(),
    last_name: lead.lastName.trim(),
    mobile_number: normalizePhone(lead.phone),
    notes: lead.notes,
  }
  if (lead.email) customer.email = lead.email

  const body: Record<string, unknown> = {
    customer,
    tags: lead.tags && lead.tags.length > 0 ? lead.tags : undefined,
  }

  if (lead.street && lead.city && lead.state && lead.zip) {
    body.address = {
      street: lead.street,
      city: lead.city,
      state: lead.state,
      zip: lead.zip,
    }
  }

  return hcpFetch('/leads', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Create an unscheduled estimate against an existing customer. Lead/job
 * details go in the option's `notes` array (office-internal, never
 * customer-facing) rather than customer.notes, which is reserved for
 * persistent customer info. Tags surface on the option row in HCP for
 * at-a-glance triage.
 *
 * Empirically verified on 2026-04-28 with two test submissions:
 *   - HCP /estimates REQUIRES an `options` array (returns
 *     `{"errors":{"options":"is missing"}}` if absent).
 *   - Top-level `private_notes`, `notes`, `description`, `tags` are
 *     silently dropped — none are real fields.
 *   - The right place for office-internal notes is `option.notes`, an
 *     array of `{content: string}` objects. Confirmed by reading back
 *     real estimates that have notes populated (e.g. 19917, 19918).
 *   - `option.tags` is the right place for triage tags.
 *   - `option.message` would be customer-facing — never put internal
 *     qualification answers there.
 *   - Estimates created this way land with `work_status: "needs
 *     scheduling"` which is the unscheduled-open state.
 */
export type EstimateInput = {
  customerId: string
  /** Goes into option.notes — office-internal, never shown to the customer. */
  privateNotes: string
  /** Becomes the option name (estimate row label in HCP). */
  description?: string
  /** Goes onto option.tags for at-a-glance row triage in HCP. */
  tags?: string[]
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
  /**
   * HCP business_unit UUID. Auto-populates the Business Unit field on the
   * estimate so the office can filter by vertical (Plumbing / HVAC /
   * Electrical) without manually tagging each estimate.
   *
   * Empirically verified 2026-05-08: HCP validates this field at create
   * time and returns 422 "unknown <id> provided" if the UUID isn't real.
   * The other variants we tried (business_unit_id, business_unit,
   * business_unit_name, estimate_fields.business_unit) are silently
   * dropped. Job_type_uuid is accepted on the request but doesn't stick
   * on the estimate (job_type is a JOB-level field, not estimate-level).
   *
   * UUIDs are NOT exposed via the public API (/business_units returns
   * 404). They have to be grabbed from the HCP UI's network requests.
   * See HCP_BUSINESS_UNITS in src/lib/constants.ts.
   */
  businessUnitUuid?: string

  /**
   * HCP lead_source. When set, the estimate appears in HCP's Inbox card
   * with the lead source label and the option.notes shown as "Additional
   * notes" — same UX as Google's "Reserve with Google" integration. This
   * is THE way to make our leads look like Google's Inbox cards.
   *
   * HCP enforces a whitelist of preset lead source values. Verified
   * empirically 2026-05-08:
   *   - "Website" → accepted
   *   - "API Leads" → accepted
   *   - "TZ AI Agent" → 422 "Lead source not found"
   *   - "Web Form" → 422 "Lead source not found"
   *
   * Preset values are configured in HCP under Settings > Lead Sources.
   * Tyler can add custom ones (e.g. "Claire AI") via the HCP UI; once
   * added they become valid here. Default to "Website" until then.
   */
  leadSource?: string
}

export type HCPEstimateResponse = {
  id?: string
  number?: string | number
  [key: string]: unknown
}

/**
 * Drop a Job Inbox entry alongside the estimate so the office sees new
 * leads at a glance in HCP's "API Leads" channel and can click straight
 * through to the customer (and from there to the open estimate). Unlike
 * the legacy createLead flow, this attaches the inbox lead to an
 * EXISTING customer via top-level `customer_id` — verified empirically
 * 2026-04-28 — so we don't end up with duplicate customer records.
 *
 * Empirical findings on POST /leads with customer_id:
 *   - `customer_id` at the top level: 201 Created, attaches to the
 *     existing customer cleanly (no duplicate).
 *   - Nested `customer.id`: 400 Bad Request — wrong shape.
 *   - Sending a `customer` object with phone matching an existing record
 *     creates a DUPLICATE customer rather than matching. Always prefer
 *     `customer_id`.
 *   - `tags` (top-level array of strings) accepted and shown on the
 *     Job Inbox card preview. Same tags we put on the estimate option
 *     so triage is consistent across both surfaces.
 *   - `address` accepted; helpful when the inbox shows location.
 *
 * Failures are non-fatal: the estimate already exists, so a missing
 * inbox entry just means the office has to find it via the Estimates
 * list instead of the Job Inbox.
 */
export type InboxLeadInput = {
  customerId: string
  tags?: string[]
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
}

export async function createInboxLeadForEstimate(
  input: InboxLeadInput,
): Promise<HCPLeadResponse> {
  const body: Record<string, unknown> = {
    customer_id: input.customerId,
  }
  if (input.tags && input.tags.length > 0) body.tags = input.tags
  if (input.address) body.address = input.address

  return hcpFetch('/leads', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export type CreateEstimateForLeadResult = {
  estimate: HCPEstimateResponse
  noteAttachError?: string
}

export async function createEstimateForLead(
  input: EstimateInput,
): Promise<CreateEstimateForLeadResult> {
  const optionName = input.description?.trim() || 'Website lead'

  const body: Record<string, unknown> = {
    customer_id: input.customerId,
    options: [
      {
        name: optionName,
        tags: input.tags && input.tags.length > 0 ? input.tags : undefined,
      },
    ],
  }
  if (input.address) body.address = input.address
  if (input.businessUnitUuid) body.business_unit_uuid = input.businessUnitUuid
  if (input.leadSource) body.lead_source = input.leadSource

  const estimate = (await hcpFetch('/estimates', {
    method: 'POST',
    body: JSON.stringify(body),
  })) as HCPEstimateResponse

  // Notes can't be set in the create payload (HCP drops `notes` on options
  // at create time, verified empirically 2026-04-28). Add the office-
  // internal note in a second call to the option's notes endpoint —
  // POST /estimates/{eid}/options/{oid}/notes is the documented insert
  // path. Failures here are non-fatal: the estimate already exists with
  // its tags, so we record the error but keep returning the estimate id
  // so the Switchboard can deep-link.
  const options = (estimate as { options?: Array<{ id?: string }> }).options
  const optionId = options?.[0]?.id
  let noteAttachError: string | undefined

  if (optionId && estimate.id && input.privateNotes) {
    try {
      await hcpFetch(
        `/estimates/${encodeURIComponent(estimate.id)}/options/${encodeURIComponent(
          optionId,
        )}/notes`,
        {
          method: 'POST',
          body: JSON.stringify({ content: input.privateNotes }),
        },
      )
    } catch (e) {
      noteAttachError = e instanceof Error ? e.message : String(e)
      console.error('[hcp] estimate created but note attach failed:', noteAttachError)
    }
  }

  return { estimate, noteAttachError }
}

/**
 * Read a single estimate by id. Used by the periodic status sync — when the
 * office flips an estimate Won/Lost in HCP, we read the new status here and
 * mirror it onto the matching tz_leads row so the TZ Switchboard Lead
 * Pipeline can filter and badge it without a roundtrip to HCP per page load.
 *
 * Returns null on any error so the sync loop can keep going for the rest
 * of the batch.
 *
 * Empirically verified estimate response fields (2026-04-28): top-level
 * `work_status` carries the scheduling/lifecycle state (e.g. "needs
 * scheduling"). Each option has its own `status` and `approval_status` —
 * `approval_status` flips to "approved" / "declined" when the office uses
 * the Won/Lost buttons. We sync on whichever signal is present.
 */
export type HCPEstimateOption = {
  id: string
  name: string | null
  status?: string | null
  approval_status?: string | null
  total_amount?: number | null
}

export type HCPEstimate = {
  id: string
  estimate_number?: string | null
  work_status?: string | null
  customer_id?: string | null
  options?: HCPEstimateOption[] | null
  [key: string]: unknown
}

export async function getEstimate(estimateId: string): Promise<HCPEstimate | null> {
  try {
    return (await hcpFetch(
      `/estimates/${encodeURIComponent(estimateId)}`,
    )) as HCPEstimate
  } catch (e) {
    console.error('[hcp] getEstimate failed:', e)
    return null
  }
}

/**
 * Reduce HCP's raw status string + option-level approval state into the
 * three categories the Lead Pipeline UI cares about. The office flips
 * estimates between states using HCP's UI; we look at any signal that
 * indicates won (approved/booked/scheduled) or lost (declined/canceled).
 * Anything we don't recognize stays as "open" so the lead remains
 * actionable.
 */
export type EstimateStatusCategory = 'open' | 'won' | 'lost'

export function categorizeEstimateStatus(
  raw: string | null | undefined,
  estimate?: HCPEstimate | null,
): EstimateStatusCategory {
  const signals: string[] = []
  if (raw) signals.push(raw.toLowerCase())
  if (estimate?.work_status) signals.push(estimate.work_status.toLowerCase())
  for (const opt of estimate?.options || []) {
    if (opt.approval_status) signals.push(opt.approval_status.toLowerCase())
    if (opt.status) signals.push(opt.status.toLowerCase())
  }

  const wonHits = ['won', 'approved', 'accepted', 'booked', 'completed', 'scheduled']
  const lostHits = ['lost', 'declined', 'canceled', 'cancelled', 'rejected']

  if (signals.some((s) => lostHits.some((h) => s.includes(h)))) return 'lost'
  if (signals.some((s) => wonHits.some((h) => s.includes(h)))) return 'won'
  return 'open'
}

/**
 * Pick the best raw status string from an estimate to display in the UI.
 * Top-level work_status is preferred when it conveys lifecycle state;
 * falls back to the first option's approval_status / status.
 */
export function rawEstimateStatus(estimate: HCPEstimate | null | undefined): string | null {
  if (!estimate) return null
  if (estimate.work_status) return estimate.work_status
  const first = estimate.options?.[0]
  if (first?.approval_status) return first.approval_status
  if (first?.status) return first.status
  return null
}

/**
 * Lead read endpoints. Retained for reference and for any code path that
 * still wants to see the legacy /leads inbox. The TZ Switchboard Lead
 * Pipeline view now reads from tz_leads (Neon) — see leads-store.ts.
 */
export type HCPLead = {
  id: string
  number: number
  customer: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    mobile_number: string | null
    home_number: string | null
    work_number: string | null
    notes: string | null
    lead_source: string | null
    created_at: string
    updated_at: string
  }
  address: {
    street: string | null
    street_line_2: string | null
    city: string | null
    state: string | null
    zip: string | null
  }
  status: string
  pipeline_status: string | null
  tags: string[]
  total_amount: number
  assigned_employee: unknown
  conversions: unknown[]
  lost_at: string | null
  job_fields: { job_type_uuid: string | null; business_unit_uuid: string | null }
}

export type ListLeadsOptions = {
  pageSize?: number
  page?: number
  sortBy?: 'created_at' | 'updated_at'
  sortDirection?: 'asc' | 'desc'
}

export async function listLeads(opts: ListLeadsOptions = {}): Promise<{
  leads: HCPLead[]
  totalItems: number
  totalPages: number
  page: number
}> {
  const params = new URLSearchParams({
    page_size: String(opts.pageSize ?? 100),
    page: String(opts.page ?? 1),
    sort_by: opts.sortBy ?? 'created_at',
    sort_direction: opts.sortDirection ?? 'desc',
  })
  const data = await hcpFetch(`/leads?${params.toString()}`)
  return {
    leads: data.leads || [],
    totalItems: data.total_items || 0,
    totalPages: data.total_pages || 1,
    page: data.page || 1,
  }
}

export async function getLead(leadId: string): Promise<HCPLead | null> {
  try {
    return await hcpFetch(`/leads/${encodeURIComponent(leadId)}`)
  } catch (e) {
    console.error('[hcp] getLead failed:', e)
    return null
  }
}

export type UpcomingJob = {
  jobId: string
  scheduledStart: string // ISO
  scheduledEnd: string | null
  arrivalWindowMinutes: number | null
  description: string | null
}

/**
 * Read-only: return a customer's SOONEST upcoming scheduled job, or null.
 * Used by the `lookup_my_appointment` tool so Claire can answer "what time is
 * my appointment?" — privacy rule (KB §4): upcoming only, never history.
 * Filters server-side by customer_id (verified working), then keeps only
 * future, non-canceled/non-completed scheduled jobs and takes the soonest.
 */
export async function getUpcomingJobForCustomer(hcpCustomerId: string): Promise<UpcomingJob | null> {
  try {
    const data = await hcpFetch(`/jobs?customer_id=${encodeURIComponent(hcpCustomerId)}&page=1&page_size=100`)
    const jobs: Array<{
      id: string
      description?: string | null
      work_status?: string | null
      canceled_at?: string | null
      deleted_at?: string | null
      schedule?: { scheduled_start?: string | null; scheduled_end?: string | null; arrival_window?: number | null } | null
    }> = data.jobs || []

    const now = Date.now()
    const upcoming = jobs
      .filter((j) => {
        const start = j.schedule?.scheduled_start
        if (!start) return false
        if (new Date(start).getTime() < now) return false
        if (j.canceled_at || j.deleted_at) return false
        const ws = (j.work_status || '').toLowerCase()
        if (['canceled', 'cancelled', 'completed', 'complete', 'pro canceled'].includes(ws)) return false
        return true
      })
      .sort(
        (a, b) =>
          new Date(a.schedule!.scheduled_start!).getTime() - new Date(b.schedule!.scheduled_start!).getTime(),
      )

    const j = upcoming[0]
    if (!j) return null
    return {
      jobId: j.id,
      scheduledStart: j.schedule!.scheduled_start!,
      scheduledEnd: j.schedule?.scheduled_end ?? null,
      arrivalWindowMinutes: j.schedule?.arrival_window ?? null,
      description: j.description ?? null,
    }
  } catch (e) {
    console.error('[hcp] getUpcomingJobForCustomer failed:', e)
    return null
  }
}

export async function tagExistingCustomer(customerId: string, planInfo: PlanInfo): Promise<void> {
  const tag = `${planInfo.planName}-${planInfo.billingCycle}`
  const note = `ONLINE SIGNUP: ${planInfo.templateName} (${planInfo.billingCycle}, $${planInfo.amount}${planInfo.frequency === 'monthly' || planInfo.frequency === '3year' ? '/mo' : '/yr'}). Paid via Stripe on ${new Date().toISOString().split('T')[0]}. Needs manual plan assignment in HCP.`

  await hcpFetch(`/customers/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify({
      tags: [tag],
      notes: note,
    }),
  })
}

export async function sendInternalNotification(
  customerData: CustomerData,
  planInfo: PlanInfo,
  customerId: string,
  isExisting: boolean
): Promise<void> {
  const perLabel =
    planInfo.frequency === 'monthly' || planInfo.frequency === '3year' ? '/mo' : '/yr'
  const address = [
    customerData.street,
    [customerData.city, customerData.state].filter(Boolean).join(', '),
    customerData.zip,
  ]
    .filter((s) => s && s.trim())
    .join(' ')
    .trim()

  // Fire the real office email via Resend. Was a console.log stub until
  // 2026-05-28 (Terry caught a Bronze gen plan signup that the office never
  // got notified about — only Tyler got Stripe's own receipt).
  try {
    await sendPlanSignupEmail({
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      address,
      planName: planInfo.templateName,
      billingCycle: planInfo.billingCycle,
      amount: planInfo.amount,
      perLabel,
      hcpCustomerId: customerId,
      isExisting,
    })
  } catch (e) {
    console.error('[housecall-pro] sendPlanSignupEmail failed (payment was still collected):', e)
  }
}
