import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { SIGNATURE_PLANS, type BillingFrequency, type PlanPricing } from '@/lib/signature-plans-data'
import { GENERATOR_PLANS } from '@/lib/maintenance-data'

type CheckoutBody = {
  planSlug: string
  frequency: BillingFrequency
  firstName: string
  lastName: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  returnPath?: string
}

const ALL_PLANS: Array<{ name: string; slug: string; pricing: PlanPricing[] }> = [
  ...SIGNATURE_PLANS,
  ...GENERATOR_PLANS,
]

export async function POST(request: Request) {
  try {
    const body: CheckoutBody = await request.json()

    // Validate required fields
    const required: (keyof Omit<CheckoutBody, 'returnPath'>)[] = [
      'planSlug', 'frequency', 'firstName', 'lastName',
      'phone', 'street', 'city', 'state', 'zip',
    ]
    for (const field of required) {
      if (!body[field]?.trim()) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Look up plan across all plan types
    const plan = ALL_PLANS.find((p) => p.slug === body.planSlug)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const pricing = plan.pricing.find((p) => p.frequency === body.frequency)
    if (!pricing) {
      return NextResponse.json({ error: 'Invalid billing frequency' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const returnPath = body.returnPath || '/signature-plans'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: pricing.isRecurring ? 'subscription' : 'payment',
      line_items: [
        {
          price: pricing.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}${returnPath}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${returnPath}`,
      metadata: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        street: body.street,
        city: body.city,
        state: body.state,
        zip: body.zip,
        planSlug: body.planSlug,
        planName: plan.name,
        frequency: body.frequency,
        hcpTemplateName: pricing.hcpTemplateName,
        hcpBillingCycle: pricing.hcpBillingCycle,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
