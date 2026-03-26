import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import {
  GENERATOR_PLANS,
  GENERATOR_OVERVIEW,
  CANCELLATION_TERMS,
  COMING_SOON_PLANS,
} from '@/lib/maintenance-data'
import Button from '@/components/ui/Button'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Maintenance Plans | Generator, Mini Split & Water Heater Service',
  description:
    'TZ Electric maintenance plans keep your generator, mini split, and hot water heater running reliably. Bronze, Silver, and Gold tiers with annual inspections, priority service, and proactive care.',
  path: '/maintenance',
})

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Maintenance Plans', url: '/maintenance' },
])

function formatPrice(price: number): string {
  return price % 1 === 0 ? `${price}` : `${price.toFixed(2)}`
}

export default function MaintenancePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-navy py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(37, 99, 235, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)',
          }} />
        </div>
        <ElectricCursor />
        <div className="container-site relative z-10 text-center max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-blue/20 text-blue-light px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1m0 0L4.16 8.91a2.122 2.122 0 010-3l.97-.97a2.122 2.122 0 013 0l3.26 3.26m0 0l1.41 1.41m-1.41-1.41l5.66-5.66a2.122 2.122 0 013 0l.97.97a2.122 2.122 0 010 3l-5.66 5.66" />
            </svg>
            Maintenance Plans
          </span>
          <h1 className="text-white text-4xl lg:text-5xl xl:text-6xl font-heading font-bold leading-tight">
            Maintenance Plans
          </h1>
          <p className="mt-5 text-gray-300 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Keep your home systems running at peak performance with scheduled maintenance,
            priority service, and proactive care &mdash; so small issues never become big problems.
          </p>
          <div className="mt-8">
            <Button
              href={`tel:${COMPANY.phoneRaw}`}
              size="lg"
              className="bg-white text-blue hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call to Enroll: {COMPANY.phone}
            </Button>
          </div>
        </div>
      </section>

      {/* Coming Soon Notice */}
      <section className="py-8 bg-blue/5 border-b border-blue/10">
        <div className="container-site">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2 text-blue font-heading font-semibold text-sm whitespace-nowrap">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Coming Soon
            </div>
            <div className="flex flex-wrap gap-4">
              {COMING_SOON_PLANS.map((plan) => (
                <div key={plan.name} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-blue/40 flex-shrink-0" />
                  <span><strong className="text-navy">{plan.name}</strong> &mdash; {plan.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Generator Maintenance Plans */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <span className="inline-flex items-center gap-2 text-blue text-sm font-semibold uppercase tracking-wide mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Generator Plans
            </span>
            <h2 className="font-heading font-bold text-navy text-3xl lg:text-4xl">
              Generator Maintenance Plans
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              {GENERATOR_OVERVIEW}
            </p>
          </div>

          {/* Pricing note */}
          <p className="text-center text-sm text-gray-500 mb-10">
            1-year pricing shown (prepay only). Save more with a 3-year commitment.
          </p>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {GENERATOR_PLANS.map((plan) => (
              <div
                key={plan.slug}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'bg-blue text-white shadow-xl ring-2 ring-blue scale-[1.02]'
                    : 'bg-white text-navy border-2 border-gray-200 shadow-card hover:shadow-card-hover'
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-amber-400 text-navy text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-bl-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  {/* Tier indicator */}
                  <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 ${
                    plan.highlighted ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      plan.tier === 'bronze' ? 'bg-amber-700' :
                      plan.tier === 'silver' ? 'bg-gray-400' :
                      'bg-amber-400'
                    }`} />
                    {plan.tier} Tier
                  </div>

                  <h3 className={`font-heading font-bold text-2xl ${plan.highlighted ? 'text-white' : 'text-navy'}`}>
                    {plan.name}
                  </h3>

                  {/* 1-Year price (default big number) */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-5xl font-heading font-bold ${plan.highlighted ? 'text-white' : 'text-blue'}`}>
                      ${formatPrice(plan.oneYear)}
                    </span>
                    <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                      /year
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${plan.highlighted ? 'text-blue-100' : 'text-gray-400'}`}>
                    1-year prepay
                  </p>

                  {/* 3-Year pricing */}
                  <div className="mt-4 space-y-2">
                    <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                      plan.highlighted ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      Save with 3-Year
                    </div>
                    <div className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${plan.highlighted ? 'bg-white/10' : 'bg-blue/5'}`}>
                      <span className={`text-sm font-medium ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>Annual</span>
                      <span className={`text-lg font-heading font-bold ${plan.highlighted ? 'text-white' : 'text-navy'}`}>
                        ${formatPrice(plan.threeYearAnnual)}<span className="text-xs font-normal">/yr</span>
                      </span>
                    </div>
                    <div className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${plan.highlighted ? 'bg-white/10' : 'bg-blue/5'}`}>
                      <span className={`text-sm font-medium ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>Monthly</span>
                      <span className={`text-lg font-heading font-bold ${plan.highlighted ? 'text-white' : 'text-navy'}`}>
                        ${formatPrice(plan.threeYearMonthly)}<span className="text-xs font-normal">/mo</span>
                      </span>
                    </div>
                  </div>

                  <hr className={`my-6 ${plan.highlighted ? 'border-blue-400/30' : 'border-gray-200'}`} />

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <svg
                          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-success'}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <a
                      href={`tel:${COMPANY.phoneRaw}`}
                      className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-heading font-semibold text-sm transition-colors ${
                        plan.highlighted
                          ? 'bg-white text-blue hover:bg-gray-100'
                          : 'bg-blue text-white hover:bg-blue-dark'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      Call to Enroll
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section-padding">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-heading font-bold text-navy text-3xl">
              Compare Generator Plans
            </h2>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left p-4 font-heading font-bold text-sm">Feature</th>
                  <th className="text-center p-4 font-heading font-bold text-sm">Bronze</th>
                  <th className="text-center p-4 font-heading font-bold text-sm bg-blue">Silver</th>
                  <th className="text-center p-4 font-heading font-bold text-sm">Gold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { feature: '1-Year Price (Prepay)', bronze: '$299', silver: '$328.90', gold: '$438.90' },
                  { feature: '3-Year Annual Price', bronze: '$269/yr', silver: '$299/yr', gold: '$399/yr' },
                  { feature: '3-Year Monthly Price', bronze: '$23/mo', silver: '$25/mo', gold: '$34/mo' },
                  { feature: 'Annual Inspection', bronze: true, silver: true, gold: true },
                  { feature: 'Oil & Filter Service', bronze: true, silver: true, gold: true },
                  { feature: 'Battery Check', bronze: true, silver: true, gold: true },
                  { feature: 'Exercise Test', bronze: true, silver: true, gold: true },
                  { feature: 'Service Documentation', bronze: true, silver: true, gold: true },
                  { feature: 'Spark Plug Replacement', bronze: false, silver: true, gold: true },
                  { feature: 'Proactive Scheduling', bronze: false, silver: true, gold: false },
                  { feature: 'Bi-Annual Maintenance', bronze: false, silver: false, gold: true },
                  { feature: 'Air Filter Replacement', bronze: false, silver: false, gold: true },
                  { feature: 'Battery Load Testing', bronze: false, silver: false, gold: true },
                  { feature: 'Full Fuel System Check', bronze: false, silver: false, gold: true },
                  { feature: 'Remote Monitoring', bronze: false, silver: false, gold: true },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-navy">{row.feature}</td>
                    {(['bronze', 'silver', 'gold'] as const).map((plan) => {
                      const val = row[plan]
                      return (
                        <td
                          key={plan}
                          className={`p-4 text-center text-sm ${plan === 'silver' ? 'bg-blue/5' : ''}`}
                        >
                          {val === true ? (
                            <svg className="w-5 h-5 text-success mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : val === false ? (
                            <svg className="w-5 h-5 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : (
                            <span className="font-semibold text-navy">{val}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enroll CTA */}
      <section className="section-padding bg-gradient-to-br from-blue to-blue-dark text-white">
        <div className="container-site text-center max-w-3xl mx-auto">
          <h2 className="font-heading font-bold text-white text-3xl md:text-4xl">
            Ready to Protect Your Investment?
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            Give us a call to enroll in the generator maintenance plan that fits your needs.
            Our team will get you set up and scheduled for your first service visit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              href={`tel:${COMPANY.phoneRaw}`}
              size="lg"
              className="bg-white text-blue hover:bg-gray-100 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call to Enroll: {COMPANY.phone}
            </Button>
          </div>
        </div>
      </section>

      {/* Cancellation Policy */}
      <section className="section-padding">
        <div className="container-site max-w-4xl">
          <h2 className="font-heading font-bold text-navy text-2xl mb-2">
            Cancellation Policy
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            All 3-year generator maintenance plans are subject to the following terms.
          </p>
          <div className="space-y-4">
            {CANCELLATION_TERMS.map((term) => (
              <details
                key={term.title}
                className="group bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-blue/30 transition-colors"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-heading font-semibold text-navy hover:text-blue transition-colors">
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue/10 text-blue flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </span>
                    <span className="text-sm">{term.title}</span>
                  </span>
                  <svg
                    className="w-5 h-5 text-blue group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-blue/10 pt-4 ml-11">
                  {term.content}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
