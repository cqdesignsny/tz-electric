import Image from 'next/image'
import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema, getFAQSchema } from '@/lib/metadata'
import {
  UNIT_TYPES,
  TECHNOLOGIES,
  SMART_CONTROLS,
  BENEFITS,
  MITSUBISHI_FAQS,
} from '@/lib/mitsubishi-data'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title:
    'Mitsubishi Electric Diamond Elite Contractor | Mini Split Installation Hudson Valley',
  description:
    'TZ Electric is a Mitsubishi Electric Diamond Elite Contractor — the highest dealer tier. Expert ductless mini split installation, Hyper-Heating systems, and smart controls. Serving the Hudson Valley. Call (518) 678-1230.',
  path: '/mitsubishi',
})

// SVG icons for unit types
const unitIcons: Record<string, React.ReactNode> = {
  wall: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  ceiling: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ducted: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  airhandler: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  ),
  floor: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
}

export default function MitsubishiPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: 'Mitsubishi Electric', url: '/mitsubishi' },
  ])
  const faqSchema = getFAQSchema(MITSUBISHI_FAQS)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-navy overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/services/mini-split.webp"
            alt="Mitsubishi Electric ductless mini split system"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/80" />
        </div>

        {/* Electric Cursor Effect */}
        <ElectricCursor />

        <div className="container-site relative z-10 py-16 lg:py-24">
          <div className="max-w-3xl">
            {/* Diamond Elite Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6">
              <Image
                src="/images/certifications/mitsubishi-diamond.webp"
                alt="Mitsubishi Diamond Elite Contractor"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="text-blue-light text-sm font-semibold">
                Diamond Elite Contractor
              </span>
            </div>

            <h1 className="text-white text-4xl lg:text-5xl xl:text-6xl font-heading font-bold leading-[1.1]">
              Hudson Valley&apos;s{' '}
              <span className="text-blue-light">Mitsubishi Electric</span>{' '}
              HVAC Experts
            </h1>

            <p className="mt-6 text-gray-300 text-lg lg:text-xl max-w-2xl leading-relaxed">
              As a Mitsubishi Electric Diamond Elite Contractor &mdash; the
              highest dealer certification &mdash; we deliver superior ductless
              mini split installation, Hyper-Heating systems, and smart climate
              control for homes across the Hudson Valley.
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call {COMPANY.phone}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Indoor Unit Types */}
      <section className="section-padding">
        <div className="container-site">
          <SectionHeader
            label="Indoor Unit Types"
            title="Mitsubishi Electric Indoor Units"
            description="Five versatile indoor unit styles to match any room, aesthetic, and comfort need."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {UNIT_TYPES.map((unit) => (
              <div
                key={unit.name}
                className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-blue/30 hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue/10 text-blue flex items-center justify-center mb-4 group-hover:bg-blue group-hover:text-white transition-colors">
                  {unitIcons[unit.icon]}
                </div>
                <h3 className="font-heading font-bold text-navy text-lg">
                  {unit.name}
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  {unit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proprietary Technologies */}
      <section className="section-padding bg-off-white">
        <div className="container-site">
          <SectionHeader
            label="Exclusive Technology"
            title="Mitsubishi Electric Innovation"
            description="Proprietary technologies that deliver superior comfort, efficiency, and reliability."
          />

          <div className="space-y-4 max-w-4xl mx-auto">
            {TECHNOLOGIES.map((tech) => (
              <div
                key={tech.name}
                className="bg-white rounded-xl border border-gray-200 p-6 flex gap-4 items-start hover:shadow-card transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-blue text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-navy">{tech.name}</h3>
                  <p className="mt-1 text-gray-600 text-sm leading-relaxed">{tech.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="section-padding">
        <div className="container-site">
          <SectionHeader
            label="Why Mitsubishi"
            title="Benefits of Mitsubishi Mini Splits"
            description="Energy-efficient, whisper-quiet, and built for extreme cold — here's why homeowners choose Mitsubishi."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => (
              <div
                key={benefit.title}
                className="text-center p-6 rounded-xl bg-gradient-to-b from-blue/5 to-transparent border border-blue/10 hover:border-blue/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-blue/10 text-blue flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-navy text-sm">{benefit.title}</h3>
                <p className="mt-2 text-gray-600 text-xs leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Controls */}
      <section className="section-padding bg-navy">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue-light text-sm font-semibold uppercase tracking-wider">Smart Home Ready</span>
            <h2 className="font-heading font-bold text-white text-3xl mt-2">
              Control Your Comfort From Anywhere
            </h2>
            <p className="mt-3 text-gray-400">
              Mitsubishi Electric&apos;s kumo cloud&reg; platform and smart controllers
              put total climate control at your fingertips.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {SMART_CONTROLS.map((control) => (
              <div
                key={control.name}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue/20 text-blue-light flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-white">{control.name}</h3>
                <p className="mt-2 text-gray-400 text-sm leading-relaxed">{control.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diamond Elite Credential */}
      <section className="section-padding bg-gradient-to-br from-blue to-blue-dark">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue-100 text-sm font-semibold uppercase tracking-wider">
                Our Certification
              </span>
              <h2 className="font-heading font-bold text-white text-3xl lg:text-4xl mt-2">
                What Diamond Elite Means for You
              </h2>
              <p className="mt-4 text-blue-100 leading-relaxed">
                Diamond Elite is the highest certification tier Mitsubishi Electric
                awards to its contractors. Only a select few companies in the entire
                Hudson Valley hold this distinction.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Extensive factory-authorized training completed',
                  'Highest installation quality standards maintained',
                  'Best available manufacturer warranties offered',
                  'Access to the full Mitsubishi product line',
                  'Ongoing education on the latest technologies',
                  'Direct support from Mitsubishi Electric',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white">
                    <svg className="w-5 h-5 text-blue-200 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm">
                <Image
                  src="/images/certifications/mitsubishi-diamond.webp"
                  alt="Mitsubishi Diamond Elite Contractor certification"
                  width={200}
                  height={200}
                  className="mx-auto object-contain"
                />
                <h3 className="font-heading font-bold text-navy text-xl mt-6">
                  Mitsubishi Electric Diamond Elite
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  Awarded to TZ Electric, Inc. for exceptional installation
                  standards and customer service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container-site max-w-3xl">
          <SectionHeader
            label="FAQ"
            title="Mitsubishi Mini Split Questions"
            description="Answers to common questions about Mitsubishi Electric systems and our installation services."
          />
          <div className="space-y-3">
            {MITSUBISHI_FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-blue/20 transition-colors"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-heading font-semibold text-navy hover:text-blue transition-colors">
                  {faq.question}
                  <svg className="w-5 h-5 text-blue group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
