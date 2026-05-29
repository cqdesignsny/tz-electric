import type { Metadata } from 'next'
import Link from 'next/link'

import AfterHoursClient, {
  type Attempt,
  type Dispatch,
  type DispatchWithAttempts,
} from '@/components/switchboard/AfterHoursClient'
import { requireModuleAccess } from '@/lib/current-user'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'After-Hours Dispatch' }
export const dynamic = 'force-dynamic'

export default async function AfterHoursPage() {
  await requireModuleAccess('after-hours')

  let items: DispatchWithAttempts[] = []
  let error: string | null = null

  try {
    const sql = db()
    const dispatches = (await sql`
      SELECT id, customer_name, customer_phone, customer_address, issue_description,
             safety_flags, time_window, status, opened_at, resolved_at,
             resolution_notes, customer_callback_sent_at
      FROM tz_emergency_dispatches
      ORDER BY opened_at DESC
      LIMIT 50
    `) as Dispatch[]

    const attemptsByDispatch = new Map<string, Attempt[]>()
    if (dispatches.length > 0) {
      const ids = dispatches.map((d) => d.id)
      const attempts = (await sql`
        SELECT id, dispatch_id, attempt_no, target_role, target_name, target_phone,
               channel, status, twilio_sid, error, error_code, fired_at, delivered_at
        FROM tz_dispatch_attempts
        WHERE dispatch_id = ANY(${ids})
        ORDER BY attempt_no ASC, fired_at ASC
      `) as Attempt[]
      for (const a of attempts) {
        const arr = attemptsByDispatch.get(a.dispatch_id) ?? []
        arr.push(a)
        attemptsByDispatch.set(a.dispatch_id, arr)
      }
    }

    items = dispatches.map((d) => ({ dispatch: d, attempts: attemptsByDispatch.get(d.id) ?? [] }))
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
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">After-Hours Dispatch</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base max-w-3xl leading-relaxed">
          Every after-hours emergency Claire dispatched. Click a card to open its full escalation
          ladder and the real delivery status of each page. A green badge means the text or call
          actually reached the tech; red means it failed (the error code shows why — e.g.{' '}
          <code>30034</code> is an unregistered-A2P SMS rejection).
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
          <div className="font-bold mb-1">Couldn&apos;t load dispatches</div>
          <code className="text-xs font-mono">{error}</code>
        </div>
      )}

      {!error && items.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center text-gray-500 dark:text-gray-400">
          No after-hours emergency dispatches yet. When Claire dispatches one, it will appear here
          with its full attempt ladder.
        </div>
      )}

      {items.length > 0 && <AfterHoursClient items={items} />}
    </div>
  )
}
