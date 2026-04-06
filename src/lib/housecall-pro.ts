const HCP_BASE = 'https://api.housecallpro.com/v1'

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
  phone_number: string
  email: string
  addresses: Array<{
    street: string
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

export async function searchCustomer(phone: string, firstName: string, lastName: string): Promise<HCPCustomer | null> {
  const normalized = normalizePhone(phone)

  try {
    const data = await hcpFetch(`/customers?phone_number=${encodeURIComponent(normalized)}`)
    const customers: HCPCustomer[] = data.customers || []

    // Match by name (case-insensitive)
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

export async function createCustomer(data: CustomerData): Promise<HCPCustomer> {
  return hcpFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: normalizePhone(data.phone),
      addresses: [
        {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zip,
        },
      ],
    }),
  })
}

export async function assignServicePlan(
  customerId: string,
  planTemplateName: string,
  billingCycle: 'Monthly' | 'Yearly'
): Promise<void> {
  // TODO: Implement once exact HCP service_agreements endpoint is confirmed.
  // Based on HCP URL pattern (pro.housecallpro.com/app/service_agreements),
  // the endpoint is likely POST /v1/service_agreements or similar.
  //
  // Expected payload:
  // {
  //   customer_id: customerId,
  //   plan_template_name: planTemplateName,
  //   billing_cycle: billingCycle,
  // }
  //
  // For now, log the assignment for manual processing.
  console.log('[HCP] Service plan assignment pending manual setup:', {
    customerId,
    planTemplateName,
    billingCycle,
    timestamp: new Date().toISOString(),
  })
}
