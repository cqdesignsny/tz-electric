'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_SECTIONS, navHref, type NavItem } from './nav-config'

type SidebarProps = {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav
      className="flex flex-col h-full"
      aria-label="Switchboard navigation"
    >
      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 font-semibold mb-2 px-3">
              {section.label}
            </div>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.label}
                  item={item}
                  active={pathname === navHref(item)}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-navy-light/40 px-4 py-4">
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
  const href = navHref(item)
  const isActiveModule = item.status === 'active'

  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className={[
          'group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-150',
          active
            ? 'bg-navy dark:bg-blue-light text-white font-semibold shadow-sm'
            : isActiveModule
              ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-navy-light/40'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-light/40 hover:text-gray-700 dark:hover:text-gray-200',
        ].join(' ')}
      >
        <span className="truncate">{item.label}</span>
        {active ? <ActiveDot /> : <StatusPill status={item.status} />}
      </Link>
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
      <span className="text-[9px] uppercase tracking-wider font-bold bg-warning/10 text-warning dark:bg-warning/20 dark:text-amber-300 px-1.5 py-0.5 rounded flex-shrink-0">
        Soon
      </span>
    )
  }
  if (status === 'planned') {
    return (
      <span className="text-[9px] uppercase tracking-wider font-bold bg-gray-100 text-gray-500 dark:bg-navy-light/50 dark:text-gray-300 px-1.5 py-0.5 rounded flex-shrink-0">
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
      <div className="text-xs px-1">
        <div className="font-semibold text-charcoal dark:text-gray-200">
          Admin session
        </div>
        <div className="text-gray-400 dark:text-gray-500">Signed in</div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-light/40 transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
