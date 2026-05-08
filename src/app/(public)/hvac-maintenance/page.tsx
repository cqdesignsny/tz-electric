import Link from 'next/link'
import { COMPANY, QUOTE_URL } from '@/lib/constants'
import { claireHref } from '@/lib/claire-links'
import { createMetadata } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import CTASection from '@/components/sections/CTASection'

export const metadata = createMetadata({
  title: 'HVAC Maintenance | Mini-Split & Ducted Cleaning',
  description:
    'Annual maintenance for Mitsubishi mini-splits and ducted systems. Modular per-component pricing, transparent quotes, free on-site assessment. Book online or call (518) 678-1230.',
  path: '/hvac-maintenance',
})

const COMPONENT_PRICING = [
  {
    component: 'Outdoor Compressor',
    description: 'The unit mounted outside your home. One per system.',
    oneTime: 120,
    contract: 111,
    deepClean: null,
  },
  {
    component: 'High-Wall Head',
    description: 'Standard wall-mounted unit, sits high on the wall.',
    oneTime: 104,
    contract: 96,
    deepClean: 69,
  },
  {
    component: 'Ceiling Cassette',
    description: 'Recessed into the ceiling with a square grille.',
    oneTime: 156,
    contract: 144,
    deepClean: 98,
  },
  {
    component: 'Low-Wall (Floor-Mount)',
    description: 'Sits on the floor at baseboard level.',
    oneTime: 123,
    contract: 114,
    deepClean: 79,
  },
  {
    component: 'Ducted Air Handler',
    description: 'Concealed. Air comes from regular supply vents.',
    oneTime: 163,
    contract: 151,
    deepClean: 117,
  },
]

const COMMON_SYSTEMS = [
  { system: 'Mini-split 1:1 (1 high-wall)', oneTime: 224, contract: 207 },
  { system: 'Mini-split 1:2 (2 high-walls)', oneTime: 328, contract: 303 },
  { system: 'Mini-split 1:3 (3 high-walls)', oneTime: 432, contract: 399 },
  { system: 'Mini-split 1:1 cassette', oneTime: 276, contract: 255 },
  { system: 'Mixed: 1 high-wall + 1 cassette', oneTime: 380, contract: 351 },
  { system: 'Ducted 1:1', oneTime: 283, contract: 262 },
  { system: 'Ducted 1:2', oneTime: 446, contract: 413 },
]

const FAQS = [
  {
    q: 'How do I know what kind of indoor units I have?',
    a: 'High-wall: mounted high on the wall, looks like a long horizontal box. Ceiling cassette: recessed into the ceiling with a square grille. Low-wall: sits on the floor at baseboard level. Ducted: hidden, air comes through regular ceiling or wall supply vents. If you\'re unsure, snap a photo when you book and we\'ll confirm.',
  },
  {
    q: "What's the difference between a quick clean and a deep clean?",
    a: 'A quick clean is what 90% of homes need: filter wash, coil rinse, drain check, full inspection. A deep clean is added when the tech finds heavy biological growth, mold, or buildup that won\'t rinse off. It requires removing the blower wheel and washing it down. We never do a deep clean without your approval first.',
  },
  {
    q: 'How long does the appointment take?',
    a: 'A single-zone system usually takes about an hour. Larger systems take longer. A full ducted system or a 1:3 mini-split is closer to two hours. We\'ll let you know our ETA the morning of.',
  },
  {
    q: "Do you service systems you didn't install?",
    a: 'Yes. Maintenance is brand-agnostic for residential mini-splits and ducted systems. The cleaning process is the same. We don\'t service window units, portable AC, or commercial rooftop equipment.',
  },
  {
    q: 'Why does the 3-year plan cost less per visit?',
    a: 'Locked-in customers help us schedule and staff more efficiently, so we share the savings, about 7.5% per visit. You also get priority booking during busy season and a hold on price increases for the term.',
  },
  {
    q: "What if I'm not sure how many units I have?",
    a: 'Best estimates work. When we arrive, we\'ll confirm everything and adjust the invoice if needed. You only pay for what\'s actually serviced.',
  },
]

const QUOTE_HREF = `${QUOTE_URL}?service=hvac&promo=maintenance`
const CLAIRE_HREF = claireHref('hvac_maintenance')

export default function HvacMaintenancePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue/15 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-light/10 blur-3xl" />
        </div>
        <div className="container-site relative z-10 py-16 lg:py-24">
          <div className="max-w-3xl">
            <span className="text-blue-light text-sm font-heading font-semibold uppercase tracking-[0.2em]">
              HVAC Maintenance
            </span>
            <h1 className="mt-3 font-heading font-bold text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
              Keep your mini-split running like the day it was installed.
            </h1>
            <p className="mt-5 text-gray-300 text-lg lg:text-xl max-w-2xl leading-relaxed">
              Annual maintenance for Mitsubishi mini-splits and ducted systems. Pricing is per component because every system is configured a little differently, so you only pay for what you have.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Button href={QUOTE_HREF} size="lg">
                Book Maintenance
              </Button>
              <Button href={CLAIRE_HREF} variant="outline" size="lg">
                Ask Claire
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <SectionHeader
            label="What's Included"
            title="A thorough quick clean. Every visit."
            description="Each service includes a full top-to-bottom inspection and cleaning. Pricing is per component because every system is set up differently."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Outdoor unit',
                body: 'Coil rinse, fin straightening, refrigerant line and electrical inspection, contactor and capacitor check, debris clearance.',
              },
              {
                title: 'Indoor units',
                body: 'Filter wash, coil cleaning, drain line check and flush, blower inspection, full operational test in heat and cool modes.',
              },
              {
                title: 'Honest assessment',
                body: 'If a unit needs more than a quick clean (heavy buildup, mold), we tell you on-site before doing anything extra. No surprises.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border-2 border-blue/20 p-7 shadow-sm hover:shadow-lg hover:border-blue/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-blue/10 text-blue flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-navy text-lg">{item.title}</h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Per-component pricing */}
      <section className="section-padding bg-off-white">
        <div className="container-site">
          <SectionHeader
            label="Pricing"
            title="Per-component, transparent, no surprises."
            description="Most homes have one outdoor compressor and one or more indoor units. Add the right components for your system. The 3-year plan saves about 7.5% per visit."
          />

          <div className="overflow-x-auto rounded-2xl border-2 border-blue/15 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue/5 text-navy font-heading">
                <tr>
                  <th className="px-5 py-4 font-semibold">Component</th>
                  <th className="px-5 py-4 font-semibold">Description</th>
                  <th className="px-5 py-4 font-semibold text-right">One-Time</th>
                  <th className="px-5 py-4 font-semibold text-right">3-Year Plan</th>
                  <th className="px-5 py-4 font-semibold text-right">Deep Clean Add-on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPONENT_PRICING.map((row) => (
                  <tr key={row.component} className="text-gray-700">
                    <td className="px-5 py-4 font-heading font-bold text-navy whitespace-nowrap">{row.component}</td>
                    <td className="px-5 py-4 text-gray-600">{row.description}</td>
                    <td className="px-5 py-4 text-right font-semibold text-navy whitespace-nowrap">${row.oneTime}</td>
                    <td className="px-5 py-4 text-right font-semibold text-blue whitespace-nowrap">${row.contract}</td>
                    <td className="px-5 py-4 text-right text-gray-600 whitespace-nowrap">
                      {row.deepClean ? `+$${row.deepClean}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Deep clean add-ons are only added on-site if the tech finds heavy buildup, mold, or biological growth. Never charged without your approval.
          </p>
        </div>
      </section>

      {/* Common system pricing */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <SectionHeader
            label="Common Systems"
            title="Roughly what most homes pay."
            description="Most Hudson Valley mini-split installs land in one of these configurations. Use it as a ballpark. We confirm the exact total when you book."
          />

          <div className="overflow-x-auto rounded-2xl border-2 border-blue/15 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue/5 text-navy font-heading">
                <tr>
                  <th className="px-5 py-4 font-semibold">System</th>
                  <th className="px-5 py-4 font-semibold text-right">One-Time Visit</th>
                  <th className="px-5 py-4 font-semibold text-right">3-Year Plan (per visit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMMON_SYSTEMS.map((row) => (
                  <tr key={row.system} className="text-gray-700">
                    <td className="px-5 py-4 font-heading font-bold text-navy">{row.system}</td>
                    <td className="px-5 py-4 text-right font-semibold text-navy whitespace-nowrap">${row.oneTime}</td>
                    <td className="px-5 py-4 text-right font-semibold text-blue whitespace-nowrap">${row.contract}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-gradient-to-br from-navy-light to-navy text-white">
        <div className="container-site">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-blue-light text-sm font-heading font-semibold uppercase tracking-wider">
              How it works
            </span>
            <h2 className="mt-2 font-heading font-bold text-white text-3xl lg:text-4xl">
              Four steps and we&apos;re on the calendar.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: '01', t: 'Tell us what you have', b: 'Share your system details on the booking form. Photos help if you\'re unsure.' },
              { n: '02', t: 'Get your price', b: 'We confirm the configuration and send you a written quote. No commitment.' },
              { n: '03', t: 'We arrive', b: 'On-time, in branded trucks, with everything we need on board. Office confirms by text and email.' },
              { n: '04', t: 'System done right', b: 'Full report when we leave. Photos of what we found. No mess.' },
            ].map((step) => (
              <div
                key={step.n}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6"
              >
                <span className="text-blue-light text-sm font-heading font-bold tracking-wider">{step.n}</span>
                <h3 className="mt-2 font-heading font-bold text-white text-lg">{step.t}</h3>
                <p className="mt-2 text-gray-300 text-sm leading-relaxed">{step.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-off-white">
        <div className="container-site max-w-3xl">
          <SectionHeader
            label="FAQ"
            title="Common questions."
            description="If yours isn't here, ask Claire or call the office."
          />
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-blue/20 transition-colors"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-heading font-semibold text-navy hover:text-blue transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-blue group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-gray-600">
            Questions? Email <Link className="text-blue font-semibold hover:underline" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</Link> or call <Link className="text-blue font-semibold hover:underline" href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</Link>.
          </p>
        </div>
      </section>

      <CTASection />
    </>
  )
}
