import { notFound } from 'next/navigation'
import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import { JOB_LISTINGS, getJobBySlug, CAREERS_APPLICATION_URL } from '@/lib/careers-data'
import Button from '@/components/ui/Button'
import ElectricCursor from '@/components/effects/ElectricCursor'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return JOB_LISTINGS.map((job) => ({ slug: job.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const job = getJobBySlug(slug)
  if (!job) return {}
  return createMetadata({
    title: `${job.title} | Careers at TZ Electric Inc`,
    description: `${job.description} ${job.type} position in ${job.location}. ${job.pay}. Apply now to join the TZ Electric team.`,
    path: `/careers/${slug}`,
  })
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params
  const job = getJobBySlug(slug)
  if (!job) notFound()

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Careers', url: '/careers' },
    { name: job.title, url: `/careers/${job.slug}` },
  ])

  const jobPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: COMPANY.name,
      sameAs: 'https://tzelectricinc.com',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Catskill',
        addressRegion: 'NY',
        postalCode: '12414',
        addressCountry: 'US',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
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
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-blue/20 text-blue-light text-xs font-semibold px-3 py-1 rounded-full">
                {job.type}
              </span>
              <span className="bg-white/10 text-gray-300 text-xs font-medium px-3 py-1 rounded-full">
                {job.location}
              </span>
            </div>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight">
              {job.title}
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              {job.description}
            </p>
            <div className="mt-3 text-blue-light font-semibold text-lg">
              {job.pay}
            </div>
            <div className="mt-6">
              <Button href={CAREERS_APPLICATION_URL} external size="lg">
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="section-padding">
        <div className="container-site">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading font-bold text-navy text-2xl mb-4">
              About This Role
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              {job.overview.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Responsibilities + Qualifications side by side */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Responsibilities */}
            <div>
              <h2 className="font-heading font-bold text-navy text-2xl mb-6">
                Responsibilities
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div>
              <h2 className="font-heading font-bold text-navy text-2xl mb-6">
                Qualifications
              </h2>
              <ul className="space-y-3">
                {job.qualifications.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits + Schedule */}
      <section className="section-padding">
        <div className="container-site">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Benefits */}
            <div>
              <h2 className="font-heading font-bold text-navy text-2xl mb-6">
                Benefits & Perks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h2 className="font-heading font-bold text-navy text-2xl mb-6">
                Schedule
              </h2>
              <ul className="space-y-3">
                {job.schedule.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Company culture note */}
              <div className="mt-8 bg-blue/5 border border-blue/20 rounded-xl p-6">
                <h3 className="font-heading font-bold text-navy text-lg mb-2">
                  Why TZ Electric?
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We&apos;re committed to sustainable solutions, technical excellence, and most
                  importantly, each other. At TZ Electric, you&apos;re joining a team that values
                  personal growth, innovation, and doing right by our customers and community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apply CTA */}
      <section className="section-padding bg-navy">
        <div className="container-site text-center">
          <h2 className="font-heading font-bold text-white text-3xl">
            Ready to Join Our Team?
          </h2>
          <p className="mt-3 text-gray-300 max-w-xl mx-auto">
            Apply now for the {job.title} position. We look forward to hearing from you.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button href={CAREERS_APPLICATION_URL} external size="lg">
              Apply Now
            </Button>
            <Button href="/careers" variant="outline" size="lg">
              View All Positions
            </Button>
          </div>
          <p className="mt-6 text-gray-400 text-sm">
            Questions? Email us at{' '}
            <a href={`mailto:${COMPANY.email}?subject=Career Inquiry — ${job.title}`} className="text-blue-light hover:underline">
              {COMPANY.email}
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
