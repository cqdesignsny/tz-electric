import type { Metadata } from 'next'
import Link from 'next/link'

import FollowUpsClient, { type FollowUpGroup } from '@/components/switchboard/FollowUpsClient'
import { requireModuleAccess } from '@/lib/current-user'
import { getOpenFollowUps, getRecentlyHandled, type ResolvedFollowUp } from '@/lib/followups'

export const metadata: Metadata = { title: 'Follow-Ups' }
export const dynamic = 'force-dynamic'

export default async function FollowUpsPage() {
  await requireModuleAccess('follow-ups')

  let groups: FollowUpGroup[] = []
  let total = 0
  let recentlyHandled: ResolvedFollowUp[] = []
  let error: string | null = null

  try {
    const [open, handled] = await Promise.all([getOpenFollowUps(14), getRecentlyHandled(7)])
    total = open.total
    recentlyHandled = handled
    // Person groups first (alphabetical by display name), then General office.
    const personGroups: FollowUpGroup[] = [...open.person.entries()]
      .map(([key, items]) => ({ label: open.personDisplay.get(key) || key, items }))
      .sort((a, b) => a.label.localeCompare(b.label))
    groups = [...personGroups]
    if (open.general.length > 0) groups.push({ label: 'General office', items: open.general })
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-10 lg:py-12 max-w-7xl mx-auto w-full">
      <Link
        href="/switchboard"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light font-mono mb-4 transition-colors"
      >
        <span aria-hidden>←</span>
        <span>Dashboard</span>
      </Link>

      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-blue dark:text-blue-light/80 font-mono mb-2">
          TZ Switchboard · Operations
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">Follow-Ups</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base max-w-3xl leading-relaxed">
          Everyone Claire flagged for a callback over the last two weeks, grouped by who it&apos;s for,
          until someone marks it handled. This is the live version of the 6 PM recap email — open it
          anytime to see who still needs a call back. Hit <strong>Log outcome</strong> as you clear them.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
          <div className="font-bold mb-1">Couldn&apos;t load follow-ups</div>
          <code className="text-xs font-mono">{error}</code>
        </div>
      )}

      {!error && <FollowUpsClient groups={groups} total={total} recentlyHandled={recentlyHandled} />}
    </div>
  )
}
