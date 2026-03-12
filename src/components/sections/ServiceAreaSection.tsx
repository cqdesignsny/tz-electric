import Link from 'next/link'
import { COMPANY } from '@/lib/constants'
import SectionHeader from '@/components/ui/SectionHeader'

const serviceAreas = [
  { city: 'Catskill', slug: 'catskill-ny' },
  { city: 'Hudson', slug: 'hudson-ny' },
  { city: 'Woodstock', slug: 'woodstock-ny' },
  { city: 'Rhinebeck', slug: 'rhinebeck-ny' },
  { city: 'Hunter', slug: 'hunter-ny' },
]

export default function ServiceAreaSection() {
  return (
    <section className="section-padding bg-navy text-white">
      <div className="container-site">
        <SectionHeader
          light
          label="Service Areas"
          title="Proudly Serving the Hudson Valley"
          description={`We serve homeowners and businesses across ${COMPANY.counties.join(', ')} counties. If you're in the Hudson Valley, we're in your neighborhood.`}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {serviceAreas.map((area) => (
            <Link
              key={area.slug}
              href={`/service-areas/${area.slug}`}
              className="group bg-navy-light rounded-xl p-5 text-center hover:bg-blue transition-colors"
            >
              <svg className="w-6 h-6 mx-auto mb-2 text-blue group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div className="font-heading font-bold text-white text-sm">
                {area.city}, NY
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/service-areas"
            className="inline-flex items-center gap-2 text-sky hover:text-white text-sm font-semibold transition-colors"
          >
            View All Service Areas
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
