'use client'

import { COMPANY } from '@/lib/constants'
import SectionHeader from '@/components/ui/SectionHeader'
import StarRating from '@/components/ui/StarRating'
import Button from '@/components/ui/Button'

const reviews = [
  {
    name: 'Sarah M.',
    location: 'Hudson, NY',
    text: 'TZ Electric installed our mini split system and it was the best decision we ever made. Professional from start to finish. Highly recommend!',
    service: 'Mini Split Installation',
  },
  {
    name: 'Robert K.',
    location: 'Catskill, NY',
    text: 'Had an emergency plumbing issue on a Sunday and they were there within the hour. Fixed the problem quickly and professionally. True lifesavers!',
    service: 'Emergency Plumbing',
  },
  {
    name: 'Jennifer L.',
    location: 'Woodstock, NY',
    text: 'We use TZ for everything — electrical, HVAC, and plumbing. Having one company we trust for all our home needs is priceless.',
    service: 'Multiple Services',
  },
]

export default function ReviewsSection() {
  return (
    <section className="section-padding">
      <div className="container-site">
        <SectionHeader
          label="Customer Reviews"
          title={`${COMPANY.reviews.count}+ Five-Star Google Reviews`}
          description="Don't just take our word for it. See what our customers say about their experience with TZ Electric."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-white rounded-xl border border-gray-100 p-6 shadow-card"
            >
              <StarRating rating={5} size="sm" className="mb-3" />
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <div className="font-semibold text-navy text-sm">{review.name}</div>
                  <div className="text-xs text-gray-500">{review.location}</div>
                </div>
                <span className="text-xs text-blue bg-blue/5 px-2 py-1 rounded-full font-medium">
                  {review.service}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button href="/reviews" variant="outline">
            Read All Reviews
          </Button>
        </div>
      </div>
    </section>
  )
}
