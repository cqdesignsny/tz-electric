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
 * Find a customer by phone alone, returning the most likely match. Used by the
 * lead-form flow: an existing TZ customer requesting new work via the website
 * should be matched even if they enter a slightly different name (e.g.
 * "Mike Smith" in HCP but "Michael Smith" on the form).
 *
 * Returns null on no match or HCP error so callers can fall through to
 * creating a new customer.
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
 * "API Leads" channel. Retained for reference and for any agent that
 * specifically wants the Job Inbox flow; the website lead form has moved
 * to the create-customer + create-estimate path (see createEstimateForLead
 * below) per Tyler's 2026-04-28 routing change.
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
 * details go in `private_notes` (office-only, scoped to this estimate)
 * rather than customer.notes, which is reserved for persistent customer
 * info. Tags surface on the estimate row in HCP for at-a-glance triage.
 *
 * NOTE on field shape: HCP's docs site (Stoplight SPA) is JS-rendered so
 * the OpenAPI spec couldn't be statically scraped at build-time. We send
 * a defensively wide payload (`private_notes`, `notes`, `description`,
 * `tags`, optional `address`) under the assumption HCP silently drops
 * fields it doesn't recognize, the same behavior verified empirically on
 * /leads in session 12. First production submission acts as the
 * empirical verification — surface any HCP error to the office email
 * and iterate. Update this comment + the request body once the kept-
 * vs-dropped fields are confirmed.
 */
export type EstimateInput = {
  customerId: string
  privateNotes: string
  description?: string
  tags?: string[]
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
}

export type HCPEstimateResponse = {
  id?: string
  number?: string | number
  [key: string]: unknown
}

export async function createEstimateForLead(
  input: EstimateInput,
): Promise<HCPEstimateResponse> {
  const body: Record<string, unknown> = {
    customer_id: input.customerId,
    private_notes: input.privateNotes,
    notes: input.privateNotes,
  }
  if (input.description) body.description = input.description
  if (input.tags && input.tags.length > 0) body.tags = input.tags
  if (input.address) body.address = input.address

  return hcpFetch('/estimates', {
    method: 'POST',
    body: JSON.stringify(body),
  })
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
  const subject = `New Plan Signup: ${planInfo.templateName} - ${customerData.firstName} ${customerData.lastName}`
  const body = [
    `A new plan signup was received via the website.`,
    ``,
    `Customer: ${customerData.firstName} ${customerData.lastName}`,
    `Phone: ${customerData.phone}`,
    `Address: ${customerData.street}, ${customerData.city}, ${customerData.state} ${customerData.zip}`,
    `HCP Customer ID: ${customerId}`,
    `Existing Customer: ${isExisting ? 'Yes' : 'No (new customer created)'}`,
    ``,
    `Plan: ${planInfo.templateName}`,
    `Billing: ${planInfo.billingCycle} - $${planInfo.amount}${planInfo.frequency === 'monthly' || planInfo.frequency === '3year' ? '/mo' : '/yr'}`,
    ``,
    `ACTION REQUIRED: Please assign the service plan to this customer in Housecall Pro.`,
    `https://pro.housecallpro.com/app/service_agreements`,
  ].join('\n')

  // Send via a simple fetch to our own API route that handles email
  // For now, log it — email sending will be added when an email service is configured
  console.log('[NOTIFICATION]', subject)
  console.log(body)
}
