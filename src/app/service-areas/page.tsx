import Link from 'next/link'
import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import { SERVICE_AREAS, COUNTY_AREAS } from '@/lib/service-areas-data'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Service Areas | Hudson Valley Cooling, Heating & Electrical | TZ Electric',
  description: `TZ Electric serves the entire Hudson Valley including ${COMPANY.counties.join(', ')} counties. Cooling, heating, electrical, plumbing, and generator services. ${COMPANY.reviews.count}+ 5-star reviews.`,
  path: '/service-areas',
})

export default function ServiceAreasPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Service Areas', url: '/service-areas' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-navy py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(37, 99, 235, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)',
          }} />
        </div>
        <ElectricCursor />
        <div className="container-site relative z-10">
          <div className="max-w-3xl">
            <span className="text-blue-light text-sm font-semibold uppercase tracking-wider">
              Service Areas
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              Serving the Entire Hudson Valley
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              From Catskill to Rhinebeck, Kingston to Hunter — TZ Electric provides expert
              cooling, heating, electrical, plumbing, and generator services across the Hudson Valley.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={TYPEFORM_URL} external size="lg">
                Get a Free Quote
              </Button>
              <Button
                href={`tel:${COMPANY.phoneRaw}`}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-navy"
              >
                Call {COMPANY.phone}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Counties We Serve */}
      <section className="section-padding">
        <div className="container-site">
          <div className="text-center mb-10">
            <span className="text-blue text-sm font-semibold uppercase tracking-wider">
              Counties We Serve
            </span>
            <h2 className="font-heading font-bold text-navy text-3xl mt-2">
              5 Counties Across the Hudson Valley
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              We proudly serve homeowners throughout five Hudson Valley counties with expert
              cooling, heating, electrical, plumbing, and generator services.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COUNTY_AREAS.map((county) => (
              <Link
                key={county.slug}
                href={`/service-areas/county/${county.slug}`}
                className="group relative rounded-2xl border-2 border-blue/20 bg-white p-6 transition-all duration-300 hover:border-blue hover:shadow-lg hover:shadow-blue/10 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center group-hover:bg-blue group-hover:text-white transition-all duration-300">
                      <svg className="w-5 h-5 text-blue group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <h3 className="font-heading font-bold text-navy text-lg group-hover:text-blue transition-colors">
                      {county.county} County
                    </h3>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">
                  {county.description}
                </p>
                <p className="text-xs text-blue/60 italic mb-3">
                  Primary service areas shown — we serve all communities in {county.county} County.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {county.cities.slice(0, 5).map((city) => (
                    <span key={city} className="text-xs bg-blue/5 text-blue/70 px-2 py-0.5 rounded-full">
                      {city}
                    </span>
                  ))}
                  {county.cities.length > 5 && (
                    <span className="text-xs text-gray-400 px-2 py-0.5">
                      +{county.cities.length - 5} more
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities & Towns */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <div className="text-center mb-10">
            <span className="text-blue text-sm font-semibold uppercase tracking-wider">
              Cities & Towns
            </span>
            <h2 className="font-heading font-bold text-navy text-3xl mt-2">
              Cities & Towns We Serve
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_AREAS.map((area) => (
              <Link
                key={area.slug}
                href={`/service-areas/${area.slug}`}
                className="group rounded-2xl border-2 border-blue/20 bg-white p-6 transition-all duration-300 hover:border-blue hover:shadow-lg hover:shadow-blue/10 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue/10 flex items-center justify-center group-hover:bg-blue group-hover:text-white transition-all duration-300">
                      <svg className="w-5 h-5 text-blue group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-navy text-lg group-hover:text-blue transition-colors">
                        {area.city}, {area.state}
                      </h3>
                      <span className="text-gray-500 text-sm">{area.county} County</span>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed line-clamp-2">
                  {area.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Not listed? */}
      <section className="bg-white py-12">
        <div className="container-site text-center">
          <h2 className="font-heading font-bold text-navy text-2xl">
            Don&apos;t See Your Town?
          </h2>
          <p className="mt-2 text-gray-600 max-w-lg mx-auto">
            We serve many more communities across the Hudson Valley. Give us a call to
            confirm service availability in your area.
          </p>
          <Button href={`tel:${COMPANY.phoneRaw}`} variant="secondary" className="mt-4">
            Call {COMPANY.phone}
          </Button>
        </div>
      </section>

      <CTASection />
    </>
  )
}
