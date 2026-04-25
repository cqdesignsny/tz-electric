'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_SECTIONS, type NavItem } from './nav-config'

type SidebarProps = {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav
      className="flex flex-col h-full bg-white border-r border-gray-200"
      aria-label="Switchboard navigation"
    >
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-semibold mb-2 px-3">
              {section.label}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  active={Boolean(item.href && pathname === item.href)}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 px-4 py-4">
        <LogoutButton />
      </div>
    </nav>
  )
}

function SidebarItem({
  item,
  active,
  onNavigate,
}: {
  item: NavItem
  active: boolean
  onNavigate?: () => void
}) {
  const baseClasses =
    'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors'
  const activeClasses = 'bg-navy text-white font-medium'
  const idleClasses = 'text-gray-700 hover:bg-gray-100'
  const disabledClasses = 'text-gray-400 cursor-not-allowed'

  if (item.href && item.status === 'active') {
    return (
      <li>
        <Link
          href={item.href}
          onClick={onNavigate}
          className={`${baseClasses} ${active ? activeClasses : idleClasses}`}
        >
          <span>{item.label}</span>
          {active && <ActiveDot />}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <div className={`${baseClasses} ${disabledClasses}`}>
        <span>{item.label}</span>
        <StatusPill status={item.status} />
      </div>
    </li>
  )
}

function ActiveDot() {
  return (
    <span
      aria-hidden
      className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
    />
  )
}

function StatusPill({ status }: { status: NavItem['status'] }) {
  if (status === 'soon') {
    return (
      <span className="text-[9px] uppercase tracking-wider font-bold bg-warning/10 text-warning px-1.5 py-0.5 rounded">
        Soon
      </span>
    )
  }
  if (status === 'planned') {
    return (
      <span className="text-[9px] uppercase tracking-wider font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
        Planned
      </span>
    )
  }
  return null
}

function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch('/api/switchboard/auth/logout', { method: 'POST' })
    } catch {
      // ignore — proceed to redirect
    }
    window.location.href = '/switchboard/login'
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 px-1">
        <div className="font-semibold text-charcoal">Admin session</div>
        <div className="text-gray-400">Signed in</div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
