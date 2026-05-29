'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import type { FollowUpItem } from '@/lib/followups'

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

export default function FollowUpsClient({ groups, total }: { groups: FollowUpGroup[]; total: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  function markDone(flagMessageId: string) {
    setError(null)
    setBusyId(flagMessageId)
    startTransition(async () => {
      try {
        const res = await fetch('/api/switchboard/follow-ups/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flagMessageId, action: 'resolve' }),
        })
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(body.error || `Failed (${res.status})`)
        }
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setBusyId(null)
      }
    })
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
        <div className="text-2xl mb-1">✓</div>
        <div className="font-semibold text-navy dark:text-white">All caught up</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          No open callbacks right now. New ones land here the moment Claire flags them.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-3 text-sm text-danger dark:text-red-300">
          {error}
        </div>
      )}
      {groups.map((group) => (
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
              <div key={item.flagMessageId} className="px-5 py-3 flex flex-wrap items-start gap-x-3 gap-y-1.5">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-sm">
                    <strong className="text-navy dark:text-white">{item.customerName || 'Unknown caller'}</strong>
                    {' · '}
                    {item.customerPhone ? (
                      <a href={`tel:${item.customerPhone}`} className="text-blue dark:text-blue-light">
                        {item.customerPhone}
                      </a>
                    ) : (
                      <span className="text-gray-400">no number</span>
                    )}
                    {item.priority === 'high' && (
                      <span className="ml-2 text-xs font-semibold text-red-600 dark:text-red-400">HIGH</span>
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
                <button
                  type="button"
                  onClick={() => markDone(item.flagMessageId)}
                  disabled={isPending && busyId === item.flagMessageId}
                  className="shrink-0 text-xs font-semibold rounded-full border border-emerald-300 dark:border-emerald-700/60 px-3 py-1.5 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 disabled:opacity-50"
                >
                  {isPending && busyId === item.flagMessageId ? 'Saving…' : 'Mark done'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
