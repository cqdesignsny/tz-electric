'use client'

import SectionHeader from '@/components/ui/SectionHeader'
import { COMPANY } from '@/lib/constants'
import Button from '@/components/ui/Button'
import { TrustIndexWidget } from '@/components/ui/TrustIndexWidget'

export default function ReviewsSection() {
  return (
    <section className="section-padding bg-off-white">
      <div className="container-site">
        {/* Prominent review header with star rating */}
        <div className="text-center mb-8">
          <span className="text-blue text-sm font-semibold uppercase tracking-wider">
            Customer Reviews
          </span>
          <h2 className="font-heading font-bold text-navy text-3xl md:text-4xl mt-2">
            {COMPANY.reviews.count}+ Five-Star Google Reviews
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-7 h-7 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              ))}
            </div>
            <span className="text-2xl font-heading font-bold text-navy ml-2">5.0</span>
            <span className="text-gray-500 text-lg">on Google</span>
          </div>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Don&apos;t just take our word for it. See what our customers say about their experience with TZ Electric.
          </p>
        </div>
      </div>

      {/* Trust Index Google Reviews Widget — full width */}
      <div className="mx-auto w-[95%] max-w-[1600px]">
        <TrustIndexWidget />
      </div>

      <div className="mt-10 text-center">
        <Button href="/reviews" variant="secondary">
          Read All Reviews
        </Button>
      </div>
    </section>
  )
}
