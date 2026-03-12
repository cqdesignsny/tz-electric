// ============================================
// TZ SIGNATURE PLANS DATA
// ============================================

export type Plan = {
  name: string
  slug: string
  price: number
  prepaidYearly: number
  prepaid3Year: number
  features: string[]
  highlighted?: boolean
  badge?: string
}

export const SIGNATURE_PLANS: Plan[] = [
  {
    name: 'Core',
    slug: 'core',
    price: 35,
    prepaidYearly: 399,
    prepaid3Year: 1071,
    features: [
      '1 annual assessment',
      'Priority scheduling',
      '5% off a repair',
    ],
  },
  {
    name: 'Preferred',
    slug: 'preferred',
    price: 45,
    prepaidYearly: 513,
    prepaid3Year: 1377,
    highlighted: true,
    badge: 'Most Popular',
    features: [
      'Everything in Core',
      '1 annual preventative maintenance',
      '10% off a repair',
    ],
  },
  {
    name: 'Elite',
    slug: 'elite',
    price: 60,
    prepaidYearly: 684,
    prepaid3Year: 1836,
    features: [
      'Everything in Preferred',
      '10% off any new installation',
      '$100 service credit',
      'Extended hours scheduling',
    ],
  },
]

export const SERVICE_DESCRIPTIONS = [
  {
    title: 'Annual Assessment',
    description:
      'Visual inspection of main electrical panel, grounding and system safety check, inspection of visible wiring and connections, testing of key outlets and GFCI protection, plus smoke and carbon monoxide detector checks.',
    icon: 'clipboard-check',
  },
  {
    title: 'Preventative Maintenance',
    description:
      'Everything in the annual assessment, plus tightening of accessible electrical connections, breaker performance check and minor adjustments, load balancing review, surge protection inspection, and inspection of HVAC system and Generac generator.',
    icon: 'wrench',
  },
  {
    title: 'Priority Scheduling',
    description:
      'Moves your service to the top of the queue. Available upon request so you get faster response times when you need help most.',
    icon: 'clock',
  },
  {
    title: 'Extended Hours Scheduling',
    description:
      'Appointments available in the evenings or on Saturdays. Exclusive to Elite members for maximum flexibility around your schedule.',
    icon: 'calendar',
  },
]

export const WHY_JOIN_BENEFITS = [
  {
    title: 'Protect Your Home & Family',
    description:
      'Prevent dangerous electrical issues, HVAC breakdowns, and small problems from becoming costly emergencies.',
    icon: 'shield',
  },
  {
    title: 'Save Hundreds (or More!)',
    description:
      'Exclusive member discounts and annual service credits add up to significant savings over time.',
    icon: 'banknotes',
  },
  {
    title: 'Skip the Wait & Stress',
    description:
      'Priority scheduling means faster response times. You jump to the front of the queue when you need us.',
    icon: 'bolt',
  },
]

export const PLAN_TERMS = [
  {
    title: "What's Included",
    content:
      'Assessments and maintenance visits as outlined in your plan tier. Repairs, parts, and upgrades are NOT included unless specifically stated.',
  },
  {
    title: 'Scope of Services',
    content:
      'Focuses on electrical services. HVAC coverage limited to visual inspections and basic maintenance. Plumbing limited to light checks only.',
  },
  {
    title: 'Equipment Access',
    content:
      'Safe, clear access to equipment is required. Unsafe or non-compliant systems may be excluded from service.',
  },
  {
    title: 'Pricing & Changes',
    content:
      'Pricing may update with 60-day written notice before renewal. A 2% annual rate increase applies.',
  },
  {
    title: 'Priority Scheduling',
    content:
      'Faster queue placement, not guaranteed same-day service. Weather and safety conditions may affect availability.',
  },
  {
    title: 'Benefit Limits',
    content:
      'Benefits are limited to one-time use per service visit and cannot be combined or stacked. One discount per job. Repair discounts capped at $5,000/invoice. Installation discounts capped at $1,000/project. Unused features roll over if membership stays active; they expire upon cancellation.',
  },
  {
    title: 'Cancellation',
    content:
      'Before inspection/maintenance: 25% of remaining balance + full retail value of used benefits. After inspection/maintenance: 15% of annual total + full retail value of used benefits. Monthly plans: remaining balance is due. Written or email cancellation required. Memberships are non-transferable.',
  },
  {
    title: 'Billing',
    content: 'All billing is managed through Housecall Pro.',
  },
]
