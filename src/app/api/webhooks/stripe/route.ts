import { stripe } from '@/lib/stripe'
import { searchCustomer, createCustomer, assignServicePlan } from '@/lib/housecall-pro'

export const runtime = 'nodejs'

// Track processed sessions to ensure idempotency
const processedSessions = new Set<string>()

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const sessionId = session.id

    // Idempotency check
    if (processedSessions.has(sessionId)) {
      return new Response('Already processed', { status: 200 })
    }
    processedSessions.add(sessionId)

    // Extract customer data from metadata
    const meta = session.metadata || {}
    const { firstName, lastName, phone, street, city, state, zip, hcpTemplateName, hcpBillingCycle } = meta

    if (!firstName || !lastName || !phone) {
      console.error('[Webhook] Missing customer metadata:', meta)
      return new Response('OK', { status: 200 })
    }

    try {
      // Search for existing customer in HCP
      const existingCustomer = await searchCustomer(phone, firstName, lastName)

      let customerId: string

      if (existingCustomer) {
        console.log(`[HCP] Found existing customer: ${existingCustomer.id} (${firstName} ${lastName})`)
        customerId = existingCustomer.id
      } else {
        console.log(`[HCP] Creating new customer: ${firstName} ${lastName}`)
        const newCustomer = await createCustomer({
          firstName,
          lastName,
          phone,
          street: street || '',
          city: city || '',
          state: state || '',
          zip: zip || '',
        })
        customerId = newCustomer.id
        console.log(`[HCP] Created customer: ${customerId}`)
      }

      // Assign service plan
      if (hcpTemplateName && hcpBillingCycle) {
        await assignServicePlan(
          customerId,
          hcpTemplateName,
          hcpBillingCycle as 'Monthly' | 'Yearly'
        )
        console.log(`[HCP] Plan assigned: ${hcpTemplateName} (${hcpBillingCycle}) to customer ${customerId}`)
      }
    } catch (error) {
      // Log but don't fail — payment is already collected
      console.error('[HCP] Sync failed (payment was still collected):', {
        error,
        sessionId,
        customer: `${firstName} ${lastName}`,
        phone,
        plan: hcpTemplateName,
      })
    }
  }

  return new Response('OK', { status: 200 })
}
