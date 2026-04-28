import { COMPANY } from '@/lib/constants'
import { createMetadata } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import ConversionTracker from '@/components/forms/ConversionTracker'

export const metadata = createMetadata({
  title: 'Thank You | TZ Electric Inc',
  description: 'Thank you for contacting TZ Electric. We will be in touch shortly.',
  path: '/thank-you',
  noIndex: true,
})

type SearchParams = {
  service?: string
  serviceKey?: string
  ownership?: string
  channel?: string
  value?: string
  leadId?: string
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const value = params.value ? Number.parseFloat(params.value) : null

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-navy via-navy-light to-navy relative overflow-hidden">
      {/* Conversion firing: GTM dataLayer + GA4 generate_lead + Meta Pixel Lead. */}
      <ConversionTracker
        leadId={params.leadId || null}
        service={params.service || null}
        serviceKey={params.serviceKey || null}
        channel={params.channel || null}
        value={typeof value === 'number' && !Number.isNaN(value) ? value : null}
        ownership={params.ownership || null}
      />

      <div className="absolute inset-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
        />
      </div>

      <div className="container-site relative z-10 text-center py-16">
        <div className="mx-auto w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-8 ring-4 ring-success/30">
          <svg
            className="w-12 h-12 text-success"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="font-heading font-bold text-white text-4xl lg:text-5xl leading-tight">
          You&apos;re All Set!
        </h1>

        <p className="mt-4 text-gray-300 text-lg lg:text-xl max-w-xl mx-auto leading-relaxed">
          Thank you for reaching out to TZ Electric. One of our team members will
          be in touch with you shortly.
        </p>

        <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-md mx-auto">
          <h2 className="font-heading font-semibold text-white text-lg mb-4">
            What Happens Next?
          </h2>
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue/30 text-blue-light flex items-center justify-center flex-shrink-0 text-sm font-bold">
                1
              </div>
              <p className="text-gray-300 text-sm">
                We&apos;ll review your request and match you with the right team member.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue/30 text-blue-light flex items-center justify-center flex-shrink-0 text-sm font-bold">
                2
              </div>
              <p className="text-gray-300 text-sm">
                Expect a call or email within one business day to discuss your project.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue/30 text-blue-light flex items-center justify-center flex-shrink-0 text-sm font-bold">
                3
              </div>
              <p className="text-gray-300 text-sm">
                We&apos;ll schedule a time that works for you. No pressure, just honest guidance.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-gray-400 text-sm">
          Need immediate help? Call us anytime at{' '}
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="text-blue-light font-semibold hover:underline"
          >
            {COMPANY.phone}
          </a>
        </p>

        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <Button href="/" variant="secondary">
            Back to Home
          </Button>
          <Button href="/services">
            Explore Our Services
          </Button>
        </div>
      </div>
    </section>
  )
}
