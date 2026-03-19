import type { Metadata } from 'next'
import Image from 'next/image'
import { COMPANY, SERVICES, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import HeroSection from '@/components/sections/HeroSection'
import CertificationSlider from '@/components/sections/CertificationSlider'
import ServicesGrid from '@/components/sections/ServicesGrid'
import TrustBar from '@/components/sections/TrustBar'
import WhyChooseUs from '@/components/sections/WhyChooseUs'
import ReviewsSection from '@/components/sections/ReviewsSection'
import ServiceAreaSection from '@/components/sections/ServiceAreaSection'

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
      <ReviewsSection />
      <ServiceAreaSection />

      {/* Trust & Certifications Section (replaces repetitive CTA) */}
      <section className="section-padding bg-off-white">
        <div className="container-site text-center">
          <span className="text-blue text-sm font-semibold uppercase tracking-wider">
            Certified & Trusted
          </span>
          <h2 className="font-heading font-bold text-navy text-3xl md:text-4xl mt-2">
            Industry-Leading Certifications
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We hold the highest certifications in the industry, ensuring every job meets premium standards of quality and safety.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-10 md:gap-16">
            <Image
              src="/images/certifications/diamond-contractor.svg"
              alt="Mitsubishi Diamond Contractor"
              width={200}
              height={60}
              className="h-14 w-auto"
            />
            <Image
              src="/images/certifications/mitsubishi-electric.svg"
              alt="Mitsubishi Electric"
              width={160}
              height={64}
              className="h-12 w-auto"
            />
            <Image
              src="/images/certifications/generac.webp"
              alt="Generac Authorized Dealer"
              width={140}
              height={64}
              className="h-12 w-auto"
            />
            <Image
              src="/images/certifications/bbb.webp"
              alt="BBB Accredited Business"
              width={140}
              height={64}
              className="h-12 w-auto"
            />
          </div>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-navy">12+</div>
              <div className="text-sm text-gray-500">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-navy">{COMPANY.reviews.count}+</div>
              <div className="text-sm text-gray-500">5-Star Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-navy">5</div>
              <div className="text-sm text-gray-500">Counties Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-heading font-bold text-navy">24/7</div>
              <div className="text-sm text-gray-500">Emergency Service</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
