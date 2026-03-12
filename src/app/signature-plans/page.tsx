import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import {
  SIGNATURE_PLANS,
  SERVICE_DESCRIPTIONS,
  WHY_JOIN_BENEFITS,
  PLAN_TERMS,
} from '@/lib/signature-plans-data'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'TZ Signature Plans | Comfort, Safety & Priority Service Year-Round',
  description:
    'Join the TZ Signature Plan for annual electrical assessments, priority scheduling, exclusive discounts, and peace of mind. Three plans to fit your budget — Core, Preferred, and Elite.',
  path: '/signature-plans',
})

// SVG icon components
const icons: Record<string, React.ReactNode> = {
  'clipboard-check': (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
    </svg>
  ),
  wrench: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1 5.1a2.121 2.121 0 01-3-3l5.1-5.1m0 0L4.16 8.91a2.122 2.122 0 010-3l.97-.97a2.122 2.122 0 013 0l3.26 3.26m0 0l1.41 1.41m-1.41-1.41l5.66-5.66a2.122 2.122 0 013 0l.97.97a2.122 2.122 0 010 3l-5.66 5.66" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  calendar: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  banknotes: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  bolt: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
}

const breadcrumbSchema = getBreadcrumbSchema([
  { name: 'Home', url: '/' },
  { name: 'Signature Plans', url: '/signature-plans' },
])

export default function SignaturePlansPage() {
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            Membership Plans
          </span>
          <h1 className="text-white text-4xl lg:text-5xl xl:text-6xl font-heading font-bold leading-tight">
            TZ Signature Plans
          </h1>
          <p className="mt-5 text-gray-300 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Comfort, safety, and priority service &mdash; all year long. Annual checkups,
            built-in savings, and peace of mind so your home systems are cared for before
            problems become emergencies.
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

      {/* Pricing Cards */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-bold text-navy text-3xl">
              Choose Your Plan
            </h2>
            <p className="mt-3 text-gray-600">
              Three plans to fit your budget. Save more when you prepay annually or for 3 years.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {SIGNATURE_PLANS.map((plan) => (
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
                  <h3 className={`font-heading font-bold text-2xl ${plan.highlighted ? 'text-white' : 'text-navy'}`}>
                    {plan.name}
                  </h3>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`text-5xl font-heading font-bold ${plan.highlighted ? 'text-white' : 'text-blue'}`}>
                      ${plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                      /month
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${plan.highlighted ? 'bg-white/10' : 'bg-blue/5'}`}>
                      <span className={`text-sm font-medium ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>Prepaid Yearly</span>
                      <span className={`text-lg font-heading font-bold ${plan.highlighted ? 'text-white' : 'text-navy'}`}>
                        ${plan.prepaidYearly}<span className="text-xs font-normal">/yr</span>
                      </span>
                    </div>
                    <div className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${plan.highlighted ? 'bg-white/10' : 'bg-blue/5'}`}>
                      <span className={`text-sm font-medium ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>Prepaid 3-Year</span>
                      <span className={`text-lg font-heading font-bold ${plan.highlighted ? 'text-white' : 'text-navy'}`}>
                        ${plan.prepaid3Year.toLocaleString()}<span className="text-xs font-normal">/3yr</span>
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

      {/* What's Included Breakdown */}
      <section className="section-padding">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-bold text-navy text-3xl">
              Let&apos;s Break It Down
            </h2>
            <p className="mt-3 text-gray-600">
              Here&apos;s exactly what you get with your TZ Signature Plan membership.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {SERVICE_DESCRIPTIONS.map((service) => (
              <div
                key={service.title}
                className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:border-blue/30 hover:shadow-card transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue/10 text-blue flex items-center justify-center mb-4">
                  {icons[service.icon]}
                </div>
                <h3 className="font-heading font-bold text-navy text-lg">
                  {service.title}
                </h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="section-padding bg-navy">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-bold text-white text-3xl">
              Why Join the Signature Plan?
            </h2>
            <p className="mt-3 text-gray-400">
              More than just maintenance &mdash; it&apos;s peace of mind for your entire home.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {WHY_JOIN_BENEFITS.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue/20 text-blue-light flex items-center justify-center mx-auto mb-4">
                  {icons[benefit.icon]}
                </div>
                <h3 className="font-heading font-bold text-white text-lg">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-gray-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section-padding bg-gray-50">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-heading font-bold text-navy text-3xl">
              Compare Plans
            </h2>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left p-4 font-heading font-bold text-sm">Feature</th>
                  <th className="text-center p-4 font-heading font-bold text-sm">Core</th>
                  <th className="text-center p-4 font-heading font-bold text-sm bg-blue">Preferred</th>
                  <th className="text-center p-4 font-heading font-bold text-sm">Elite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { feature: 'Monthly Price', core: '$35', preferred: '$45', elite: '$60' },
                  { feature: 'Annual Assessment', core: true, preferred: true, elite: true },
                  { feature: 'Priority Scheduling', core: true, preferred: true, elite: true },
                  { feature: 'Repair Discount', core: '5%', preferred: '10%', elite: '10%' },
                  { feature: 'Preventative Maintenance', core: false, preferred: true, elite: true },
                  { feature: 'Installation Discount', core: false, preferred: false, elite: '10%' },
                  { feature: '$100 Service Credit', core: false, preferred: false, elite: true },
                  { feature: 'Extended Hours', core: false, preferred: false, elite: true },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 text-sm font-medium text-navy">{row.feature}</td>
                    {(['core', 'preferred', 'elite'] as const).map((plan) => {
                      const val = row[plan]
                      return (
                        <td
                          key={plan}
                          className={`p-4 text-center text-sm ${plan === 'preferred' ? 'bg-blue/5' : ''}`}
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
            Ready to Join?
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            Give us a call to enroll in the plan that fits your needs. Our team will get you
            set up and scheduled for your first assessment.
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

      {/* Terms & Conditions */}
      <section className="section-padding">
        <div className="container-site max-w-4xl">
          <h2 className="font-heading font-bold text-navy text-2xl mb-6">
            Terms &amp; Conditions
          </h2>
          <div className="space-y-4">
            {PLAN_TERMS.map((term) => (
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
