'use client'

import Link from 'next/link'
import Image from 'next/image'
import { claireHref, trackClaireCtaClick } from '@/lib/claire-links'
import { cn } from '@/lib/utils'

type ClaireCTAVariant = 'pill' | 'inline' | 'card' | 'hero-secondary' | 'topbar'

interface ClaireCTAProps {
  /** Stable snake_case label used for tracking. Required so every CTA reports a unique entry point. */
  source: string
  /** Visual variant. Defaults to a compact pill button. */
  variant?: ClaireCTAVariant
  /** Override the button label. Default copy depends on variant. */
  label?: string
  /** Override the description (card variant only). */
  description?: string
  /** Extra Tailwind classes appended to the root element. */
  className?: string
  /** Override the click-through link. Defaults to `/claire?source=<source>`. */
  href?: string
}

const ClaireSparkleIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
  </svg>
)

/**
 * Reusable Claire entry-point CTA. Drop into headers, hero sections,
 * service pages, etc. Each variant links to /claire with a tracked
 * `?source=` query param plus a `claire_cta_clicked` GTM event.
 *
 * Variants:
 *   - `pill`            Compact gradient pill, fits next to existing CTAs.
 *   - `inline`          Plain text-style link with sparkle icon, for inline copy.
 *   - `card`            Self-contained card with avatar, headline, button.
 *   - `hero-secondary`  Outline button matching hero CTA size, alongside Quote/Call.
 *   - `topbar`          Tiny pill for the dark site topbar.
 */
export default function ClaireCTA({
  source,
  variant = 'pill',
  label,
  description,
  className,
  href,
}: ClaireCTAProps) {
  const url = href ?? claireHref(source)
  const onClick = () => trackClaireCtaClick(source)

  if (variant === 'card') {
    return (
      <Link
        href={url}
        onClick={onClick}
        className={cn(
          'group relative block rounded-2xl border-2 border-blue/30 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-blue hover:shadow-xl overflow-hidden',
          className,
        )}
      >
        <div className="absolute top-0 left-6 right-6 h-1 bg-gradient-to-r from-blue to-blue-light rounded-b-full opacity-60 group-hover:opacity-100 group-hover:left-0 group-hover:right-0 transition-all duration-300" />
        <div className="flex items-start gap-4">
          <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-blue/20 bg-sky">
            <Image
              src="/images/agents/claire-profile.png"
              alt="Claire, TZ Electric smart assistant"
              width={56}
              height={56}
              className="object-cover scale-[1.4] origin-top w-full h-full"
              sizes="56px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-bold text-navy text-base group-hover:text-blue transition-colors">
                {label ?? 'Chat with Claire'}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Online
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              {description ?? 'Ask Claire anything about cooling, heating, electrical, plumbing, generators, or pricing. Instant answers, day or night.'}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-blue text-sm font-semibold group-hover:gap-2.5 transition-all">
              Start chatting
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'inline') {
    return (
      <Link
        href={url}
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1.5 text-blue font-semibold hover:text-blue-dark hover:underline transition-colors',
          className,
        )}
      >
        <ClaireSparkleIcon className="w-4 h-4" />
        {label ?? 'Ask Claire'}
      </Link>
    )
  }

  if (variant === 'hero-secondary') {
    return (
      <Link
        href={url}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-heading font-semibold text-base',
          'bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white',
          'hover:bg-white/20 hover:border-white/70 transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-navy',
          className,
        )}
      >
        <ClaireSparkleIcon className="w-5 h-5" />
        {label ?? 'Ask Claire'}
      </Link>
    )
  }

  if (variant === 'topbar') {
    return (
      <Link
        href={url}
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors text-xs md:text-sm',
          className,
        )}
      >
        <ClaireSparkleIcon className="w-3.5 h-3.5" />
        <span className="font-semibold">{label ?? 'Ask Claire'}</span>
      </Link>
    )
  }

  // Default: pill
  return (
    <Link
      href={url}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-heading font-semibold rounded-full',
        'bg-gradient-to-r from-blue to-blue-dark text-white shadow-md',
        'hover:shadow-xl hover:scale-[1.02] transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2',
        className,
      )}
    >
      <ClaireSparkleIcon className="w-4 h-4" />
      {label ?? 'Ask Claire'}
    </Link>
  )
}
