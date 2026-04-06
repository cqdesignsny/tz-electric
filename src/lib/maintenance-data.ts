// ============================================
// TZ ELECTRIC - MAINTENANCE PLANS DATA
// ============================================

import type { PlanPricing } from '@/lib/signature-plans-data'

export type MaintenancePlan = {
  name: string
  slug: string
  tier: 'bronze' | 'silver' | 'gold'
  oneYear: number
  threeYearAnnual: number
  threeYearMonthly: number
  features: string[]
  highlighted?: boolean
  badge?: string
  pricing: PlanPricing[]
}

export const GENERATOR_OVERVIEW =
  'The TZ Electric Generator Maintenance Plan keeps your backup power system ready when you need it most. With routine maintenance, priority service, and proactive care, you can count on your generator to perform when it matters, without the stress of unexpected failures.'

export const GENERATOR_PLANS: MaintenancePlan[] = [
  {
    name: 'Bronze',
    slug: 'bronze',
    tier: 'bronze',
    oneYear: 299,
    threeYearAnnual: 269,
    threeYearMonthly: 23,
    features: [
      'Annual inspection',
      'Oil & filter service',
      'Battery check',
      'Exercise test',
      'Service documentation',
    ],
    pricing: [
      {
        frequency: '3year',
        label: '3-Year Monthly',
        suffix: '/mo',
        amount: 23,
        stripePriceId: 'price_1TJG1jGstwohZtDfaDADiNBe',
        isRecurring: true,
        hcpTemplateName: '3 Year Contract - Bronze',
        hcpBillingCycle: 'Monthly',
      },
      {
        frequency: 'yearly',
        label: '3-Year Annual',
        suffix: '/yr',
        amount: 269,
        stripePriceId: 'price_1TJG1iGstwohZtDf3bpHVwhL',
        isRecurring: true,
        hcpTemplateName: '3 Year Contract - Bronze',
        hcpBillingCycle: 'Yearly',
      },
      {
        frequency: 'monthly',
        label: '1-Year Prepay',
        suffix: '/yr',
        amount: 299,
        stripePriceId: 'price_1TJG1iGstwohZtDfweGEOebd',
        isRecurring: false,
        hcpTemplateName: '3 Year Contract - Bronze',
        hcpBillingCycle: 'Yearly',
      },
    ],
  },
  {
    name: 'Silver',
    slug: 'silver',
    tier: 'silver',
    oneYear: 328.90,
    threeYearAnnual: 299,
    threeYearMonthly: 25,
    highlighted: true,
    badge: 'Most Popular',
    features: [
      'Full maintenance service',
      'Oil & filter service',
      'Battery check',
      'Exercise test',
      'Spark plug replacement',
      'Proactive scheduling',
      'Service documentation',
    ],
    pricing: [
      {
        frequency: '3year',
        label: '3-Year Monthly',
        suffix: '/mo',
        amount: 25,
        stripePriceId: 'price_1TJG1kGstwohZtDfwJq7Ubpj',
        isRecurring: true,
        hcpTemplateName: '3 Year Contract - Silver',
        hcpBillingCycle: 'Monthly',
      },
      {
        frequency: 'yearly',
        label: '3-Year Annual',
        suffix: '/yr',
        amount: 299,
        stripePriceId: 'price_1TJG1jGstwohZtDfbNRqk7yk',
        isRecurring: true,
        hcpTemplateName: '3 Year Contract - Silver',
        hcpBillingCycle: 'Yearly',
      },
      {
        frequency: 'monthly',
        label: '1-Year Prepay',
        suffix: '/yr',
        amount: 328.90,
        stripePriceId: 'price_1TJG1jGstwohZtDfahAwlTRn',
        isRecurring: false,
        hcpTemplateName: '3 Year Contract - Silver',
        hcpBillingCycle: 'Yearly',
      },
    ],
  },
  {
    name: 'Gold',
    slug: 'gold',
    tier: 'gold',
    oneYear: 438.90,
    threeYearAnnual: 399,
    threeYearMonthly: 34,
    badge: 'Best Value',
    features: [
      'Bi-annual generator maintenance (twice per year)',
      'Oil & filter replacement',
      'Spark plug replacement',
      'Air filter replacement to maintain efficiency',
      'Battery load testing and inspection',
      'Full fuel system check for gas/propane/diesel models',
      'Exercise cycle test',
      'Remote monitoring',
    ],
    pricing: [
      {
        frequency: '3year',
        label: '3-Year Monthly',
        suffix: '/mo',
        amount: 34,
        stripePriceId: 'price_1TJG1lGstwohZtDf3ZzE2Me6',
        isRecurring: true,
        hcpTemplateName: '3 Year Contract - Gold',
        hcpBillingCycle: 'Monthly',
      },
      {
        frequency: 'yearly',
        label: '3-Year Annual',
        suffix: '/yr',
        amount: 399,
        stripePriceId: 'price_1TJG1lGstwohZtDfFgyhLFUw',
        isRecurring: true,
        hcpTemplateName: '3 Year Contract - Gold',
        hcpBillingCycle: 'Yearly',
      },
      {
        frequency: 'monthly',
        label: '1-Year Prepay',
        suffix: '/yr',
        amount: 438.90,
        stripePriceId: 'price_1TJG1kGstwohZtDfwTi6hMZ8',
        isRecurring: false,
        hcpTemplateName: '3 Year Contract - Gold',
        hcpBillingCycle: 'Yearly',
      },
    ],
  },
]

export const CANCELLATION_TERMS = [
  {
    title: 'Cancellation Before Annual Maintenance',
    content:
      'If you cancel your 3-year plan prior to annual maintenance being performed, a cancellation fee equal to 25% of the remaining contract balance is due immediately upon termination.',
  },
  {
    title: 'Cancellation After Annual Maintenance',
    content:
      'If you cancel your 3-year plan after annual maintenance has been performed, a cancellation fee equal to 15% of that year\'s total charge plus the cost of services already performed is due immediately upon termination.',
  },
  {
    title: 'Payment & Termination',
    content:
      'All cancellation fees and outstanding balances are due immediately upon termination. All cancellation requests must be submitted in writing or by email.',
  },
]

export const COMING_SOON_PLANS = [
  {
    name: 'Mini Split Maintenance',
    description: 'Keep your ductless system running at peak efficiency with seasonal tune-ups and priority service.',
  },
  {
    name: 'Hot Water Heater Maintenance',
    description: 'Extend the life of your water heater with annual flushing, anode rod checks, and proactive care.',
  },
]
