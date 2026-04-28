'use client'

import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { NAV_SECTIONS, navHref, type NavItem } from './nav-config'
import { canAccessModule } from '@/lib/users'

export type SidebarUser = {
  email: string
  role: string
  name: string | null
  pictureUrl: string | null
  /** 'google' = real Google sign-in. 'password' = legacy shared-password fallback (no identity). */
  source: 'google' | 'password'
  /** Per-user permission overrides. Null = use role defaults. */
  permissions: Record<string, boolean> | null
}

type SidebarProps = {
  user: SidebarUser | null
  onNavigate?: () => void
}

export default function Sidebar({ user, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav
      className="flex flex-col h-full"
      aria-label="TZ Switchboard navigation"
    >
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {NAV_SECTIONS.map((section) => {
          // Filter items by per-user module access. The dashboard root
          // (slug: '') is always shown — it's the landing page for any
          // signed-in user.
          const visibleItems = section.items.filter((item) => {
            if (!item.slug) return true
            return canAccessModule(user, item.slug)
          })
          if (visibleItems.length === 0) return null
          return (
            <div key={section.label}>
              <div className="text-[10px] uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 font-semibold mb-2 px-3">
                {section.label}
              </div>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => (
                  <SidebarItem
                    key={item.label}
                    item={item}
                    active={pathname === navHref(item)}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="border-t border-gray-200 dark:border-navy-light/40 px-4 py-4">
        <UserCard user={user} />
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
  if (status === 'live') {
    return (
      <span className="text-[9px] uppercase tracking-wider font-bold bg-success/10 text-success dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.5 rounded flex-shrink-0">
        Live
      </span>
    )
  }
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

function UserCard({ user }: { user: SidebarUser | null }) {
  const handleLogout = async () => {
    if (user?.source === 'google') {
      await signOut({ callbackUrl: '/switchboard/login', redirect: true })
      return
    }
    try {
      await fetch('/api/switchboard/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    window.location.href = '/switchboard/login'
  }

  if (!user) {
    return (
      <button
        onClick={handleLogout}
        className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-light/40 transition-colors"
      >
        Sign out
      </button>
    )
  }

  const displayName =
    user.name || user.email.split('@')[0].replace(/\./g, ' ')
  const initials = (user.name || user.email)
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('')

  return (
    <div>
      <div className="flex items-center gap-3 px-1 mb-3">
        {user.pictureUrl ? (
          <Image
            src={user.pictureUrl}
            alt=""
            width={36}
            height={36}
            className="rounded-full flex-shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials || '?'}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-charcoal dark:text-gray-100 truncate">
            {displayName}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
            <span className="capitalize">{user.role}</span>
            {user.source === 'password' && (
              <span className="text-amber-600 dark:text-amber-400">· legacy</span>
            )}
          </div>
        </div>
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
