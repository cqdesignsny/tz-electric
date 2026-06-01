'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

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
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pickingId, setPickingId] = useState<string | null>(null)
  const [otherMode, setOtherMode] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [showHandled, setShowHandled] = useState(false)

  // The item whose outcome modal is open (looked up fresh each render so it
  // survives a router.refresh that rebuilds the groups array).
  const pickingItem = pickingId
    ? groups.flatMap((g) => g.items).find((i) => i.flagMessageId === pickingId) ?? null
    : null

  function closeModal() {
    setPickingId(null)
    setOtherMode(false)
    setNoteDraft('')
  }

  // Close the outcome modal on Escape (desktop convenience; harmless on touch).
  useEffect(() => {
    if (!pickingId) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPickingId(null)
        setOtherMode(false)
        setNoteDraft('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pickingId])

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
        closeModal()
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setBusyId(null)
      }
    })
  }

  function logOutcome(flagMessageId: string, outcome: string, note: string | null) {
    post(flagMessageId, { action: 'resolve', outcome, note })
  }

  function openPicker(flagMessageId: string) {
    setError(null)
    setNoteDraft('')
    setOtherMode(false)
    setPickingId(flagMessageId)
  }

  const saving = !!busyId

  return (
    <div className="space-y-5 pb-24 lg:pb-6">
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
              {group.items.map((item) => (
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

                  {/* A single, large tap target. Opens a centered modal picker so
                      the outcome buttons never sit under the fixed Claire panel /
                      mobile bubble, and work identically on phone / tablet / desktop. */}
                  <button
                    type="button"
                    onClick={() => openPicker(item.flagMessageId)}
                    aria-haspopup="dialog"
                    aria-label={`Log callback outcome for ${item.customerName || 'this caller'}`}
                    className="touch-manipulation shrink-0 inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-700/60 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:bg-emerald-100 dark:active:bg-emerald-900/50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    Log outcome
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Recently handled — closed callbacks stay visible with their outcome + note. */}
      {recentlyHandled.length > 0 && (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHandled((v) => !v)}
            aria-expanded={showHandled}
            className="touch-manipulation w-full text-left px-5 py-3 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
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
                    className="touch-manipulation inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-navy dark:hover:text-white cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 4v6h6" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    Reopen
                  </button>
                  {item.note && (
                    <div className="basis-full text-xs text-gray-500 dark:text-gray-400 italic leading-snug">
                      &ldquo;{item.note}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Outcome picker — centered modal. z-[60] sits above the fixed Claire
          panel (z-30) and the mobile Claire bubble/modal (z-40/z-50), so the
          buttons are always tappable on phone, tablet, and desktop. No
          window.prompt (it's a no-op in iOS standalone / home-screen mode). */}
      {pickingItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Log callback outcome"
        >
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="px-5 pt-5 pb-3">
              <div className="text-sm font-bold text-navy dark:text-white">How did the callback go?</div>
              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {pickingItem.customerName || 'Unknown caller'}
                {pickingItem.customerPhone ? ` · ${pickingItem.customerPhone}` : ''}
              </div>
            </div>

            {!otherMode ? (
              <div className="px-4 pb-4 grid gap-2">
                {FOLLOWUP_OUTCOMES.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      o.value === 'other'
                        ? setOtherMode(true)
                        : logOutcome(pickingItem.flagMessageId, o.value, null)
                    }
                    className="touch-manipulation flex items-center gap-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm font-medium text-navy dark:text-gray-100 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue/30 disabled:opacity-50"
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${toneDot(o.tone)}`} aria-hidden />
                    {o.label}
                    {o.value === 'other' && (
                      <span className="ml-auto text-gray-400" aria-hidden>
                        ›
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-5 pb-5 space-y-3">
                <label htmlFor="fu-note" className="block text-xs font-medium text-gray-600 dark:text-gray-300">
                  What happened? <span className="font-normal text-gray-400">(shows on the card)</span>
                </label>
                <textarea
                  id="fu-note"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  autoFocus
                  maxLength={500}
                  placeholder="e.g. Left a voicemail, will try again tomorrow"
                  style={{ fontSize: '16px' }}
                  className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-navy dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue/40"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOtherMode(false)}
                    className="touch-manipulation rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => logOutcome(pickingItem.flagMessageId, 'other', noteDraft.trim() || null)}
                    className="touch-manipulation flex-1 rounded-xl bg-blue dark:bg-blue-light px-4 py-2.5 text-sm font-semibold text-white dark:text-navy hover:bg-blue-dark dark:hover:bg-blue cursor-pointer transition-colors disabled:opacity-50"
                  >
                    Save outcome
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 px-4 py-3">
              <button
                type="button"
                onClick={closeModal}
                className="touch-manipulation rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              {saving && <span className="text-xs text-gray-400">Saving…</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
