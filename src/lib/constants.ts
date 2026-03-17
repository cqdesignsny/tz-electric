// ============================================
// TZ ELECTRIC INC - SITE CONSTANTS
// ============================================

export const COMPANY = {
  name: 'TZ Electric, Inc.',
  tagline: 'Plumbing | Heating | Cooling',
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
  counties: ['Dutchess', 'Ulster', 'Albany', 'Columbia', 'Greene'],
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
  ],
  financing: ['Wisetack', 'Synchrony'],
  social: {
    facebook: 'https://www.facebook.com/tzelectricinc',
    instagram: 'https://www.instagram.com/tzelectricinc',
    google: 'https://g.page/tzelectricinc',
    youtube: 'https://www.youtube.com/@tzelectricinc',
  },
  hours: {
    weekday: '7:00 AM - 5:00 PM',
    saturday: '8:00 AM - 2:00 PM',
    sunday: 'Emergency Only',
  },
} as const

export const TYPEFORM_URL = 'https://ghfs29y37tj.typeform.com/to/HDLXmnob'

// Analytics IDs (preserved from current site)
export const ANALYTICS = {
  ga4: 'G-X55X1YSD10',
  googleAds: 'AW-16641031492',
  gtm: 'GTM-MGWW87JT',
  facebookPixel: '489773923452243',
  hotjar: '5144458',
} as const

// Navigation structure
export const NAV_ITEMS = [
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Electrical', href: '/electrical', description: 'Panel upgrades, rewiring, lighting & more' },
      { label: 'HVAC', href: '/hvac', description: 'Heating, ventilation & air conditioning' },
      { label: 'Mini Splits', href: '/mini-split', description: 'Ductless heating & cooling systems' },
      { label: 'Generators', href: '/generator', description: 'Backup power solutions' },
      { label: 'Plumbing', href: '/plumbing', description: 'Full-service plumbing solutions' },
      { label: 'Hot Water Heaters', href: '/hot-water-heaters', description: 'Installation & repair' },
      { label: 'Emergency Services', href: '/emergency', description: '24/7 emergency repair' },
      { label: 'Mitsubishi Electric', href: '/mitsubishi', description: 'Diamond Elite mini split systems' },
    ],
  },
  {
    label: 'Service Areas',
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
    label: 'About',
    href: '/about-us',
    children: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Reviews', href: '/reviews' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    label: 'Signature Plans',
    href: '/signature-plans',
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

// Services data
export const SERVICES = [
  {
    title: 'Electrical',
    slug: 'electrical',
    caption: 'Expert Electrical Services',
    description: 'Panel upgrades, rewiring, lighting, EV chargers, and complete electrical services for your home.',
    image: '/images/services/electrical-upgrade.webp',
  },
  {
    title: 'HVAC',
    slug: 'hvac',
    caption: 'Heating & Cooling Solutions',
    description: 'Installation, repair, and maintenance for all heating and cooling systems.',
    image: '/images/services/hvac-hero.png',
  },
  {
    title: 'Mini Splits',
    slug: 'mini-split',
    caption: 'Ductless Comfort',
    description: 'Mitsubishi Diamond Elite mini split installation, repair, and maintenance.',
    image: '/images/services/mini-split.webp',
  },
  {
    title: 'Generators',
    slug: 'generator',
    caption: 'Backup Power',
    description: 'Generac authorized dealer — whole-home generator installation and service.',
    image: '/images/services/generator.webp',
  },
  {
    title: 'Plumbing',
    slug: 'plumbing',
    caption: 'Full-Service Plumbing',
    description: 'Pipe repair, drain cleaning, fixture installation, and complete plumbing solutions.',
    image: '/images/services/plumbing.webp',
  },
  {
    title: 'Hot Water Heaters',
    slug: 'hot-water-heaters',
    caption: 'Hot Water Solutions',
    description: 'Tankless and traditional water heater installation, repair, and replacement.',
    image: '/images/services/water-heater.png',
  },
] as const
