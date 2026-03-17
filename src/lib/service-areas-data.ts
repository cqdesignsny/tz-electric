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

// ============================================
// COUNTY DATA
// ============================================

export interface CountyArea {
  slug: string
  county: string
  state: string
  description: string
  longDescription: string
  metaTitle: string
  metaDescription: string
  cities: string[]
  services: string[]
}

export const COUNTY_AREAS: CountyArea[] = [
  {
    slug: 'greene-county',
    county: 'Greene',
    state: 'NY',
    description: 'Based in Catskill, TZ Electric is proud to call Greene County home. We deliver expert plumbing, HVAC, electrical, and generator services to homeowners throughout the county.',
    longDescription: 'Greene County is where TZ Electric was founded, and we know the area better than any other contractor. From the mountaintop communities of Hunter and Windham to the riverside towns of Catskill and Athens, our team provides fast, reliable service across the entire county. Whether you need an emergency plumber at midnight or a full HVAC system installation, we are always just a short drive away.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Greene County, NY | TZ Electric',
    metaDescription: 'TZ Electric serves all of Greene County, NY with expert plumbing, HVAC, electrical, mini split, and generator services. Based in Catskill. 330+ 5-star reviews. Call (518) 678-1230.',
    cities: ['Catskill', 'Hunter', 'Windham', 'Athens', 'Cairo', 'Coxsackie', 'Tannersville', 'Jewett', 'Prattsville', 'Greenville'],
    services: ['Plumbing', 'HVAC', 'Electrical', 'Mini Splits', 'Generators', 'Hot Water Heaters', 'Emergency Services'],
  },
  {
    slug: 'columbia-county',
    county: 'Columbia',
    state: 'NY',
    description: 'TZ Electric provides full-service plumbing, heating, cooling, electrical, and generator solutions to homeowners throughout Columbia County.',
    longDescription: 'Columbia County homeowners trust TZ Electric for reliable home services. From the charming city of Hudson to the rural landscapes of Chatham and Kinderhook, we bring the same quality craftsmanship and honest service to every job. Our factory-trained technicians are equipped to handle everything from routine maintenance to complex installations, backed by our 330+ five-star Google reviews.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Columbia County, NY | TZ Electric',
    metaDescription: 'Expert plumbing, HVAC, electrical, and generator services throughout Columbia County, NY. TZ Electric — 330+ 5-star reviews, Mitsubishi Diamond Contractor. Call (518) 678-1230.',
    cities: ['Hudson', 'Chatham', 'Kinderhook', 'Claverack', 'Philmont', 'Valatie', 'Germantown', 'Copake', 'Hillsdale', 'Ghent'],
    services: ['Plumbing', 'HVAC', 'Electrical', 'Mini Splits', 'Generators', 'Hot Water Heaters', 'Emergency Services'],
  },
  {
    slug: 'ulster-county',
    county: 'Ulster',
    state: 'NY',
    description: 'TZ Electric serves Ulster County homeowners with professional plumbing, HVAC, electrical, and generator services — from Woodstock to Kingston and beyond.',
    longDescription: 'Ulster County is one of our most active service regions. From the artistic community of Woodstock to the historic streets of Kingston and the scenic beauty of Saugerties, we provide comprehensive home comfort services to thousands of homeowners. Our Mitsubishi Diamond Contractor certification makes us the go-to choice for ductless mini split installations throughout the county, and our 24/7 emergency service means help is never far away.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Ulster County, NY | TZ Electric',
    metaDescription: 'Serving Ulster County, NY with expert plumbing, HVAC, electrical, mini split, and generator services. TZ Electric — Woodstock, Kingston, Saugerties & more. Call (518) 678-1230.',
    cities: ['Woodstock', 'Kingston', 'Saugerties', 'New Paltz', 'Rosendale', 'Stone Ridge', 'Phoenicia', 'Shokan', 'Hurley', 'Ellenville'],
    services: ['Plumbing', 'HVAC', 'Electrical', 'Mini Splits', 'Generators', 'Hot Water Heaters', 'Emergency Services'],
  },
  {
    slug: 'dutchess-county',
    county: 'Dutchess',
    state: 'NY',
    description: 'Dutchess County homeowners choose TZ Electric for quality craftsmanship and honest home services — from Rhinebeck to Poughkeepsie.',
    longDescription: 'Dutchess County represents a growing part of our service territory. From the historic village of Rhinebeck to the bustling city of Poughkeepsie and the charming towns of Red Hook and Hyde Park, we bring our full suite of home comfort services to every community. As a Mitsubishi Diamond Contractor and Generac Authorized Dealer, we offer the most advanced heating, cooling, and backup power solutions available.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Dutchess County, NY | TZ Electric',
    metaDescription: 'TZ Electric provides plumbing, HVAC, electrical, and generator services throughout Dutchess County, NY. Rhinebeck, Poughkeepsie, Red Hook & more. 330+ 5-star reviews.',
    cities: ['Rhinebeck', 'Poughkeepsie', 'Red Hook', 'Hyde Park', 'Millbrook', 'Beacon', 'Fishkill', 'Wappingers Falls', 'Tivoli', 'Milan'],
    services: ['Plumbing', 'HVAC', 'Electrical', 'Mini Splits', 'Generators', 'Hot Water Heaters', 'Emergency Services'],
  },
  {
    slug: 'albany-county',
    county: 'Albany',
    state: 'NY',
    description: 'TZ Electric extends our trusted home services to Albany County — professional plumbing, HVAC, electrical, and generator solutions for the Capital District.',
    longDescription: 'Albany County homeowners at the southern edge of the Capital District can count on TZ Electric for the same exceptional service that has earned us 330+ five-star reviews. From the city of Albany to the suburban communities of Delmar, Guilderland, and Colonie, we deliver professional plumbing, heating, cooling, electrical, and generator services. Our factory-trained technicians and upfront pricing make us the trusted choice for home comfort.',
    metaTitle: 'Plumbing, HVAC & Electrical Services in Albany County, NY | TZ Electric',
    metaDescription: 'Expert plumbing, HVAC, electrical, and generator services in Albany County, NY. TZ Electric — serving Albany, Delmar, Guilderland & more. 330+ 5-star reviews. Call (518) 678-1230.',
    cities: ['Albany', 'Delmar', 'Guilderland', 'Colonie', 'Ravena', 'Coeymans', 'Bethlehem', 'Altamont', 'Voorheesville', 'Westerlo'],
    services: ['Plumbing', 'HVAC', 'Electrical', 'Mini Splits', 'Generators', 'Hot Water Heaters', 'Emergency Services'],
  },
]

export function getCountyBySlug(slug: string): CountyArea | undefined {
  return COUNTY_AREAS.find((area) => area.slug === slug)
}

export function getAllServiceAreaSlugs(): string[] {
  return SERVICE_AREAS.map((area) => area.slug)
}
