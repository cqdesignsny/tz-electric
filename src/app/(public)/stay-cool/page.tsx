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
    body: "Hyper-Heating Mitsubishi systems run down to -13°F, so the same unit covers you year-round.",
  },
]

export default function StayCoolPage() {
  return (
    <>
      {/* Hero — billboard-matching split layout */}
      <section className="relative overflow-hidden">
        {/* Mobile: stacked. Desktop: white panel left, navy panel right. */}
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Left panel — brand + phone */}
          <div className="bg-white px-6 py-10 lg:py-16 lg:px-12 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <Image
              src="/images/logo/tz-logo-main.svg"
              alt="TZ Electric, Inc."
              width={320}
              height={120}
              className="h-auto w-[240px] lg:w-[320px]"
              priority
            />
            <p className="mt-4 text-navy/80 text-sm lg:text-base font-heading font-semibold tracking-wider uppercase">
              Plumbing &nbsp;|&nbsp; Heating &nbsp;|&nbsp; Cooling
            </p>

            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="mt-6 lg:mt-10 inline-flex items-center gap-3 group"
            >
              <span className="w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-blue text-white flex items-center justify-center group-hover:bg-blue-dark transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </span>
              <span className="text-blue text-2xl lg:text-3xl font-heading font-bold tracking-tight group-hover:text-blue-dark transition-colors">
                {COMPANY.phone}
              </span>
            </a>

            {/* Diamond Contractor + Mitsubishi Electric stack — visible on mobile, hidden on desktop where right panel carries them */}
            <div className="mt-8 lg:hidden flex items-center gap-6">
              <Image
                src="/images/certifications/mitsubishi-electric.svg"
                alt="Mitsubishi Electric"
                width={140}
                height={56}
                className="h-10 w-auto object-contain"
              />
              <div className="w-px h-10 bg-gray-200" />
              <Image
                src="/images/certifications/diamond-contractor.svg"
                alt="Mitsubishi Diamond Contractor"
                width={140}
                height={56}
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>

          {/* Right panel — navy, billboard headline + image */}
          <div className="relative bg-navy text-white px-6 py-12 lg:py-16 lg:px-12 overflow-hidden">
            {/* Top row: certifications (desktop only) */}
            <div className="hidden lg:flex items-center gap-8 mb-10">
              <Image
                src="/images/certifications/mitsubishi-electric.svg"
                alt="Mitsubishi Electric"
                width={180}
                height={72}
                className="h-14 w-auto object-contain"
              />
              <div className="w-px h-12 bg-white/20" />
              <Image
                src="/images/certifications/diamond-contractor.svg"
                alt="Mitsubishi Diamond Contractor"
                width={200}
                height={72}
                className="h-14 w-auto object-contain brightness-0 invert"
              />
            </div>

            <div className="relative z-10 grid lg:grid-cols-[minmax(0,4fr)_minmax(0,3fr)] gap-8 items-center">
              <div>
                <h1 className="font-heading font-bold leading-[0.95] tracking-tight">
                  <span className="block text-blue-light text-5xl sm:text-6xl lg:text-7xl xl:text-8xl">
                    Stay Cool
                  </span>
                  <span className="block text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl mt-1">
                    This Summer
                  </span>
                </h1>

                <p className="mt-6 text-white/85 text-lg lg:text-xl uppercase tracking-wider font-heading font-semibold">
                  Mini-Split Installations
                </p>

                <p className="mt-5 text-gray-300 text-base lg:text-lg max-w-xl leading-relaxed">
                  Free in-home estimates from TZ Electric, your local Mitsubishi Electric Diamond Contractor. Financing available.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button href={QUOTE_HREF} size="lg">
                    Get a Free Estimate
                  </Button>
                  <Button href={CLAIRE_HREF} variant="outline" size="lg">
                    Chat with Claire
                  </Button>
                </div>
              </div>

              {/* Mini-split image */}
              <div className="relative h-[260px] sm:h-[340px] lg:h-[420px]">
                <Image
                  src="/images/misc/mini-split-blowing.png"
                  alt="Mitsubishi Electric ductless mini-split blowing cool air"
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-contain object-center"
                  priority
                />
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
      <section className="section-padding bg-gradient-to-br from-navy-light to-navy text-white">
        <div className="container-site">
          <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-12 items-center">
            <div>
              <span className="text-blue-light text-sm font-heading font-semibold uppercase tracking-wider">
                Why TZ Electric
              </span>
              <h2 className="mt-2 font-heading font-bold text-3xl lg:text-4xl">
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
          <div className="rounded-3xl bg-gradient-to-br from-blue to-navy p-10 lg:p-14 text-center text-white shadow-xl">
            <h2 className="font-heading font-bold text-3xl lg:text-4xl">
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
