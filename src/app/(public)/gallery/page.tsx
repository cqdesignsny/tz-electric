import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'
import GalleryGrid from '@/components/sections/GalleryGrid'

export const metadata = createMetadata({
  title: 'Project Gallery | TZ Electric Inc | Hudson Valley',
  description: `Browse our project gallery showcasing mini split, HVAC, electrical, plumbing, and generator installations across the Hudson Valley. ${COMPANY.reviews.count}+ 5-star reviews.`,
  path: '/gallery',
})

const categories = ['All', 'Mini Splits', 'HVAC', 'Electrical', 'Plumbing', 'Generators', 'Hot Water Heaters']

const projects = [
  {
    title: 'Ductless Mini Split Living Room Installation',
    description: 'Wall-mounted Mitsubishi mini split providing efficient cooling and heating in a modern living space.',
    category: 'Mini Splits',
    image: '/images/gallery/mitsubishi-mini-split-living-room-installation.png',
    alt: 'Mitsubishi ductless mini split installed above living room couch with exposed beam ceiling',
  },
  {
    title: 'Mini Split in Modern Living Room',
    description: 'Sleek concealed mini split unit blending seamlessly into a contemporary living room design.',
    category: 'Mini Splits',
    image: '/images/gallery/mitsubishi-mini-split-modern-living-room.png',
    alt: 'Mitsubishi mini split unit in modern luxury living room with neutral decor',
  },
  {
    title: 'Home Office Mini Split Installation',
    description: 'Ductless mini split keeping a home office comfortable year-round for remote work.',
    category: 'Mini Splits',
    image: '/images/gallery/mitsubishi-mini-split-home-office-installation.png',
    alt: 'Mitsubishi mini split installed in home office above desk workspace',
  },
  {
    title: 'Mitsubishi Wall-Mounted Mini Split Unit',
    description: 'Wi-Fi enabled Mitsubishi mini split unit with smart controls for convenient temperature management.',
    category: 'Mini Splits',
    image: '/images/gallery/mitsubishi-mini-split-wall-mounted-wifi-unit.png',
    alt: 'Mitsubishi wall-mounted mini split unit with Wi-Fi connectivity',
  },
  {
    title: 'Family Room Ductless Comfort System',
    description: 'Mitsubishi ductless mini split providing whole-room comfort for the entire family.',
    category: 'Mini Splits',
    image: '/images/gallery/mitsubishi-mini-split-family-room-comfort.png',
    alt: 'Family enjoying comfort from Mitsubishi mini split in wood-paneled living room',
  },
  {
    title: 'Mini Split Installation in Progress',
    description: 'TZ Electric technician mounting a Mitsubishi ductless mini split indoor unit.',
    category: 'Mini Splits',
    image: '/images/services/minisplit-install.jpeg',
    alt: 'TZ Electric technician installing Mitsubishi mini split indoor unit on wall',
  },
  {
    title: 'Electrical Panel Upgrade',
    description: 'TZ Electric technician performing a residential electrical panel upgrade with clean, code-compliant wiring.',
    category: 'Electrical',
    image: '/images/services/clean-panel.jpeg',
    alt: 'TZ Electric technician working on residential electrical panel upgrade',
  },
  {
    title: 'Residential Lighting & Electrical Work',
    description: 'Residential room with new lighting installation and electrical wiring during a renovation project.',
    category: 'Electrical',
    image: '/images/services/mini-split.webp',
    alt: 'Residential room renovation with new lighting installation and exposed beam ceiling',
  },
  {
    title: 'Generac Whole-Home Standby Generator',
    description: 'Generac standby generator installed and ready to provide automatic backup power during outages.',
    category: 'Generators',
    image: '/images/services/generator.webp',
    alt: 'Generac whole-home standby generator installed outside residential home',
  },
  {
    title: 'Mitsubishi Hyper-Heat Outdoor Condenser',
    description: 'Mitsubishi Electric Hyper-Heat outdoor condenser unit for efficient heating and cooling.',
    category: 'HVAC',
    image: '/images/services/hvac-hero.png',
    alt: 'Mitsubishi Electric Hyper-Heat outdoor condenser unit close-up',
  },

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

      <GalleryGrid categories={categories} projects={projects} />

      <div className="py-12 text-center">
        <Button href={TYPEFORM_URL} external size="lg">
          Start Your Project Today
        </Button>
      </div>

      <CTASection />
    </>
  )
}
