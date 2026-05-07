import Image from 'next/image'
import { COMPANY, QUOTE_URL } from '@/lib/constants'
import { claireHref } from '@/lib/claire-links'
import { createMetadata } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'

export const metadata = createMetadata({
  title: 'Stay Cool This Summer | Mitsubishi Mini-Split Installations',
  description:
    'Beat the Hudson Valley heat with a Mitsubishi Electric ductless mini-split from TZ Electric, your local Diamond Contractor. Free estimates, financing available. Call (518) 678-1230.',
  path: '/stay-cool',
  noIndex: true,
})

const QUOTE_HREF = `${QUOTE_URL}?service=mini-split&promo=stay-cool-2026`
const CLAIRE_HREF = claireHref('stay_cool_landing')

const REASONS = [
  {
    title: 'Cools without ducts',
    body: 'Perfect for older homes, additions, finished basements, and any room that never quite got cool enough.',
  },
  {
    title: 'Whisper-quiet',
    body: "Indoor units are quieter than a library. You'll feel the cool air before you hear the system.",
  },
  {
    title: 'Zone-by-zone control',
    body: 'Cool only the rooms you use. Different temperatures in different rooms. Lower bills.',
  },
  {
    title: 'Heats in winter too',
    body: 'Hyper-Heating Mitsubishi systems run down to -13°F, so the same unit covers you year-round.',
  },
]

export default function StayCoolPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy text-white overflow-hidden">
        {/* Subtle radial highlight behind the headline */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue/15 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-light/10 blur-3xl" />
        </div>

        <div className="container-site relative z-10 py-12 lg:py-20">
          {/* Cert strip */}
          <div className="flex items-center gap-5 sm:gap-8 mb-8 lg:mb-12">
            <Image
              src="/images/certifications/mitsubishi-electric.svg"
              alt="Mitsubishi Electric"
              width={160}
              height={64}
              className="h-9 sm:h-11 w-auto object-contain"
            />
            <div className="w-px h-9 sm:h-11 bg-white/20" />
            <Image
              src="/images/certifications/diamond-contractor.svg"
              alt="Mitsubishi Diamond Contractor"
              width={180}
              height={64}
              className="h-9 sm:h-11 w-auto object-contain brightness-0 invert"
            />
          </div>

          <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-10 lg:gap-12 items-center">
            {/* Copy */}
            <div>
              <h1 className="font-heading font-bold leading-[0.95] tracking-tight">
                <span className="block text-blue-light text-[3.25rem] sm:text-7xl lg:text-8xl">
                  Stay Cool
                </span>
                <span className="block text-white text-[2.5rem] sm:text-6xl lg:text-7xl mt-2">
                  This Summer
                </span>
              </h1>

              <p className="mt-5 text-blue-light text-base sm:text-lg lg:text-xl uppercase tracking-[0.2em] font-heading font-semibold">
                Mini-Split Installations
              </p>

              <p className="mt-5 text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
                Free in-home estimates from TZ Electric, your local Mitsubishi Electric Diamond Contractor. Financing available.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
                <Button href={QUOTE_HREF} size="lg">
                  Get a Free Estimate
                </Button>
                <Button href={CLAIRE_HREF} variant="outline" size="lg">
                  Chat with Claire
                </Button>
              </div>

              <a
                href={`tel:${COMPANY.phoneRaw}`}
                className="mt-7 inline-flex items-center gap-2.5 text-white/85 hover:text-white transition-colors group"
              >
                <span className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </span>
                <span className="font-heading font-semibold tracking-wide">
                  Or call {COMPANY.phone}
                </span>
              </a>
            </div>

            {/* Lifestyle photo */}
            <div className="relative">
              <div className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <Image
                  src="/images/misc/mini-life/mini-life-split.png"
                  alt="A Mitsubishi mini-split keeping a Hudson Valley home cool and comfortable"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why mini-splits */}
      <section className="section-padding bg-off-white">
        <div className="container-site">
          <SectionHeader
            label="Why a Mini-Split"
            title="Cool every room. Skip the ductwork."
            description="Ductless mini-splits are the most efficient way to add cooling to a Hudson Valley home, especially older homes that were never built for central air."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {REASONS.map((reason) => (
              <div
                key={reason.title}
                className="bg-white rounded-2xl border-2 border-blue/20 p-6 shadow-sm hover:shadow-lg hover:border-blue/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-blue/10 text-blue flex items-center justify-center mb-4">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-heading font-bold text-navy text-lg">{reason.title}</h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{reason.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diamond Contractor trust strip */}
      <section className="section-padding bg-gradient-to-br from-navy-light to-navy">
        <div className="container-site">
          <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-12 items-center">
            <div>
              <span className="text-blue-light text-sm font-heading font-semibold uppercase tracking-wider">
                Why TZ Electric
              </span>
              <h2 className="mt-2 font-heading font-bold text-3xl lg:text-4xl text-white">
                A Mitsubishi Electric Diamond Contractor.
              </h2>
              <p className="mt-4 text-gray-300 leading-relaxed">
                Diamond Contractor is the top dealer tier Mitsubishi awards. It means our team is factory-trained on every Mitsubishi system, our installs meet Mitsubishi&apos;s highest standards, and your equipment qualifies for the best warranty coverage available.
              </p>
              <ul className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  'Factory-trained installers',
                  'Best available warranties',
                  `${COMPANY.reviews.count}+ five-star Google reviews`,
                  'Wisetack & Synchrony financing',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-light flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm">
                <Image
                  src="/images/certifications/diamond-contractor.svg"
                  alt="Mitsubishi Diamond Contractor certification"
                  width={280}
                  height={90}
                  className="mx-auto object-contain brightness-0"
                />
                <Image
                  src="/images/certifications/mitsubishi-electric-dark.svg"
                  alt="Mitsubishi Electric"
                  width={180}
                  height={72}
                  className="mx-auto object-contain mt-4"
                />
                <div className="w-16 h-px bg-gray-200 mx-auto my-4" />
                <p className="text-gray-700 text-sm">
                  Awarded to TZ Electric for exceptional installation standards and customer service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-white">
        <div className="container-site">
          <div className="rounded-3xl bg-gradient-to-br from-blue to-navy p-10 lg:p-14 text-center shadow-xl">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-white">
              Ready for a quieter, cooler summer?
            </h2>
            <p className="mt-3 text-white/85 max-w-2xl mx-auto">
              Free in-home estimates across the Hudson Valley. We&apos;ll size the right system, walk you through financing, and get you on the schedule.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href={QUOTE_HREF} variant="primary" size="lg" className="bg-white text-navy hover:bg-gray-100">
                Get a Free Estimate
              </Button>
              <Button href={`tel:${COMPANY.phoneRaw}`} variant="outline" size="lg">
                Call {COMPANY.phone}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
