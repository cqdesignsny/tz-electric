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

      {/* Newsletter Signup */}
      <section className="py-12 bg-gradient-to-r from-blue to-blue-dark">
        <div className="container-site">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-heading font-bold text-white text-2xl md:text-3xl">
              Stay in the Loop
            </h2>
            <p className="mt-2 text-blue-100 text-sm md:text-base">
              Get seasonal tips, exclusive promotions, and service reminders delivered to your inbox.
            </p>
            <form
              action="#"
              method="POST"
              className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-3 rounded-full text-navy text-sm placeholder-gray-500 bg-white border-2 border-white/80 focus:outline-none focus:ring-2 focus:ring-white focus:border-white shadow-inner"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-accent text-white font-heading font-semibold text-sm rounded-full hover:bg-accent-dark transition-colors shadow-lg"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-blue-200 text-xs">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

    </>
  )
}
