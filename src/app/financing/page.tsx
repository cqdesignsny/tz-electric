import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Financing Options | Affordable Payment Plans | TZ Electric Inc',
  description: `Make home improvements affordable with flexible financing from TZ Electric. We partner with Wisetack and Synchrony for easy payment plans on HVAC, electrical, plumbing, and generator services.`,
  path: '/financing',
})

const financingPartners = [
  {
    name: 'Wisetack',
    description: 'Simple, transparent financing with no hidden fees. Apply in seconds and get pre-qualified without impacting your credit score.',
    features: [
      'Check rates with no credit impact',
      'Loans from $500 to $25,000',
      'Terms from 3 to 60 months',
      'No prepayment penalties',
      'Fast, easy online application',
    ],
  },
  {
    name: 'Synchrony',
    description: 'Trusted home improvement financing with promotional offers. Flexible credit options for projects of all sizes.',
    features: [
      'Promotional financing available',
      'Convenient monthly payments',
      'Online account management',
      'Use for future purchases too',
      'Quick credit decisions',
    ],
  },
]

const steps = [
  {
    step: '1',
    title: 'Get Your Free Quote',
    description: 'Contact us for a no-obligation estimate on your project. We\'ll provide transparent pricing upfront.',
  },
  {
    step: '2',
    title: 'Choose Your Plan',
    description: 'Select the financing option that works best for your budget. Apply in minutes with a quick online application.',
  },
  {
    step: '3',
    title: 'Get It Done',
    description: 'Once approved, we schedule your service and get to work. Enjoy your home improvements with comfortable payments.',
  },
]

export default function FinancingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Financing', url: '/financing' },
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
              Financing
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              Affordable Home Comfort, Made Easy
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              Don&apos;t let budget hold you back from a comfortable home. We offer flexible
              financing options to make your project affordable.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={TYPEFORM_URL} external size="lg">
                Get a Free Quote
              </Button>
              <Button
                href={`tel:${COMPANY.phoneRaw}`}
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-navy"
              >
                Call {COMPANY.phone}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue text-sm font-semibold uppercase tracking-wider">
              How It Works
            </span>
            <h2 className="font-heading font-bold text-navy text-3xl mt-2">
              3 Simple Steps to Affordable Home Services
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-blue text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-navy text-lg mt-4">
                  {item.title}
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financing Partners */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue text-sm font-semibold uppercase tracking-wider">
              Our Partners
            </span>
            <h2 className="font-heading font-bold text-navy text-3xl mt-2">
              Trusted Financing Partners
            </h2>
            <p className="mt-3 text-gray-600">
              We&apos;ve partnered with industry-leading financing providers to give you
              the best options for your budget.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {financingPartners.map((partner) => (
              <div key={partner.name} className="bg-white border border-gray-200 rounded-2xl p-8">
                <div className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-gray-400 font-semibold">{partner.name} Logo</span>
                </div>
                <h3 className="font-heading font-bold text-navy text-xl">
                  {partner.name}
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  {partner.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {partner.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ-like section */}
      <section className="section-padding">
        <div className="container-site max-w-3xl">
          <h2 className="font-heading font-bold text-navy text-2xl text-center mb-8">
            Common Financing Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Will applying for financing affect my credit score?',
                a: 'With Wisetack, checking your rates won\'t impact your credit score. A full credit check only happens if you choose to proceed with a loan.',
              },
              {
                q: 'What services can I finance?',
                a: 'All of our services are eligible for financing, including HVAC installation, electrical work, plumbing, generators, and hot water heaters.',
              },
              {
                q: 'How quickly can I get approved?',
                a: 'Most applications receive a decision within minutes. Once approved, we can schedule your service right away.',
              },
              {
                q: 'Are there any hidden fees?',
                a: 'No hidden fees. We believe in transparent pricing. Your financing terms, including interest rates and monthly payments, are clearly presented before you commit.',
              },
            ].map((faq) => (
              <div key={faq.q} className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-navy">{faq.q}</h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
