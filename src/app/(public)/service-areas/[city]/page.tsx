import { notFound } from 'next/navigation'
import { COMPANY, SERVICES, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import { SERVICE_AREAS, getServiceAreaBySlug, getAllServiceAreaSlugs } from '@/lib/service-areas-data'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

const serviceIcons: Record<string, React.ReactNode> = {
  electrical: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  hvac: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  ),
  mitsubishi: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  generator: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M4.5 10.5H18V15H4.5v-4.5zM3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" />
    </svg>
  ),
  plumbing: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1m0 0L4.16 8.91a2.122 2.122 0 010-3l.97-.97a2.122 2.122 0 013 0l3.26 3.26m0 0l1.41 1.41m-1.41-1.41l5.66-5.66a2.122 2.122 0 013 0l.97.97a2.122 2.122 0 010 3l-5.66 5.66" />
    </svg>
  ),
  'hot-water-heaters': (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  ),
  emergency: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
}

export function generateStaticParams() {
  return getAllServiceAreaSlugs().map((city) => ({ city }))
}

type PageProps = {
  params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { city } = await params
  const area = getServiceAreaBySlug(city)
  if (!area) return {}

  return createMetadata({
    title: area.metaTitle,
    description: area.metaDescription,
    path: `/service-areas/${area.slug}`,
  })
}

export default async function CityServiceAreaPage({ params }: PageProps) {
  const { city } = await params
  const area = getServiceAreaBySlug(city)
  if (!area) notFound()

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Service Areas', url: '/service-areas' },
    { name: `${area.city}, ${area.state}`, url: `/service-areas/${area.slug}` },
  ])

  const otherAreas = SERVICE_AREAS.filter((a) => a.slug !== area.slug).slice(0, 4)

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
              {area.county} County
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              Home Services in {area.city}, {area.state}
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              {area.description}
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

      {/* Services Available */}
      <section className="section-padding">
        <div className="container-site">
          <h2 className="font-heading font-bold text-navy text-2xl mb-2">
            Services Available in {area.city}
          </h2>
          <p className="text-gray-600 mb-8">
            Full-service cooling, heating, electrical, plumbing, and generator solutions for {area.city} homeowners.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <Card key={service.slug} href={`/${service.slug}`} className="group">
                <div className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-blue/10 text-blue flex items-center justify-center">
                    {serviceIcons[service.slug] || (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1" />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-heading font-bold text-navy mt-3 group-hover:text-blue transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-blue text-sm font-semibold mt-3 group-hover:gap-2 transition-all">
                    Learn More
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why TZ Electric */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <h2 className="font-heading font-bold text-navy text-2xl mb-8">
            Why {area.city} Homeowners Choose TZ Electric
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: `${COMPANY.reviews.count}+ 5-Star Reviews`, desc: 'The most trusted home service company in the Hudson Valley.' },
              { title: '24/7 Emergency Service', desc: `${area.city} emergencies handled fast. Call anytime, day or night.` },
              { title: 'Licensed & Insured', desc: 'Fully certified technicians you can trust in your home.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="font-heading font-bold text-navy">{item.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Service Areas */}
      <section className="section-padding">
        <div className="container-site">
          <h2 className="font-heading font-bold text-navy text-2xl mb-6">
            Other Areas We Serve
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherAreas.map((other) => (
              <Card key={other.slug} href={`/service-areas/${other.slug}`} className="group">
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-navy group-hover:text-blue transition-colors">
                    {other.city}, {other.state}
                  </h3>
                  <span className="text-gray-500 text-xs">{other.county} County</span>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <Button href="/service-areas" variant="secondary" size="sm">
              View All Service Areas
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
