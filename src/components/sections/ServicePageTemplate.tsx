import Image from 'next/image'
import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import type { ServicePage } from '@/lib/services-data'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/metadata'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'
import { TrustIndexBadge } from '@/components/ui/TrustIndexWidget'

interface ServicePageTemplateProps {
  service: ServicePage
}

export default function ServicePageTemplate({ service }: ServicePageTemplateProps) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.title, url: `/${service.slug}` },
  ])

  const faqSchema = getFAQSchema(service.faqs)

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

      {/* Hero with Background Image */}
      <section className="relative bg-navy overflow-hidden min-h-[420px] lg:min-h-[480px] flex items-center">
        {/* Background Image */}
        <Image
          src={service.image.src}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />

        {/* Electric Cursor Effect */}
        <ElectricCursor />

        <div className="container-site relative z-10 py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-6">
              <TrustIndexBadge />
            </div>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight">
              {service.heroTitle}
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              {service.heroDescription}
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

      {/* Features */}
      <section className="section-padding">
        <div className="container-site">
          <SectionHeader
            label="What We Offer"
            title={`Our ${service.title}`}
            description={`Comprehensive ${service.title.toLowerCase()} for homeowners across the ${COMPANY.serviceArea} region.`}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 bg-blue/10 rounded-lg flex items-center justify-center text-blue mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-navy mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TZ */}
      <section className="section-padding bg-off-white">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue text-sm font-semibold uppercase tracking-wider">
                Why Choose TZ Electric
              </span>
              <h2 className="font-heading font-bold text-navy mt-2">
                Trusted {service.title} in the Hudson Valley
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                With over 20 years of experience and {COMPANY.reviews.count}+ five-star reviews,
                we&apos;re the Hudson Valley&apos;s go-to team for {service.title.toLowerCase()}.
                Every job comes with upfront pricing, professional technicians, and our satisfaction guarantee.
              </p>
              <ul className="mt-6 space-y-3">
                {COMPANY.certifications.map((cert) => (
                  <li key={cert} className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {cert}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {COMPANY.financing.join(' & ')} Financing Available
                </li>
              </ul>
            </div>
            <div className="relative rounded-2xl aspect-[4/3] overflow-hidden">
              <Image
                src={service.image.src}
                alt={service.image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container-site max-w-3xl">
          <SectionHeader
            label="FAQ"
            title={`${service.title} Questions`}
            description="Get answers to the most common questions about our services."
          />
          <div className="space-y-4">
            {service.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-blue/30 transition-colors"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-heading font-semibold text-navy hover:text-blue transition-colors">
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue/10 text-blue flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                    </span>
                    {faq.question}
                  </span>
                  <svg className="w-5 h-5 text-blue group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-blue/10 pt-4 ml-11">
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
