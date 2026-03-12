import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Project Gallery | TZ Electric Inc | Hudson Valley',
  description: `Browse our project gallery showcasing HVAC, electrical, plumbing, and generator installations across the Hudson Valley. ${COMPANY.reviews.count}+ 5-star reviews.`,
  path: '/gallery',
})

const categories = ['All', 'Electrical', 'HVAC', 'Mini Splits', 'Generators', 'Plumbing', 'Hot Water Heaters']

const projects = [
  { title: 'Whole-Home Generator Installation', category: 'Generators', location: 'Catskill, NY' },
  { title: 'Mini Split Multi-Zone System', category: 'Mini Splits', location: 'Hudson, NY' },
  { title: 'Electrical Panel Upgrade', category: 'Electrical', location: 'Rhinebeck, NY' },
  { title: 'HVAC System Replacement', category: 'HVAC', location: 'Woodstock, NY' },
  { title: 'Tankless Water Heater Install', category: 'Hot Water Heaters', location: 'Hunter, NY' },
  { title: 'Commercial Electrical Work', category: 'Electrical', location: 'Catskill, NY' },
  { title: 'Ductless Heating Solution', category: 'Mini Splits', location: 'Kingston, NY' },
  { title: 'Emergency Plumbing Repair', category: 'Plumbing', location: 'Saugerties, NY' },
  { title: 'Generac Standby Generator', category: 'Generators', location: 'Windham, NY' },
]

export default function GalleryPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Gallery', url: '/gallery' },
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
              Our Work
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              Project Gallery
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              See the quality of our work firsthand. Browse completed projects from homes
              across the Hudson Valley.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="container-site">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  cat === 'All'
                    ? 'bg-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-site">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-gray-200 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden">
                  <span className="text-gray-400 text-sm">{project.title} Photo</span>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-navy group-hover:text-blue transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-blue/10 text-blue font-medium px-2 py-0.5 rounded-full">
                      {project.category}
                    </span>
                    <span className="text-gray-500 text-xs">{project.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button href={TYPEFORM_URL} external size="lg">
              Start Your Project Today
            </Button>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
