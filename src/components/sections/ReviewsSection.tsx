'use client'

import SectionHeader from '@/components/ui/SectionHeader'
import { COMPANY } from '@/lib/constants'
import Button from '@/components/ui/Button'
import { TrustIndexWidget } from '@/components/ui/TrustIndexWidget'

export default function ReviewsSection() {
  return (
    <section className="section-padding">
      <div className="container-site">
        <SectionHeader
          label="Customer Reviews"
          title={`${COMPANY.reviews.count}+ Five-Star Google Reviews`}
          description="Don't just take our word for it. See what our customers say about their experience with TZ Electric."
        />

        {/* Trust Index Google Reviews Widget */}
        <TrustIndexWidget />

        <div className="mt-10 text-center">
          <Button href="/reviews" variant="outline">
            Read All Reviews
          </Button>
        </div>
      </div>
    </section>
  )
}
