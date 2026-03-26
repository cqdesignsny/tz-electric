// ============================================
// TZ SIGNATURE PLANS DATA (Updated 2026-03-26)
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
      'Visual inspection of the main electrical panel, check grounding and system safety, inspection of visible wiring and connections, testing of key outlets and GFCI protection, smoke detectors, and carbon monoxide detectors.',
    icon: 'clipboard-check',
  },
  {
    title: 'Preventative Maintenance',
    description:
      'Everything included with an annual assessment plus tightening of accessible electrical connections (as needed), breaker performance check and minor adjustments, load balancing review (where applicable), surge protection inspection (existing devices), inspection of HVAC system and Generac generator.',
    icon: 'wrench',
  },
  {
    title: 'Priority Scheduling',
    description:
      'When timing matters, priority scheduling ensures you\'re taken care of fast. This option is available upon request and moves your service to the top of our queue.',
    icon: 'clock',
  },
  {
    title: 'Extended Hours Scheduling',
    description:
      'For customers with full-time work schedules, getting service during the day isn\'t always practical. Extended hours scheduling allows you to request appointments in the evenings or on Saturdays, so essential service can be completed without taking time off work.',
    icon: 'calendar',
  },
]

export const CHOOSING_RIGHT_PLAN = [
  'Consider your home\'s age, electrical demand, and how much protection you want year-round. Older homes or systems with higher electrical loads often benefit from preventive maintenance and deeper system checks.',
  'Think about whether you prefer basic coverage or higher value protection. Higher-tier plans offer greater savings on repairs, service credits, and long-term value — especially if you plan home upgrades or anticipate service needs.',
  'Extended hours scheduling offers added convenience for customers with busy schedules and full-time commitments.',
  'Monthly plans offer flexibility, while prepaid options deliver the best overall savings.',
]

export const WHY_JOIN_BENEFITS = [
  {
    title: 'Protect Your Home & Family',
    description:
      'One inspection a year can prevent dangerous electrical issues, HVAC breakdowns, and small plumbing problems from turning into expensive emergencies. Peace of mind has never been easier.',
    icon: 'shield',
  },
  {
    title: 'Save Hundreds (or More!)',
    description:
      'Membership gives you exclusive discounts and annual service credits. Repairs cost less, emergencies cost less, and you keep more money in your pocket.',
    icon: 'banknotes',
  },
  {
    title: 'Skip the Wait & Stress',
    description:
      'When you need help, you don\'t wait in line. Members get priority scheduling, fast response times, and peace of mind knowing we\'re on call for you.',
    icon: 'bolt',
  },
]

export const PLAN_TERMS = [
  {
    title: "What's Included",
    content:
      'Membership includes assessments and maintenance visits as outlined in your plan. Repairs, parts, or upgrades are not included unless specifically stated.',
  },
  {
    title: 'Scope of Service',
    content:
      'This plan focuses on electrical services. HVAC coverage is limited to visual inspections, basic maintenance, and optional monitoring. Plumbing coverage is limited to light checks only.',
  },
  {
    title: 'Equipment Access',
    content:
      'Safe, clear access to equipment is required. Systems that are unsafe, non-compliant, or beyond service may be excluded.',
  },
  {
    title: 'Membership Changes',
    content:
      'TZ Electric may update pricing, benefits, and terms with written notice 60 days before renewal. Plan rates are subject to a 2% increase every year.',
  },
  {
    title: 'Priority Scheduling',
    content:
      'Membership gives faster placement in our service queue but does not guarantee same-day service. Weather, safety, and circumstances beyond our control such as extreme weather events may affect our availability.',
  },
  {
    title: 'Membership Feature Restrictions',
    content:
      'Membership benefits (Core, Preferred, and Elite) are limited to one-time use per service visit unless otherwise stated. Benefits may not be combined or stacked. Only one key membership feature or discount may be applied per job, at TZ Electric\'s discretion. Repair discounts are capped at a maximum of $5,000 per service invoice. New installation discounts are capped at a maximum of $1,000 per installation project. Unused membership features may roll over into the following year provided the Signature Plan membership remains active and uninterrupted. Rollover benefits expire if membership lapses or is canceled.',
  },
  {
    title: 'Cancellation Policy',
    content:
      'Prior to Annual Inspection or Maintenance: Cancellation fee equal to 25% of the remaining balance of the contract term, plus the full retail value of any services, service credits, or discounts used. After Annual Inspection or Maintenance: Cancellation fee equal to 15% of that year\'s total membership charge, plus the full retail value of any services, credits, or discounts used. If on a monthly payment plan, the remaining term balance will be due upon contract termination. Any inspections, maintenance visits, service credits, discounts, or other membership benefits used prior to cancellation shall be billed at standard, non-member retail rates and deducted from any refund. All cancellation fees and outstanding balances are due immediately upon termination. All cancellation requests must be submitted in writing or by email. Verbal cancellation requests are not valid. TZ Electric reserves the right to terminate this agreement for non-payment, misuse of membership benefits, unsafe conditions, or violation of these terms. Memberships are non-transferable and apply only to the enrolled customer and service address.',
  },
]
