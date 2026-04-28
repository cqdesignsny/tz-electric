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
  addresses: Array<{
    id: string
    type: string
    street: string
    street_line_2: string | null
    city: string
    state: string
    zip: string
  }>
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
 * Lead form submission. Lands in HCP Job Inbox > "API Leads" channel.
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
 *
 * `description`, `source`, `lead_source`, `service_type`, customer.name,
 * customer.phone all get silently dropped. Source labeling lives in
 * tags (since lead_source needs HCP-managed UUIDs) and at the top of
 * customer.notes for office-staff visibility in Job Inbox.
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
 * Lead read endpoints. Used by the TZ Switchboard Lead Pipeline view to
 * show every lead from HCP without requiring a separate database. See
 * HANDOFF.md "What's NOT built" for the rationale and the long-term
 * own-database migration plan that replaces this.
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
