'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { FOLLOWUP_OUTCOMES, outcomeLabel, outcomeTone, type OutcomeTone } from '@/lib/followup-outcomes'
import type { FollowUpItem, ResolvedFollowUp } from '@/lib/followups'

export type FollowUpGroup = { label: string; items: FollowUpItem[] }

function fmt(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

function channelLabel(channel: string | null): string {
  return channel === 'web_chat' ? 'Web chat' : channel === 'sms' ? 'SMS' : 'Voice'
}

function toneDot(tone: OutcomeTone): string {
  return tone === 'green'
    ? 'bg-emerald-500'
    : tone === 'red'
      ? 'bg-red-500'
      : tone === 'amber'
        ? 'bg-amber-500'
        : 'bg-gray-400'
}

function toneBadge(tone: OutcomeTone): string {
  return tone === 'green'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
    : tone === 'red'
      ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300'
      : tone === 'amber'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

export default function FollowUpsClient({
  groups,
  total,
  recentlyHandled,
}: {
  groups: FollowUpGroup[]
  total: number
  recentlyHandled: ResolvedFollowUp[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pickingId, setPickingId] = useState<string | null>(null)
  const [showHandled, setShowHandled] = useState(false)

  function post(flagMessageId: string, body: Record<string, unknown>) {
    setError(null)
    setBusyId(flagMessageId)
    startTransition(async () => {
      try {
        const res = await fetch('/api/switchboard/follow-ups/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flagMessageId, ...body }),
        })
        if (!res.ok) {
          const b = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(b.error || `Failed (${res.status})`)
        }
        setPickingId(null)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setBusyId(null)
      }
    })
  }

  function logOutcome(flagMessageId: string, outcome: string) {
    let note: string | null = null
    if (outcome === 'other' && typeof window !== 'undefined') {
      note = window.prompt('Add a quick note (optional):')?.trim() || null
    }
    post(flagMessageId, { action: 'resolve', outcome, note })
  }

  return (
    <div className="space-y-5">
      {error && (
        <div role="alert" className="rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-3 text-sm text-danger dark:text-red-300">
          {error}
        </div>
      )}

      {total === 0 ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-emerald-600 dark:text-emerald-400" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="font-semibold text-navy dark:text-white">All caught up</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            No open callbacks right now. New ones land here the moment Claire flags them.
          </div>
        </div>
      ) : (
        groups.map((group) => (
          <div
            key={group.label}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.04em] text-navy dark:text-white">
                {group.label}
              </span>
              <span className="text-xs text-gray-400 font-mono">{group.items.length}</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {group.items.map((item) => {
                const picking = pickingId === item.flagMessageId
                const busy = busyId === item.flagMessageId
                return (
                  <div key={item.flagMessageId} className="px-5 py-3 flex flex-wrap items-start gap-x-3 gap-y-2">
                    <div className="flex-1 min-w-[200px]">
                      <div className="text-sm">
                        <strong className="text-navy dark:text-white">{item.customerName || 'Unknown caller'}</strong>
                        {' · '}
                        {item.customerPhone ? (
                          <a href={`tel:${item.customerPhone}`} className="text-blue dark:text-blue-light hover:underline">
                            {item.customerPhone}
                          </a>
                        ) : (
                          <span className="text-gray-400">no number</span>
                        )}
                        {item.priority === 'high' && (
                          <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                            HIGH
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{item.summary}</div>
                      <div className="text-xs text-gray-400 mt-0.5 font-mono">
                        {channelLabel(item.channel)} · {fmt(item.createdAt)} ·{' '}
                        <a href={item.link} className="text-gray-500 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light">
                          open
                        </a>
                      </div>
                    </div>

                    {/* Action: a clear button that reveals the outcome chips inline. */}
                    {!picking ? (
                      <button
                        type="button"
                        onClick={() => {
                          setError(null)
                          setPickingId(item.flagMessageId)
                        }}
                        aria-expanded={false}
                        aria-label={`Log callback outcome for ${item.customerName || 'this caller'}`}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-700/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        Log outcome
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPickingId(null)}
                        className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300/50"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Inline outcome picker (no clipping, fully keyboard-accessible). */}
                    {picking && (
                      <div className="basis-full flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-0.5">How did the callback go?</span>
                        {FOLLOWUP_OUTCOMES.map((o) => (
                          <button
                            key={o.value}
                            type="button"
                            disabled={busy}
                            onClick={() => logOutcome(item.flagMessageId, o.value)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-medium text-navy dark:text-gray-100 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue/30 disabled:opacity-50"
                          >
                            <span className={`h-2 w-2 rounded-full ${toneDot(o.tone)}`} aria-hidden />
                            {o.chip}
                          </button>
                        ))}
                        {busy && <span className="text-xs text-gray-400">Saving…</span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Recently handled — closed callbacks stay visible with their outcome. */}
      {recentlyHandled.length > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHandled((v) => !v)}
            aria-expanded={showHandled}
            className="w-full text-left px-5 py-3 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
          >
            <span className={`text-gray-400 transition-transform ${showHandled ? 'rotate-90' : ''}`} aria-hidden>
              ▶
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.04em] text-gray-500 dark:text-gray-400">
              Recently handled (last 7 days)
            </span>
            <span className="text-xs text-gray-400 font-mono">{recentlyHandled.length}</span>
          </button>
          {showHandled && (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
              {recentlyHandled.map((item) => (
                <div key={item.flagMessageId} className="px-5 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${toneBadge(outcomeTone(item.outcome))}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${toneDot(outcomeTone(item.outcome))}`} aria-hidden />
                    {outcomeLabel(item.outcome)}
                  </span>
                  <span className="text-navy dark:text-white">{item.customerName || 'Unknown caller'}</span>
                  <span className="text-gray-400">{item.customerPhone || ''}</span>
                  {item.targetName && <span className="text-xs text-gray-400">for {item.targetName}</span>}
                  <span className="ml-auto text-xs text-gray-400 font-mono">
                    {item.resolvedByEmail ? item.resolvedByEmail.split('@')[0] : 'someone'} · {fmt(item.resolvedAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => post(item.flagMessageId, { action: 'reopen' })}
                    disabled={busyId === item.flagMessageId}
                    className="text-xs text-gray-400 hover:text-blue dark:hover:text-blue-light cursor-pointer disabled:opacity-50"
                  >
                    reopen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
