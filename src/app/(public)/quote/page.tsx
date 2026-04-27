import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import LeadForm from '@/components/forms/LeadForm'

export const metadata = createMetadata({
  title: 'Get a Free Quote | TZ Electric Inc',
  description: `Tell us what you need and a real person will follow up within one business day. Cooling, heating, electrical, plumbing, generators, EV chargers. Hudson Valley, NY. Call ${COMPANY.phone}.`,
  path: '/quote',
})

type SearchParams = { service?: string }

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { service } = await searchParams
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Get a Quote', url: '/quote' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="relative bg-gradient-to-br from-navy via-navy-dark to-blue-darker pt-32 pb-12 text-white sm:pt-36 sm:pb-16">
        <div className="absolute inset-0 bg-[url('/images/hero/hero-pattern.svg')] opacity-5" />
        <div className="container-site relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm">
              Get a Free Quote
            </p>
            <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-white sm:text-5xl">
              Tell us what you need.
              <br />
              <span className="text-blue-light">We'll take it from there.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 sm:text-lg">
              A real person follows up within one business day. Active leaks, no heat, and other emergencies are flagged for immediate response.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/70">
              <span>Voted #1 Electrician in the Hudson Valley</span>
              <span aria-hidden>·</span>
              <span>{COMPANY.reviews.count}+ {COMPANY.reviews.platform} reviews</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-20">
        <div className="container-site">
          <LeadForm initialServiceKey={service} />
        </div>
      </section>
    </>
  )
}
