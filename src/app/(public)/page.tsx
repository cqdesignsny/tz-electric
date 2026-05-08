import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPANY, SERVICES, QUOTE_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import HeroSection from '@/components/sections/HeroSection'
import CertificationSlider from '@/components/sections/CertificationSlider'
import ServicesGrid from '@/components/sections/ServicesGrid'
import TrustBar from '@/components/sections/TrustBar'
import WhyChooseUs from '@/components/sections/WhyChooseUs'
import ReviewsSection from '@/components/sections/ReviewsSection'
import ServiceAreaSection from '@/components/sections/ServiceAreaSection'
import ClaireSection from '@/components/claire/ClaireSection'

export const metadata: Metadata = createMetadata({
  title: `${COMPANY.name} | Expert ${COMPANY.tagline} | ${COMPANY.serviceArea}`,
  description: `Your trusted ${COMPANY.serviceArea} home services contractor. Expert cooling, heating, electrical, plumbing & generator services. ${COMPANY.reviews.count}+ 5-star reviews. Call ${COMPANY.phone} for a free quote.`,
  path: '',
})

export default function HomePage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <HeroSection />
      <CertificationSlider />
      <TrustBar />
      <ServicesGrid />
      <WhyChooseUs />
      <ClaireSection
        source="homepage_section"
        eyebrow="Meet Claire. Online Now."
        heading={"Need answers fast? Claire's on it."}
        description="Claire is our smart assistant for every service we offer in the Hudson Valley. Cooling, heating, electrical, plumbing, generators, EV chargers. Ask about pricing, timing, what to expect, or book a free estimate without picking up the phone."
        tone="dark"
      />
      <ReviewsSection />
      <ServiceAreaSection />

      {/* Bottom CTA strip */}
      <section className="py-12 bg-gradient-to-r from-blue to-blue-dark">
        <div className="container-site">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading font-bold text-white text-2xl md:text-3xl">
              Got a project? Let&apos;s talk.
            </h2>
            <p className="mt-2 text-blue-100 text-sm md:text-base">
              Free estimates across the Hudson Valley. Same-week scheduling for most jobs.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={QUOTE_URL}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-accent text-white font-heading font-semibold text-sm rounded-full hover:bg-accent-dark transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Get a Free Estimate
              </Link>
              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-blue font-heading font-semibold text-sm rounded-full hover:bg-gray-100 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
