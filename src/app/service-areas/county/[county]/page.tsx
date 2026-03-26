import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata } from '@/lib/metadata'
import { COUNTY_AREAS, SERVICE_AREAS, getCountyBySlug } from '@/lib/service-areas-data'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export function generateStaticParams() {
  return COUNTY_AREAS.map((county) => ({ county: county.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ county: string }> }) {
  const { county: slug } = await params
  const county = getCountyBySlug(slug)
  if (!county) return {}

  return createMetadata({
    title: county.metaTitle,
    description: county.metaDescription,
    path: `/service-areas/county/${county.slug}`,
  })
}

const serviceIcons: Record<string, React.ReactNode> = {
  Plumbing: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655M15.17 11.42l5.653-4.655a2.548 2.548 0 00-3.586-3.586l-4.655 5.653M11.42 15.17l3.75-3.75" />
    </svg>
  ),
  HVAC: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  ),
  Electrical: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  'Mini Splits': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  Generators: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" />
    </svg>
  ),
  'Hot Water Heaters': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  ),
  'Emergency Services': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
}

const serviceHrefs: Record<string, string> = {
  Plumbing: '/plumbing',
  HVAC: '/hvac',
  Electrical: '/electrical',
  'Mini Splits': '/mini-split',
  Generators: '/generator',
  'Hot Water Heaters': '/hot-water-heaters',
  'Emergency Services': '/emergency',
}

export default async function CountyPage({ params }: { params: Promise<{ county: string }> }) {
  const { county: slug } = await params
  const county = getCountyBySlug(slug)
  if (!county) notFound()

  // Get city pages that belong to this county
  const countyCity = SERVICE_AREAS.filter(
    (a) => a.county.toLowerCase() === county.county.toLowerCase()
  )

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `https://tzelectricinc.com/` },
      { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `https://tzelectricinc.com/service-areas` },
      { '@type': 'ListItem', position: 3, name: `${county.county} County`, item: `https://tzelectricinc.com/service-areas/county/${county.slug}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-navy py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/misc/service-area-map.avif"
            alt={`${county.county} County service area`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/40" />
        </div>

        <ElectricCursor />

        <div className="container-site relative z-10">
          <div className="max-w-3xl">
            <span className="text-blue-light text-sm font-semibold uppercase tracking-wider">
              Service Area
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              {county.county} County, {county.state}
            </h1>
            <p className="mt-4 text-gray-200 text-lg max-w-2xl leading-relaxed">
              {county.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={TYPEFORM_URL} external size="lg">
                Get a Free Quote
              </Button>
              <Button href={`tel:${COMPANY.phoneRaw}`} variant="outline" size="lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call {COMPANY.phone}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About This County */}
      <section className="section-padding">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <SectionHeader
                label={`${county.county} County`}
                title={`Trusted Home Services Across ${county.county} County`}
                description=""
              />
              <p className="text-gray-600 leading-relaxed -mt-4">
                {county.longDescription}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-navy/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-heading font-bold text-navy">330+</div>
                  <div className="text-sm text-gray-500">5-Star Reviews</div>
                </div>
                <div className="bg-navy/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-heading font-bold text-navy">12+</div>
                  <div className="text-sm text-gray-500">Years Experience</div>
                </div>
                <div className="bg-navy/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-heading font-bold text-navy">24/7</div>
                  <div className="text-sm text-gray-500">Emergency Service</div>
                </div>
                <div className="bg-navy/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-heading font-bold text-navy">100%</div>
                  <div className="text-sm text-gray-500">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Towns We Serve */}
            <div>
              <h3 className="font-heading font-bold text-navy text-xl mb-4">
                Towns & Cities We Serve in {county.county} County
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {county.cities.map((city) => {
                  const cityPage = countyCity.find(
                    (a) => a.city.toLowerCase() === city.toLowerCase()
                  )
                  return cityPage ? (
                    <Link
                      key={city}
                      href={`/service-areas/${cityPage.slug}`}
                      className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-navy hover:border-blue/30 hover:text-blue transition-colors"
                    >
                      <svg className="w-4 h-4 text-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {city}, NY
                    </Link>
                  ) : (
                    <div
                      key={city}
                      className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600"
                    >
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {city}, NY
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Available */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <SectionHeader
            label="Our Services"
            title={`Services Available in ${county.county} County`}
            description={`We provide a full range of home comfort services to homeowners throughout ${county.county} County, NY.`}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {county.services.map((service) => (
              <Link
                key={service}
                href={serviceHrefs[service] || '/services'}
                className="group flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-5 hover:border-blue/30 hover:shadow-md transition-all"
              >
                <span className="w-10 h-10 rounded-xl bg-blue/10 text-blue flex items-center justify-center flex-shrink-0 group-hover:bg-blue group-hover:text-white transition-colors">
                  {serviceIcons[service]}
                </span>
                <div>
                  <span className="font-heading font-semibold text-navy text-sm group-hover:text-blue transition-colors">
                    {service}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us for This County */}
      <section className="section-padding">
        <div className="container-site text-center max-w-3xl mx-auto">
          <SectionHeader
            label="Why TZ Electric"
            title={`Why ${county.county} County Homeowners Choose Us`}
            description=""
          />
          <div className="grid sm:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="w-14 h-14 bg-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-navy">Local Experts</h3>
              <p className="mt-2 text-gray-600 text-sm">Based right here in the Hudson Valley — we know {county.county} County inside and out.</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-navy">Fast Response</h3>
              <p className="mt-2 text-gray-600 text-sm">24/7 emergency service with rapid response times across {county.county} County.</p>
            </div>
            <div>
              <div className="w-14 h-14 bg-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-navy">Certified Pros</h3>
              <p className="mt-2 text-gray-600 text-sm">Mitsubishi Diamond Elite Contractor, Generac Authorized Dealer, BBB Accredited.</p>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
