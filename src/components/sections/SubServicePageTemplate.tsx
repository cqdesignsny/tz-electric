import Image from 'next/image'
import Link from 'next/link'
import { COMPANY, QUOTE_URL } from '@/lib/constants'
import type { SubServicePage } from '@/lib/sub-services-data'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/metadata'
import SectionHeader from '@/components/ui/SectionHeader'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'
import { TrustIndexBadge } from '@/components/ui/TrustIndexWidget'

interface SubServicePageTemplateProps {
  service: SubServicePage
}

export default function SubServicePageTemplate({ service }: SubServicePageTemplateProps) {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
    { name: service.parentTitle, url: `/${service.parent}` },
    { name: service.title, url: `/${service.parent}/${service.slug}` },
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

      {/* Hero */}
      <section className="relative bg-navy overflow-hidden min-h-[460px] lg:min-h-[520px] flex items-center">
        <Image src={service.image.src} alt="" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
        <ElectricCursor />
        <div className="container-site relative z-10 py-16 lg:py-24">
          <div className="max-w-3xl">
            <nav className="mb-5 flex items-center gap-2 text-sm">
              <Link href={`/${service.parent}`} className="text-blue-light font-medium hover:text-white transition-colors">{service.parentTitle}</Link>
              <svg className="w-3.5 h-3.5 text-white/50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-white/80">{service.title}</span>
            </nav>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight">{service.heroTitle}</h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl leading-relaxed">{service.heroDescription}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href={QUOTE_URL} size="lg">Get a Free Quote</Button>
              <Button href={`tel:${COMPANY.phoneRaw}`} variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-navy">
                Call {COMPANY.phone}
              </Button>
              <div className="hero-trust-badge scale-90 origin-left"><TrustIndexBadge /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      {service.overview && service.overview.length > 0 && (
        <section className="section-padding">
          <div className="container-site">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <span className="text-blue text-sm font-semibold uppercase tracking-wider">About This Service</span>
                <h2 className="font-heading font-bold text-navy mt-2 text-3xl lg:text-4xl">{service.title}</h2>
                <div className="mt-6 space-y-4">
                  {service.overview.map((paragraph, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed text-lg">{paragraph}</p>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button href={QUOTE_URL}>Get a Free Quote</Button>
                  <Button href={`tel:${COMPANY.phoneRaw}`} variant="outline">Call {COMPANY.phone}</Button>
                </div>
              </div>
              <div className="relative rounded-2xl aspect-[4/3] overflow-hidden shadow-xl">
                <Image src={service.image.src} alt={service.image.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Signs You Need This Service */}
      {service.signsList && service.signsList.length > 0 && (
        <section className="section-padding bg-off-white">
          <div className="container-site">
            <SectionHeader
              label="Is This Right for You?"
              title={`Signs You May Need ${service.title}`}
              description="Common indicators our Hudson Valley customers recognize before they call us."
            />
            <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {service.signsList.map((sign, i) => (
                <div key={i} className="flex gap-4 bg-white rounded-2xl p-6 border-2 border-orange-100 shadow-sm hover:border-orange-300 hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border-2 border-orange-200 text-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-navy mb-1">{sign.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{sign.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Steps */}
      {service.process && service.process.length > 0 && (
        <section className="section-padding bg-navy">
          <div className="container-site">
            <div className="text-center mb-12">
              <span className="text-blue-light text-sm font-semibold uppercase tracking-wider">How It Works</span>
              <h2 className="font-heading font-bold text-white mt-2 text-3xl lg:text-4xl">Our {service.title} Process</h2>
              <p className="mt-3 text-gray-400 max-w-xl mx-auto">A straightforward process from start to finish — no surprises, no hidden fees.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.process.map((step, i) => (
                <div key={i} className="relative bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-blue/40 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue flex items-center justify-center text-white font-heading font-bold text-xl mb-5">{step.step}</div>
                  <h3 className="font-heading font-bold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* What We Offer (Features) */}
      <section className="section-padding">
        <div className="container-site">
          <SectionHeader
            label="What&apos;s Included"
            title={`Our ${service.title} Services`}
            description={`Everything covered under our ${service.title.toLowerCase()} offering for Hudson Valley homeowners.`}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.features.map((feature) => (
              <div key={feature.title} className="relative bg-white rounded-2xl border-2 border-blue/20 p-7 pt-8 shadow-sm hover:shadow-lg hover:border-blue/50 hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-blue to-blue-light rounded-b-full opacity-50 group-hover:opacity-100 group-hover:left-0 group-hover:right-0 transition-all duration-300" />
                <div className="w-11 h-11 bg-blue/10 border-2 border-blue/20 rounded-xl flex items-center justify-center text-blue mb-5 group-hover:bg-blue group-hover:border-blue group-hover:text-white group-hover:scale-105 transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-navy text-lg mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose TZ */}
      <section className="section-padding bg-off-white">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-blue text-sm font-semibold uppercase tracking-wider">Why Choose TZ Electric</span>
              <h2 className="font-heading font-bold text-navy mt-2 text-3xl lg:text-4xl">
                Hudson Valley&apos;s Most Trusted {service.title} Team
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed text-lg">
                With over 12 years of experience and {COMPANY.reviews.count}+ five-star reviews,
                TZ Electric is the Hudson Valley&apos;s go-to team for {service.title.toLowerCase()}.
                Every job includes upfront pricing, professional licensed technicians, and our full satisfaction guarantee.
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
                <li className="flex items-center gap-3 text-gray-700">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Upfront Pricing — No Hidden Fees
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-navy rounded-2xl p-7 text-center">
                <div className="text-4xl font-heading font-bold text-white">12+</div>
                <div className="text-blue-light text-sm font-semibold mt-1">Years Experience</div>
              </div>
              <div className="bg-blue rounded-2xl p-7 text-center">
                <div className="text-4xl font-heading font-bold text-white">{COMPANY.reviews.count}+</div>
                <div className="text-white/80 text-sm font-semibold mt-1">5-Star Reviews</div>
              </div>
              <div className="bg-blue rounded-2xl p-7 text-center">
                <div className="text-4xl font-heading font-bold text-white">100%</div>
                <div className="text-white/80 text-sm font-semibold mt-1">Licensed &amp; Insured</div>
              </div>
              <div className="bg-navy rounded-2xl p-7 text-center">
                <div className="text-4xl font-heading font-bold text-white">24/7</div>
                <div className="text-blue-light text-sm font-semibold mt-1">Emergency Service</div>
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
            title={`${service.title} — Common Questions`}
            description="Answers to the questions we hear most from Hudson Valley homeowners."
          />
          <div className="space-y-4">
            {service.faqs.map((faq) => (
              <details key={faq.question} className="group bg-white rounded-2xl border-2 border-blue/15 overflow-hidden shadow-sm hover:border-blue/40 hover:shadow-lg transition-all duration-300">
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
                <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-blue/10 pt-4 ml-11">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
