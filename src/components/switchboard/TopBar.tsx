'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_SECTIONS } from './nav-config'

type TopBarProps = {
  onMobileToggle: () => void
  mobileOpen: boolean
}

export default function TopBar({ onMobileToggle, mobileOpen }: TopBarProps) {
  const pathname = usePathname()
  const currentItem = NAV_SECTIONS.flatMap((s) => s.items).find(
    (item) => item.href === pathname,
  )
  const pageTitle = currentItem?.label || 'TZ Switchboard'

  return (
    <header className="bg-navy text-white border-b border-navy-light sticky top-0 z-30">
      <div className="flex items-center h-16 px-4 md:px-6 gap-4">
        {/* Mobile sidebar toggle */}
        <button
          type="button"
          onClick={onMobileToggle}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-md hover:bg-navy-light transition-colors"
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
        <Link href="/switchboard" className="flex items-center gap-3 flex-shrink-0">
          <Image
            src="/images/logo/tz-logo-main.svg"
            alt="TZ Electric"
            width={140}
            height={40}
            className="h-8 w-auto brightness-0 invert"
            priority
          />
          <div className="hidden sm:block border-l border-white/20 pl-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-blue-light/70 font-mono">
              Internal
            </div>
            <div className="text-sm font-semibold leading-tight">Switchboard</div>
          </div>
        </Link>

        {/* Page title */}
        <div className="flex-1 min-w-0 ml-4 md:ml-8 hidden md:block">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">
            Section
          </div>
          <div className="text-sm font-semibold truncate">{pageTitle}</div>
        </div>

        {/* Right slot */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/"
            className="hidden sm:block text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Public site
          </Link>
        </div>
      </div>
    </header>
  )
}
