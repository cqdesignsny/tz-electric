import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import { SERVICE_AREAS } from '@/lib/service-areas-data'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Service Areas | Hudson Valley Plumbing, HVAC & Electrical | TZ Electric',
  description: `TZ Electric serves the entire Hudson Valley including ${COMPANY.counties.join(', ')} counties. Plumbing, HVAC, electrical, and generator services. ${COMPANY.reviews.count}+ 5-star reviews.`,
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
              plumbing, HVAC, electrical, and generator services across the Hudson Valley.
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

      {/* Counties */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="container-site">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-navy font-semibold text-sm">Counties We Serve:</span>
            {COMPANY.counties.map((county) => (
              <span key={county} className="bg-blue/10 text-blue text-sm font-medium px-3 py-1 rounded-full">
                {county} County
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="section-padding">
        <div className="container-site">
          <div className="bg-gray-200 rounded-xl aspect-[21/9] flex items-center justify-center mb-12">
            <span className="text-gray-400 text-sm">Interactive Service Area Map</span>
          </div>

          {/* City Grid */}
          <h2 className="font-heading font-bold text-navy text-2xl mb-6">
            Cities & Towns We Serve
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_AREAS.map((area) => (
              <Card key={area.slug} href={`/service-areas/${area.slug}`} className="group">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-navy text-lg group-hover:text-blue transition-colors">
                        {area.city}, {area.state}
                      </h3>
                      <span className="text-gray-500 text-sm">{area.county} County</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {area.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Not listed? */}
      <section className="bg-gray-50 py-12">
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
