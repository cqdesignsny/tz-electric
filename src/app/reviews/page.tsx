import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'
import { TrustIndexWidget } from '@/components/ui/TrustIndexWidget'

export const metadata = createMetadata({
  title: `${COMPANY.reviews.count}+ 5-Star Reviews | TZ Electric Inc | Hudson Valley`,
  description: `Read ${COMPANY.reviews.count}+ five-star Google reviews from satisfied Hudson Valley homeowners. See why TZ Electric is the most trusted plumbing, HVAC, and electrical company in the region.`,
  path: '/reviews',
})

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: rating }).map((_, i) => (
        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Reviews', url: '/reviews' },
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
              Customer Reviews
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              {COMPANY.reviews.count}+ Five-Star Reviews
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              Don&apos;t just take our word for it — hear from the Hudson Valley homeowners
              who trust TZ Electric for all their home service needs.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating rating={5} />
                <span className="text-white font-bold text-lg">5.0</span>
              </div>
              <span className="text-gray-400">on Google</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Stats */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="container-site">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-navy">{COMPANY.reviews.count}+</p>
              <p className="text-gray-500 text-sm mt-1">Total Reviews</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy">5.0</p>
              <p className="text-gray-500 text-sm mt-1">Average Rating</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy">12+</p>
              <p className="text-gray-500 text-sm mt-1">Years of Service</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy">100%</p>
              <p className="text-gray-500 text-sm mt-1">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Index Google Reviews Widget */}
      <section className="section-padding">
        <div className="mx-auto w-[95%] max-w-[1600px]">
          <TrustIndexWidget />

          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button href={COMPANY.social.google} external variant="secondary">
                Leave Us a Review
              </Button>
              <Button href={TYPEFORM_URL} external>
                Get a Free Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
