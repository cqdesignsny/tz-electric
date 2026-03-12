export interface ServiceArea {
  slug: string
  city: string
  state: string
  county: string
  description: string
  metaTitle: string
  metaDescription: string
}

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: 'catskill-ny',
    city: 'Catskill',
    state: 'NY',
    county: 'Greene',
    description: 'As our hometown, Catskill is where it all began. We provide fast, reliable plumbing, HVAC, electrical, and generator services to Catskill homeowners.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Catskill, NY | TZ Electric',
    metaDescription: 'TZ Electric serves Catskill, NY with expert plumbing, HVAC, electrical, and generator services. 330+ 5-star reviews. Call (518) 678-1230 for a free quote.',
  },
  {
    slug: 'hudson-ny',
    city: 'Hudson',
    state: 'NY',
    county: 'Columbia',
    description: 'Hudson homeowners trust TZ Electric for all their home comfort needs. From emergency plumbing to HVAC installation, we deliver professional service every time.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Hudson, NY | TZ Electric',
    metaDescription: 'TZ Electric serves Hudson, NY with expert plumbing, HVAC, electrical, and generator services. 330+ 5-star reviews. Call (518) 678-1230.',
  },
  {
    slug: 'woodstock-ny',
    city: 'Woodstock',
    state: 'NY',
    county: 'Ulster',
    description: 'Woodstock residents count on TZ Electric for reliable home services. We handle everything from mini split installation to electrical panel upgrades.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Woodstock, NY | TZ Electric',
    metaDescription: 'TZ Electric provides plumbing, HVAC, electrical, and generator services in Woodstock, NY. Trusted by 330+ homeowners with 5-star reviews.',
  },
  {
    slug: 'rhinebeck-ny',
    city: 'Rhinebeck',
    state: 'NY',
    county: 'Dutchess',
    description: 'Rhinebeck homeowners choose TZ Electric for quality craftsmanship and honest service. We provide full-service plumbing, heating, cooling, and electrical solutions.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Rhinebeck, NY | TZ Electric',
    metaDescription: 'Serving Rhinebeck, NY with expert plumbing, HVAC, electrical, and generator services. TZ Electric — 330+ 5-star reviews. Free quotes available.',
  },
  {
    slug: 'hunter-ny',
    city: 'Hunter',
    state: 'NY',
    county: 'Greene',
    description: 'From mountain homes to year-round residences, Hunter homeowners trust TZ Electric for dependable HVAC, plumbing, electrical, and generator services.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Hunter, NY | TZ Electric',
    metaDescription: 'TZ Electric serves Hunter, NY with professional plumbing, HVAC, electrical, and generator services. 330+ 5-star reviews. Call (518) 678-1230.',
  },
  {
    slug: 'saugerties-ny',
    city: 'Saugerties',
    state: 'NY',
    county: 'Ulster',
    description: 'Saugerties homeowners rely on TZ Electric for expert home services. We offer comprehensive plumbing, HVAC, electrical, and generator solutions.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Saugerties, NY | TZ Electric',
    metaDescription: 'TZ Electric provides plumbing, HVAC, electrical, and generator services in Saugerties, NY. Trusted local contractor with 330+ 5-star reviews.',
  },
  {
    slug: 'kingston-ny',
    city: 'Kingston',
    state: 'NY',
    county: 'Ulster',
    description: 'Kingston residents trust TZ Electric for all their home comfort needs. Professional plumbing, heating, cooling, and electrical services with guaranteed satisfaction.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Kingston, NY | TZ Electric',
    metaDescription: 'Expert plumbing, HVAC, electrical, and generator services in Kingston, NY. TZ Electric — 330+ 5-star Google reviews. Free estimates.',
  },
]

export function getServiceAreaBySlug(slug: string): ServiceArea | undefined {
  return SERVICE_AREAS.find((area) => area.slug === slug)
}

export function getAllServiceAreaSlugs(): string[] {
  return SERVICE_AREAS.map((area) => area.slug)
}
