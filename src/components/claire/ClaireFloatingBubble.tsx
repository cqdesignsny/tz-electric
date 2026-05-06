'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { claireHref, trackClaireCtaClick } from '@/lib/claire-links'

const HIDDEN_PATHS = ['/switchboard', '/internal', '/claire']
const DISMISS_KEY = 'tz-claire-bubble-dismissed'
const TEASER_DELAY_MS = 2500
const TEASER_VISIBLE_MS = 7000

/**
 * Persistent bottom-right Claire entry point. Shows on every public page
 * except `/claire` itself and the TZ Switchboard.
 *
 * Behavior:
 *   - Renders after a small delay so it doesn't flash during initial paint.
 *   - Auto-shows a one-time teaser bubble ("Hi! I'm Claire. Got questions?")
 *     a couple seconds after mount, dismisses itself after a few seconds.
 *   - Visitor can dismiss the teaser; the avatar pill stays.
 *   - Visitor can dismiss the entire widget for the session (sessionStorage).
 *   - Click anywhere on the avatar opens `/claire?source=floating_bubble`.
 *
 * Lives on the right so it doesn't collide with the existing FloatingCTA
 * (Call / Get a Free Quote) on the bottom-left.
 */
export default function ClaireFloatingBubble() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [showTeaser, setShowTeaser] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Mount with a short delay to avoid flashing during page transitions.
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 600)
    return () => clearTimeout(t)
  }, [])

  // Restore dismissed state from sessionStorage and run the teaser sequence.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.sessionStorage.getItem(DISMISS_KEY) === '1') {
      setDismissed(true)
      return
    }
    const teaserOn = setTimeout(() => setShowTeaser(true), TEASER_DELAY_MS)
    const teaserOff = setTimeout(() => setShowTeaser(false), TEASER_DELAY_MS + TEASER_VISIBLE_MS)
    return () => {
      clearTimeout(teaserOn)
      clearTimeout(teaserOff)
    }
  }, [])

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(DISMISS_KEY, '1')
    }
    setDismissed(true)
  }

  const handleTeaserClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowTeaser(false)
  }

  if (HIDDEN_PATHS.some((p) => pathname?.startsWith(p))) return null
  if (!mounted || dismissed) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* Teaser bubble */}
      <AnimatePresence>
        {showTeaser && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto relative max-w-[260px] rounded-2xl bg-white shadow-2xl border border-gray-200 px-4 py-3 mr-1"
          >
            <button
              type="button"
              onClick={handleTeaserClose}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-700 flex items-center justify-center shadow"
              aria-label="Dismiss Claire teaser"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <p className="font-heading font-semibold text-navy text-sm">
              Hi, I&apos;m Claire.
            </p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Got questions about service, pricing, or scheduling? I can help right now.
            </p>
            <Link
              href={claireHref('floating_bubble_teaser')}
              onClick={() => trackClaireCtaClick('floating_bubble_teaser')}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue hover:text-blue-dark"
            >
              Start chatting
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
            {/* Pointer triangle */}
            <span className="absolute -bottom-1.5 right-7 w-3 h-3 rotate-45 bg-white border-r border-b border-gray-200" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bubble */}
      <div className="pointer-events-auto relative">
        <Link
          href={claireHref('floating_bubble')}
          onClick={() => trackClaireCtaClick('floating_bubble')}
          className="group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-gradient-to-r from-blue to-blue-dark text-white shadow-2xl hover:shadow-blue/40 hover:scale-105 transition-all duration-300 ring-2 ring-white/50"
          aria-label="Chat with Claire, TZ Electric's smart assistant"
        >
          <span className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-white/80 bg-sky flex-shrink-0">
            <Image
              src="/images/agents/claire-profile.png"
              alt=""
              width={44}
              height={44}
              className="object-cover scale-[1.4] origin-top w-full h-full"
              sizes="44px"
              aria-hidden="true"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success ring-2 ring-white" aria-hidden="true" />
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-heading font-bold text-sm">Chat with Claire</span>
            <span className="text-[11px] text-white/80">Smart assistant · 24/7</span>
          </span>
          <span className="sm:hidden font-heading font-bold text-sm">Claire</span>
        </Link>

        {/* Dismiss for the session */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 flex items-center justify-center shadow"
          aria-label="Hide Claire for this session"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  )
}
