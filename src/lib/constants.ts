// ============================================
// TZ ELECTRIC INC - SITE CONSTANTS
// ============================================

export const COMPANY = {
  name: 'TZ Electric, Inc.',
  tagline: 'Cooling | Heating | Electrical',
  phone: '(518) 678-1230',
  phoneRaw: '+15186781230',
  email: 'service@tzelectricinc.com',
  address: {
    street: '5079 NY-32',
    city: 'Catskill',
    state: 'NY',
    zip: '12414',
    full: '5079 NY-32, Catskill, NY 12414',
  },
  serviceArea: 'Hudson Valley, NY',
  counties: ['Greene', 'Columbia', 'Ulster', 'Dutchess', 'Albany', 'Delaware'],
  locations: ['Catskill', 'Hudson', 'Woodstock', 'Rhinebeck', 'Hunter', 'Ulster', 'Columbia'],
  reviews: {
    count: 330,
    rating: 5,
    platform: 'Google',
  },
  certifications: [
    'Mitsubishi Diamond Elite Contractor',
    'Generac Authorized Dealer',
    'BBB Accredited Business',
    'Voted Best Electrician in the Hudson Valley',
  ],
  financing: ['Wisetack', 'Synchrony'],
  social: {
    facebook: 'https://www.facebook.com/tzelectricinc',
    instagram: 'https://www.instagram.com/tzelectricinc',
    google: 'https://g.page/tzelectricinc',
    youtube: 'https://www.youtube.com/@tzelectricinc',
    nextdoor: 'https://nextdoor.com/pages/tz-electric-inc-catskill-ny/',
  },
  hours: {
    weekday: '7:30 AM - 4:00 PM',
    saturday: 'Closed',
    sunday: 'Closed',
    emergencyNote: '24/7 Emergency Service Available (After Hours)',
  },
} as const

// Native lead form path. Replaced the old Typeform URL.
// Service pages can deep-link via /quote?service=hvac to prefill the service step.
export const QUOTE_URL = '/quote'

// HCP Business Unit UUIDs. Tyler's HCP account has three Business Units
// configured: Plumbing, HVAC, Electrical. We auto-populate the Business
// Unit field on every estimate so the office can filter by vertical.
//
// HCP's public API does NOT expose business unit UUIDs (verified
// empirically 2026-05-08: GET /business_units, /companies/{id}/business_units,
// /settings/business_units all 404). To populate the values below:
//
//   1. Tyler logs into HCP, opens any estimate in edit mode.
//   2. Open browser dev tools, Network tab, filter by Fetch/XHR.
//   3. Click the Business Unit dropdown. The request that loads the
//      options will return JSON with {uuid, name} for each BU.
//   4. Drop the three uuids into the env vars below.
//
// Stored as env vars (not hardcoded) so they can vary between preview
// branches and prod, and so the UUIDs aren't checked into the public repo.
// If unset at runtime, we just don't pass business_unit_uuid to HCP — the
// office will tag estimates manually like they do today.
export const HCP_BUSINESS_UNITS = {
  plumbing: process.env.HCP_BU_PLUMBING_UUID || '',
  hvac: process.env.HCP_BU_HVAC_UUID || '',
  electrical: process.env.HCP_BU_ELECTRICAL_UUID || '',
} as const

/**
 * Map a service slug (from services-data.ts) to one of TZ's three Business
 * Units. Generators and EV chargers are electrical work in TZ's HCP setup
 * (per Tyler). Hot water heaters are plumbing.
 *
 * Returns the BU UUID if env is configured, otherwise undefined so the
 * caller can skip the field entirely.
 */
export function businessUnitUuidForService(serviceKey: string): string | undefined {
  const k = serviceKey.toLowerCase()
  if (k === 'plumbing' || k === 'hot-water-heaters') {
    return HCP_BUSINESS_UNITS.plumbing || undefined
  }
  if (
    k === 'mini-split' ||
    k === 'mitsubishi' ||
    k === 'hvac' ||
    k === 'maintenance' ||
    k === 'cooling' ||
    k === 'heating'
  ) {
    return HCP_BUSINESS_UNITS.hvac || undefined
  }
  if (
    k === 'electrical' ||
    k === 'generator' ||
    k === 'ev-charger' ||
    k === 'panel'
  ) {
    return HCP_BUSINESS_UNITS.electrical || undefined
  }
  // Emergency, anything else: leave unset, office triages manually.
  return undefined
}

// Claire web chat path. Linked from buttons sitewide so we can track entry
// points via the ?source query param. Helpers in src/lib/claire-links.ts.
export const CLAIRE_URL = '/claire'

// Analytics IDs (preserved from current site)
export const ANALYTICS = {
  ga4: 'G-X55X1YSD10',
  googleAds: 'AW-16641031492',
  gtm: 'GTM-WV326JN8',
  facebookPixel: '489773923452243',
  hotjar: '5144458',
} as const

// Navigation structure
export const NAV_ITEMS = [
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Mitsubishi Mini Splits', href: '/mitsubishi', description: 'Diamond Elite ductless heating & cooling' },
      { label: 'HVAC', href: '/hvac', description: 'Ducted heating & air conditioning' },
      { label: 'Electrical', href: '/electrical', description: 'Panel upgrades, rewiring, lighting & more' },
      { label: 'Plumbing', href: '/plumbing', description: 'Full-service plumbing solutions' },
      { label: 'Generators', href: '/generator', description: 'Generac backup power solutions' },
      { label: 'Hot Water Heaters', href: '/hot-water-heaters', description: 'Installation & repair' },
      { label: '24/7 Emergency Services', href: '/emergency', description: '24/7 emergency repair' },
    ],
  },
  {
    label: 'Plans',
    href: '/signature-plans',
    children: [
      { label: 'Signature Plans', href: '/signature-plans', description: 'Annual maintenance memberships' },
      { label: 'Generator Maintenance Plans', href: '/maintenance', description: 'Bronze, Silver & Gold generator service plans' },
    ],
  },
  {
    label: 'About',
    href: '/about-us',
    children: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Gallery', href: '/gallery' },
      // { label: 'Blog', href: '/blog' }, // Hidden until blog content is migrated
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    label: 'Areas',
    href: '/service-areas',
    children: [
      { label: 'Catskill, NY', href: '/service-areas/catskill-ny' },
      { label: 'Hudson, NY', href: '/service-areas/hudson-ny' },
      { label: 'Woodstock, NY', href: '/service-areas/woodstock-ny' },
      { label: 'Rhinebeck, NY', href: '/service-areas/rhinebeck-ny' },
      { label: 'Hunter, NY', href: '/service-areas/hunter-ny' },
      { label: 'All Service Areas', href: '/service-areas' },
    ],
  },
  {
    label: 'Financing',
    href: '/financing',
  },
  {
    label: 'Promotions',
    href: '/promotions',
  },
] as const

// Services data (ordered: Cooling → Heating → Electrical → Plumbing → Generator)
export const SERVICES = [
  {
    title: 'Mitsubishi Mini Splits',
    slug: 'mitsubishi',
    caption: 'Ductless Cooling & Heating',
    description: 'Mitsubishi Diamond Elite mini split installation, repair, and maintenance.',
    image: '/images/services/minisplit-install.jpeg',
  },
  {
    title: 'HVAC',
    slug: 'hvac',
    caption: 'Ducted Heating & Cooling',
    description: 'Installation, repair, and maintenance for furnaces, central air, and heat pump systems.',
    image: '/images/services/hvac-hero.png',
  },
  {
    title: 'Electrical',
    slug: 'electrical',
    caption: 'Expert Electrical Services',
    description: 'Panel upgrades, rewiring, lighting, EV chargers, and complete electrical services for your home.',
    image: '/images/services/clean-panel.jpeg',
  },
  {
    title: 'Plumbing',
    slug: 'plumbing',
    caption: 'Full-Service Plumbing',
    description: 'Pipe repair, drain cleaning, fixture installation, and complete plumbing solutions.',
    image: '/images/services/plumbing.jpg',
  },
  {
    title: 'Generators',
    slug: 'generator',
    caption: 'Backup Power',
    description: 'Generac authorized dealer for whole-home generator installation and service. Repair services limited to Generac.',
    image: '/images/services/generator.webp',
  },
  {
    title: 'Hot Water Heaters',
    slug: 'hot-water-heaters',
    caption: 'Hot Water Solutions',
    description: 'Tankless and traditional water heater installation, repair, and replacement.',
    image: '/images/services/water-heater.png',
  },
] as const
