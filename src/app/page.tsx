import type { Metadata } from 'next'
import { COMPANY, SERVICES, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import HeroSection from '@/components/sections/HeroSection'
import CertificationSlider from '@/components/sections/CertificationSlider'
import ServicesGrid from '@/components/sections/ServicesGrid'
import TrustBar from '@/components/sections/TrustBar'
import WhyChooseUs from '@/components/sections/WhyChooseUs'
import ReviewsSection from '@/components/sections/ReviewsSection'
import ServiceAreaSection from '@/components/sections/ServiceAreaSection'
import CTASection from '@/components/sections/CTASection'

export const metadata: Metadata = createMetadata({
  title: `${COMPANY.name} | Expert ${COMPANY.tagline} | ${COMPANY.serviceArea}`,
  description: `Your trusted ${COMPANY.serviceArea} home services contractor. Expert plumbing, heating, cooling, electrical & generator services. ${COMPANY.reviews.count}+ 5-star reviews. Call ${COMPANY.phone} for a free quote.`,
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
      <CTASection />
    </>
  )
}
