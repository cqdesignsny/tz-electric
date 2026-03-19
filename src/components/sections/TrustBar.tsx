import { COMPANY } from '@/lib/constants'
import StarRating from '@/components/ui/StarRating'

const stats = [
  { value: '12+', label: 'Years Experience' },
  { value: `${COMPANY.reviews.count}+`, label: '5-Star Reviews' },
  { value: '5', label: 'Counties Served' },
  { value: '24/7', label: 'Emergency Service' },
]

export default function TrustBar() {
  return (
    <section className="bg-off-white border-y border-gray-100">
      <div className="container-site py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-heading font-bold text-navy">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Certification Logos Placeholder */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {COMPANY.certifications.map((cert) => (
            <div key={cert} className="text-sm text-gray-400 font-medium flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              {cert}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
