'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_SECTIONS, navHref } from './nav-config'
import ThemeToggle from './ThemeToggle'

type TopBarProps = {
  onMobileToggle: () => void
  mobileOpen: boolean
}

export default function TopBar({ onMobileToggle, mobileOpen }: TopBarProps) {
  const pathname = usePathname()
  const currentItem = NAV_SECTIONS.flatMap((s) => s.items).find(
    (item) => navHref(item) === pathname,
  )
  const pageTitle = currentItem?.label || 'TZ Switchboard'

  return (
    <header className="bg-navy dark:bg-[#050817] text-white border-b border-navy-light dark:border-navy-light/40 sticky top-0 z-30">
      <div className="flex items-center h-16 px-3 sm:px-4 md:px-6 gap-2 sm:gap-3 md:gap-4">
        {/* Mobile sidebar toggle */}
        <button
          type="button"
          onClick={onMobileToggle}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-md hover:bg-navy-light dark:hover:bg-navy-light/60 transition-colors flex-shrink-0"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>

        {/* Logo */}
        <Link
          href="/switchboard"
          className="flex items-center gap-3 flex-shrink-0"
        >
          <Image
            src="/images/logo/tz-logo-main.svg"
            alt="TZ Electric"
            width={140}
            height={40}
            className="h-7 sm:h-8 w-auto brightness-0 invert"
            priority
          />
          <div className="hidden sm:block border-l border-white/20 pl-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-blue-light/70 font-mono">
              Internal
            </div>
            <div className="text-sm font-semibold leading-tight">
              Switchboard
            </div>
          </div>
        </Link>

        {/* Page title — hidden on small, visible on lg */}
        <div className="flex-1 min-w-0 ml-4 hidden lg:block">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
            Section
          </div>
          <div className="text-sm font-semibold truncate">{pageTitle}</div>
        </div>

        {/* Spacer to push right cluster outward when no page title shown */}
        <div className="flex-1 lg:hidden" />

        {/* Right cluster: theme toggle + public site link */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <ThemeToggle variant="header" />
          <Link
            href="/"
            className="hidden md:inline-block text-xs text-gray-400 hover:text-white transition-colors whitespace-nowrap"
          >
            ← Public site
          </Link>
        </div>
      </div>
    </header>
  )
}
