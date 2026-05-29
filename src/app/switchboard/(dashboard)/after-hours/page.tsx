import type { Metadata } from 'next'
import Link from 'next/link'

import { requireModuleAccess } from '@/lib/current-user'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'After-Hours Dispatch' }
export const dynamic = 'force-dynamic'

type Dispatch = {
  id: string
  customer_name: string | null
  customer_phone: string
  customer_address: string | null
  issue_description: string
  safety_flags: string[] | null
  time_window: string
  status: string
  opened_at: string
  resolved_at: string | null
  resolution_notes: string | null
  customer_callback_sent_at: string | null
}

type Attempt = {
  id: string
  dispatch_id: string
  attempt_no: number
  target_role: string
  target_name: string | null
  target_phone: string
  channel: string
  status: string
  twilio_sid: string | null
  error: string | null
  error_code: string | null
  fired_at: string
  delivered_at: string | null
}

function fmt(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

function attemptBadge(status: string): string {
  switch (status) {
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
    case 'sent':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
    case 'skipped':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }
}

function dispatchBadge(status: string): string {
  if (status.startsWith('resolved')) return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
  if (status === 'open') return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
  if (status === 'closed_no_response') return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
  return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

export default async function AfterHoursPage() {
  await requireModuleAccess('after-hours')

  let dispatches: Dispatch[] = []
  let attemptsByDispatch = new Map<string, Attempt[]>()
  let error: string | null = null

  try {
    const sql = db()
    dispatches = (await sql`
      SELECT id, customer_name, customer_phone, customer_address, issue_description,
             safety_flags, time_window, status, opened_at, resolved_at,
             resolution_notes, customer_callback_sent_at
      FROM tz_emergency_dispatches
      ORDER BY opened_at DESC
      LIMIT 50
    `) as Dispatch[]

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
          Every after-hours emergency Claire dispatched, with the full escalation ladder and the
          real delivery status of each page. A green badge means the text or call actually reached
          the tech; red means it failed (the error code shows why — e.g. <code>30034</code> is an
          unregistered-A2P SMS rejection).
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
          <div className="font-bold mb-1">Couldn&apos;t load dispatches</div>
          <code className="text-xs font-mono">{error}</code>
        </div>
      )}

      {!error && dispatches.length === 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center text-gray-500 dark:text-gray-400">
          No after-hours emergency dispatches yet. When Claire dispatches one, it will appear here
          with its full attempt ladder.
        </div>
      )}

      <div className="space-y-5">
        {dispatches.map((d) => {
          const attempts = attemptsByDispatch.get(d.id) ?? []
          return (
            <div
              key={d.id}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wide ${dispatchBadge(d.status)}`}>
                    {d.status.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {d.time_window.replace(/_/g, ' ')}
                  </span>
                  {(d.safety_flags ?? []).map((f) => (
                    <span key={f} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300">
                      {f}
                    </span>
                  ))}
                  <span className="ml-auto text-xs text-gray-400 font-mono">Opened {fmt(d.opened_at)}</span>
                </div>
                <div className="font-bold text-navy dark:text-white">
                  {d.customer_name || 'Unknown caller'}{' '}
                  <a href={`tel:${d.customer_phone}`} className="font-normal text-blue dark:text-blue-light">
                    {d.customer_phone}
                  </a>
                </div>
                {d.customer_address && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{d.customer_address}</div>
                )}
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">{d.issue_description}</div>
                {d.resolution_notes && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                    Resolution: {d.resolution_notes}
                  </div>
                )}
              </div>

              {/* Attempt ladder */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {attempts.length === 0 && (
                  <div className="px-5 py-3 text-xs text-gray-400">No attempts recorded.</div>
                )}
                {attempts.map((a) => (
                  <div key={a.id} className="px-5 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-mono text-xs text-gray-400 w-12 shrink-0">#{a.attempt_no}</span>
                    <span className="font-semibold text-navy dark:text-white capitalize w-20 shrink-0">
                      {a.target_role}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {a.target_name || a.target_phone}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-mono uppercase bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      {a.channel}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${attemptBadge(a.status)}`}>
                      {a.status}
                      {a.error_code ? ` · ${a.error_code}` : ''}
                    </span>
                    <span className="ml-auto text-xs text-gray-400 font-mono">
                      {fmt(a.fired_at)}
                      {a.delivered_at ? ` → ${fmt(a.delivered_at)}` : ''}
                    </span>
                    {a.error && (
                      <span className="basis-full text-xs text-red-500 dark:text-red-400 pl-12">{a.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
