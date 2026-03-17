import Image from 'next/image'
import { COMPANY, SERVICES, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Our Services | Plumbing, HVAC, Electrical & More',
  description: `TZ Electric offers complete home services in the Hudson Valley: electrical, HVAC, mini splits, generators, plumbing, and hot water heaters. ${COMPANY.reviews.count}+ 5-star reviews. Call ${COMPANY.phone}.`,
  path: '/services',
})

const serviceDetails: Record<string, { features: string[] }> = {
  electrical: {
    features: ['Panel Upgrades', 'Whole-Home Rewiring', 'Lighting Installation', 'EV Charger Installation', 'Surge Protection'],
  },
  hvac: {
    features: ['Furnace Installation & Repair', 'Boiler Services', 'Air Conditioning', 'Heat Pumps', 'Ductwork'],
  },
  'mini-split': {
    features: ['Single-Zone Systems', 'Multi-Zone Systems', 'Hyper-Heating', 'Concealed Duct Units', 'Repair & Maintenance'],
  },
  generator: {
    features: ['Whole-Home Generators', 'Generator Sizing', 'Automatic Transfer Switch', 'Maintenance Plans', 'Repair Service'],
  },
  plumbing: {
    features: ['Pipe Repair & Replacement', 'Drain Cleaning', 'Fixture Installation', 'Sewer Line Services', 'Gas Line Services'],
  },
  'hot-water-heaters': {
    features: ['Tankless Water Heaters', 'Traditional Tank Heaters', 'Hybrid Heat Pump Heaters', 'Water Heater Repair', 'Emergency Replacement'],
  },
}

export default function ServicesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
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
              Our Services
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              Complete Home Services Under One Roof
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              From plumbing to HVAC, electrical to generators — TZ Electric handles it all.
              One call, one company, total comfort for your Hudson Valley home.
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

      {/* All Services */}
      <section className="section-padding">
        <div className="container-site">
          <SectionHeader
            label="What We Do"
            title="Expert Home Services for Every Need"
            description={`With over 20 years of experience and ${COMPANY.reviews.count}+ five-star reviews, we deliver professional results on every job.`}
          />

          <div className="space-y-8">
            {SERVICES.map((service, index) => {
              const details = serviceDetails[service.slug]
              const isEven = index % 2 === 1

              return (
                <Card key={service.slug} href={`/${service.slug}`} className="group">
                  <div className={`grid lg:grid-cols-2 gap-8 p-8 ${isEven ? 'lg:direction-rtl' : ''}`}>
                    <div className={isEven ? 'lg:direction-ltr' : ''}>
                      <span className="text-blue text-sm font-semibold uppercase tracking-wider">
                        {service.caption}
                      </span>
                      <h2 className="font-heading font-bold text-navy text-2xl mt-1">
                        {service.title}
                      </h2>
                      <p className="mt-3 text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                      {details && (
                        <ul className="mt-4 grid grid-cols-2 gap-2">
                          {details.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                              <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      <span className="inline-flex items-center gap-1 text-blue text-sm font-semibold mt-4 group-hover:gap-2 transition-all">
                        Learn More
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                    <div className={`relative rounded-xl aspect-[4/3] overflow-hidden ${isEven ? 'lg:direction-ltr' : ''}`}>
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="bg-navy py-12">
        <div className="container-site text-center">
          <h2 className="text-white text-2xl lg:text-3xl font-heading font-bold">
            24/7 Emergency Services Available
          </h2>
          <p className="mt-2 text-gray-300 max-w-xl mx-auto">
            Emergencies don&apos;t wait — neither do we. Call us anytime for urgent plumbing, heating, cooling, or electrical repairs.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button href="/emergency" variant="emergency" size="lg">
              Emergency Services
            </Button>
            <Button
              href={`tel:${COMPANY.phoneRaw}`}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-navy"
            >
              Call Now: {COMPANY.phone}
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
