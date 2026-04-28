import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import UsersClient from '@/components/switchboard/UsersClient'
import { getCurrentUser } from '@/lib/current-user'
import { canManageUsers, listUsers } from '@/lib/users'

export const metadata: Metadata = {
  title: 'User Access',
}

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const cu = await getCurrentUser()
  if (!cu) redirect('/switchboard/login?next=/switchboard/users')
  if (!canManageUsers(cu.role)) {
    return (
      <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-10 max-w-3xl mx-auto">
        <Link
          href="/switchboard"
          className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-mono"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-navy dark:text-white mt-3">
          User Access
        </h1>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Only owners can manage user access. Ask Tyler or Terry if you need someone added or a role changed.
        </p>
      </div>
    )
  }

  const users = await listUsers({ includeDisabled: true })

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-10 lg:py-12 max-w-5xl mx-auto w-full">
      <Link
        href="/switchboard"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light font-mono mb-4 transition-colors"
      >
        <span aria-hidden>←</span>
        <span>Dashboard</span>
      </Link>

      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-blue dark:text-blue-light/80 font-mono mb-2">
          TZ Switchboard · Owner-only
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
          User Access
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base max-w-3xl leading-relaxed">
          Anyone signing in with a @tzelectricinc.com Google account lands here as an &quot;office&quot; user by default.
          Promote, demote, or disable from this page. Roles: <strong>owner</strong> (you), <strong>admin</strong> (technical leads), <strong>office</strong> (intake, leads, conversation takeover), <strong>viewer</strong> (read-only).
        </p>
      </header>

      <UsersClient users={users} actorEmail={cu.email} />
    </div>
  )
}
