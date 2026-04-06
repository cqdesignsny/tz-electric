import { getStripe } from '@/lib/stripe'
import {
  searchCustomer,
  createCustomer,
  tagExistingCustomer,
  sendInternalNotification,
  type PlanInfo,
} from '@/lib/housecall-pro'

export const runtime = 'nodejs'

const processedSessions = new Set<string>()

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(
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

    if (processedSessions.has(sessionId)) {
      return new Response('Already processed', { status: 200 })
    }
    processedSessions.add(sessionId)

    const meta = session.metadata || {}
    const {
      firstName, lastName, phone, street, city, state, zip,
      planName, planSlug, frequency, hcpTemplateName, hcpBillingCycle,
    } = meta

    if (!firstName || !lastName || !phone) {
      console.error('[Webhook] Missing customer metadata:', meta)
      return new Response('OK', { status: 200 })
    }

    const planInfo: PlanInfo = {
      planName: planName || planSlug || 'Unknown',
      templateName: hcpTemplateName || 'Unknown Plan',
      billingCycle: (hcpBillingCycle as 'Monthly' | 'Yearly') || 'Monthly',
      frequency: frequency || 'monthly',
      amount: (session.amount_total || 0) / 100,
    }

    const customerData = {
      firstName,
      lastName,
      phone,
      street: street || '',
      city: city || '',
      state: state || '',
      zip: zip || '',
    }

    try {
      const existingCustomer = await searchCustomer(phone, firstName, lastName)
      let customerId: string
      let isExisting = false

      if (existingCustomer) {
        console.log(`[HCP] Found existing customer: ${existingCustomer.id} (${firstName} ${lastName})`)
        customerId = existingCustomer.id
        isExisting = true

        // Tag existing customer with the new plan
        await tagExistingCustomer(customerId, planInfo)
        console.log(`[HCP] Tagged existing customer ${customerId} with plan: ${planInfo.templateName}`)
      } else {
        console.log(`[HCP] Creating new customer: ${firstName} ${lastName}`)
        const newCustomer = await createCustomer(customerData, planInfo)
        customerId = newCustomer.id
        console.log(`[HCP] Created customer ${customerId} with tag and note`)
      }

      // Send internal email notification
      await sendInternalNotification(customerData, planInfo, customerId, isExisting)

    } catch (error) {
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
