import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: `${COMPANY.reviews.count}+ 5-Star Reviews | TZ Electric Inc | Hudson Valley`,
  description: `Read ${COMPANY.reviews.count}+ five-star Google reviews from satisfied Hudson Valley homeowners. See why TZ Electric is the most trusted plumbing, HVAC, and electrical company in the region.`,
  path: '/reviews',
})

const reviews = [
  {
    name: 'Michael R.',
    location: 'Catskill, NY',
    rating: 5,
    text: 'TZ Electric went above and beyond with our whole-home generator installation. Professional, clean, and on time. Highly recommend!',
    service: 'Generator Installation',
  },
  {
    name: 'Sarah L.',
    location: 'Hudson, NY',
    rating: 5,
    text: 'We had an emergency plumbing situation on a Sunday night. They were here within the hour and fixed everything perfectly. Lifesavers!',
    service: 'Emergency Plumbing',
  },
  {
    name: 'James K.',
    location: 'Rhinebeck, NY',
    rating: 5,
    text: 'Best mini split installation experience. The team was knowledgeable about Mitsubishi systems and the whole process was seamless.',
    service: 'Mini Split Installation',
  },
  {
    name: 'Patricia M.',
    location: 'Woodstock, NY',
    rating: 5,
    text: 'Had our entire HVAC system replaced. Fair pricing, excellent work, and they cleaned up everything when they were done.',
    service: 'HVAC Replacement',
  },
  {
    name: 'Robert T.',
    location: 'Hunter, NY',
    rating: 5,
    text: 'Panel upgrade completed in one day. Very professional crew, explained everything clearly, and the work was impeccable.',
    service: 'Electrical Panel Upgrade',
  },
  {
    name: 'Linda C.',
    location: 'Catskill, NY',
    rating: 5,
    text: 'We use TZ Electric for all our home services — plumbing, electrical, HVAC. One company that does it all and does it right.',
    service: 'Multiple Services',
  },
]

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
              <p className="text-3xl font-bold text-navy">20+</p>
              <p className="text-gray-500 text-sm mt-1">Years of Service</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy">100%</p>
              <p className="text-gray-500 text-sm mt-1">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="section-padding">
        <div className="container-site">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                <StarRating rating={review.rating} />
                <p className="mt-4 text-gray-700 leading-relaxed text-sm">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="font-semibold text-navy text-sm">{review.name}</p>
                  <p className="text-gray-500 text-xs">{review.location}</p>
                  <span className="inline-block mt-2 bg-blue/10 text-blue text-xs font-medium px-2 py-0.5 rounded-full">
                    {review.service}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Google Reviews CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Want to see more? Read all our reviews on Google.
            </p>
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              <Button href={COMPANY.social.google} external variant="secondary">
                Read All Google Reviews
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
