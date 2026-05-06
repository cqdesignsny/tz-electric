import Link from 'next/link'
import Image from 'next/image'
import { COMPANY } from '@/lib/constants'
import { claireHref } from '@/lib/claire-links'

interface ClaireSectionProps {
  /** Stable snake_case label used for tracking. Required so each placement reports a unique entry point. */
  source: string
  /** Override the heading. Default works for general "got questions?" placements. */
  heading?: string
  /** Override the supporting copy. */
  description?: string
  /** Override the primary button label. */
  primaryLabel?: string
  /** Optional eyebrow above the heading. */
  eyebrow?: string
  /** Show the call link as a secondary action. Default true. */
  showCallLink?: boolean
  /** Background style. `dark` matches the navy CTASection, `light` is a soft sky variant. Default `dark`. */
  tone?: 'dark' | 'light'
  /** Optional extra className on the section wrapper. */
  className?: string
}

const ClaireSparkleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
  </svg>
)

const PhoneIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
)

/**
 * Full-width section advertising Claire as the fastest way to get answers.
 * Drop into any page where the visitor is mid-decision: homepage, plans,
 * promotions, financing, service overview pages.
 *
 * Two tones:
 *   - `dark`  Navy gradient. Matches the existing CTASection look. Default.
 *   - `light` Soft sky-to-white panel. Use when the surrounding page is dark
 *             or when the dark tone would be the third dark band in a row.
 */
export default function ClaireSection({
  source,
  heading,
  description,
  primaryLabel,
  eyebrow,
  showCallLink = true,
  tone = 'dark',
  className,
}: ClaireSectionProps) {
  const url = claireHref(source)
  const headingText = heading ?? 'Got questions? Claire has answers.'
  const descriptionText =
    description ??
    `Claire is our smart assistant for cooling, heating, electrical, plumbing, generators, and EV chargers in the ${COMPANY.serviceArea}. Ask about pricing, timing, brands, or how to start a project. She can even book a free estimate for you.`
  const primaryText = primaryLabel ?? 'Chat with Claire'

  if (tone === 'light') {
    return (
      <section className={`section-padding bg-gradient-to-br from-sky via-white to-sky/40 ${className ?? ''}`}>
        <div className="container-site">
          <div className="grid lg:grid-cols-[auto_1fr_auto] items-center gap-8 max-w-5xl mx-auto bg-white rounded-3xl border-2 border-blue/20 shadow-xl p-8 md:p-10">
            {/* Avatar */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-blue/30 bg-sky shadow-lg">
                <Image
                  src="/images/agents/claire-profile.png"
                  alt="Claire, TZ Electric smart assistant"
                  width={112}
                  height={112}
                  className="object-cover scale-[1.4] origin-top w-full h-full"
                  sizes="112px"
                />
                <span className="absolute bottom-1 right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-success ring-2 ring-white">
                  <span className="block w-2 h-2 rounded-full bg-white" />
                </span>
              </div>
            </div>

            {/* Copy */}
            <div className="text-center lg:text-left">
              {eyebrow && (
                <span className="text-blue text-xs font-semibold uppercase tracking-wider">{eyebrow}</span>
              )}
              <h2 className="font-heading font-bold text-navy text-2xl md:text-3xl mt-1">
                {headingText}
              </h2>
              <p className="mt-2 text-gray-600 leading-relaxed">
                {descriptionText}
              </p>
              {showCallLink && (
                <p className="mt-3 text-sm text-gray-500">
                  Prefer to talk to a human?{' '}
                  <a href={`tel:${COMPANY.phoneRaw}`} className="font-semibold text-navy hover:text-blue underline-offset-2 hover:underline">
                    Call {COMPANY.phone}
                  </a>
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="flex justify-center lg:justify-end">
              <Link
                href={url}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-heading font-semibold text-base bg-gradient-to-r from-blue to-blue-dark text-white shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
              >
                <ClaireSparkleIcon className="w-5 h-5" />
                {primaryText}
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // dark tone (default)
  return (
    <section className={`section-padding bg-gradient-to-br from-navy via-navy-light to-navy ${className ?? ''}`}>
      <div className="container-site">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[auto_1fr] items-center gap-8 lg:gap-12">
          {/* Avatar */}
          <div className="flex justify-center lg:block">
            <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden ring-4 ring-white/20 bg-sky shadow-2xl">
              <Image
                src="/images/agents/claire-profile.png"
                alt="Claire, TZ Electric smart assistant"
                width={144}
                height={144}
                className="object-cover scale-[1.4] origin-top w-full h-full"
                sizes="144px"
              />
              <span className="absolute bottom-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-success ring-2 ring-navy">
                <span className="block w-2.5 h-2.5 rounded-full bg-white" />
              </span>
            </div>
          </div>

          {/* Copy + CTA */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 text-blue-light text-xs font-semibold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              {eyebrow ?? 'Meet Claire. Online Now.'}
            </span>
            <h2 className="font-heading font-bold text-white text-3xl md:text-4xl mt-2">
              {headingText}
            </h2>
            <p className="mt-4 text-gray-300 text-base md:text-lg leading-relaxed max-w-2xl">
              {descriptionText}
            </p>
            <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
              <Link
                href={url}
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-heading font-semibold text-base bg-gradient-to-r from-blue to-blue-light text-white shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300"
              >
                <ClaireSparkleIcon className="w-5 h-5" />
                {primaryText}
              </Link>
              {showCallLink && (
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-heading font-semibold text-base border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                >
                  <PhoneIcon className="w-5 h-5" />
                  {COMPANY.phone}
                </a>
              )}
            </div>
            <p className="mt-5 text-blue-light/70 text-xs md:text-sm">
              Free to use. Bookings hit our Hudson Valley office in real time. 24/7.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
