'use client'

import { useState } from 'react'

export type Dispatch = {
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

export type Attempt = {
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

export type DispatchWithAttempts = { dispatch: Dispatch; attempts: Attempt[] }

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

function DispatchCard({ item }: { item: DispatchWithAttempts }) {
  const { dispatch: d, attempts } = item
  // Active emergencies open by default so a live one is front-and-center;
  // resolved/closed ones start collapsed.
  const [open, setOpen] = useState(d.status === 'open')

  // Compact delivery roll-up for the collapsed header.
  const delivered = attempts.filter((a) => a.status === 'delivered').length
  const failed = attempts.filter((a) => a.status === 'failed').length
  const pending = attempts.length - delivered - failed

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left p-5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer"
      >
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span
            className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`}
            aria-hidden
          >
            ▶
          </span>
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
          <span className="font-normal text-blue dark:text-blue-light">{d.customer_phone}</span>
        </div>
        <div className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{d.issue_description}</div>

        {/* Collapsed-state roll-up so outcomes are scannable without expanding. */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            {attempts.length} attempt{attempts.length === 1 ? '' : 's'}
          </span>
          {delivered > 0 && <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300">{delivered} delivered</span>}
          {failed > 0 && <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300">{failed} failed</span>}
          {pending > 0 && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">{pending} sent</span>}
          <span className="text-gray-400 dark:text-gray-500 ml-auto">{open ? 'Click to collapse' : 'Click to expand'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          {d.customer_address && (
            <div className="px-5 pt-3 text-sm text-gray-500 dark:text-gray-400">{d.customer_address}</div>
          )}
          {d.resolution_notes && (
            <div className="px-5 pt-2 text-xs text-gray-500 dark:text-gray-400 italic">Resolution: {d.resolution_notes}</div>
          )}
          <div className="divide-y divide-gray-100 dark:divide-gray-800 mt-2">
            {attempts.length === 0 && (
              <div className="px-5 py-3 text-xs text-gray-400">No attempts recorded.</div>
            )}
            {attempts.map((a) => (
              <div key={a.id} className="px-5 py-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-mono text-xs text-gray-400 w-12 shrink-0">#{a.attempt_no}</span>
                <span className="font-semibold text-navy dark:text-white capitalize w-20 shrink-0">{a.target_role}</span>
                <span className="text-gray-600 dark:text-gray-300">{a.target_name || a.target_phone}</span>
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
                {a.error && <span className="basis-full text-xs text-red-500 dark:text-red-400 pl-12">{a.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AfterHoursClient({ items }: { items: DispatchWithAttempts[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <DispatchCard key={item.dispatch.id} item={item} />
      ))}
    </div>
  )
}
