import Image from 'next/image'
import Link from 'next/link'
import { COMPANY, SERVICES, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Our Services | Cooling, Heating, Electrical & More',
  description: `TZ Electric offers complete home services in the Hudson Valley: mini splits, HVAC, electrical, plumbing, generators, and hot water heaters. ${COMPANY.reviews.count}+ 5-star reviews. Call ${COMPANY.phone}.`,
  path: '/services',
})

const serviceDetails: Record<string, { features: string[] }> = {
  electrical: {
    features: ['Panel Upgrades', 'Whole-Home Rewiring', 'Lighting Installation', 'EV Charger Installation', 'Surge Protection'],
  },
  hvac: {
    features: ['Furnace Installation & Repair', 'Air Conditioning', 'Heat Pumps', 'Ductwork', 'Maintenance Plans'],
  },
  'mini-split': {
    features: ['Single-Zone Systems', 'Multi-Zone Systems', 'Hyper-Heating', 'Concealed Duct Units', 'Repair & Maintenance'],
  },
  generator: {
    features: ['Whole-Home Generators', 'Generator Sizing', 'Automatic Transfer Switch', 'Maintenance Plans', 'Repair Service'],
  },
  plumbing: {
    features: ['Pipe Repair & Replacement', 'Drain Cleaning', 'Fixture Installation', 'Water Line Repair'],
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
            description={`With over 12 years of experience and ${COMPANY.reviews.count}+ five-star reviews, we deliver professional results on every job.`}
          />
        </div>

        <div className="mx-auto w-[95%] max-w-[1600px]">
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((service) => {
              const details = serviceDetails[service.slug]

              return (
                <Link
                  key={service.slug}
                  href={`/${service.slug}`}
                  className="group relative rounded-2xl border-2 border-blue/20 bg-white overflow-hidden transition-all duration-300 hover:border-blue hover:shadow-xl hover:shadow-blue/10 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 95vw, 47vw"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <span className="text-blue text-xs font-bold uppercase tracking-widest">
                      {service.caption}
                    </span>
                    <h2 className="font-heading font-bold text-navy text-xl mt-1 group-hover:text-blue transition-colors">
                      {service.title}
                    </h2>
                    <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>

                    {details && (
                      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {details.features.slice(0, 4).map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-xs text-gray-600">
                            <svg className="w-3.5 h-3.5 text-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    <span className="inline-flex items-center gap-1.5 text-blue text-sm font-bold mt-4 group-hover:gap-3 transition-all">
                      Learn More
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>

                  {/* Blue accent bar at bottom */}
                  <div className="h-1 bg-gradient-to-r from-blue to-blue-light transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
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
