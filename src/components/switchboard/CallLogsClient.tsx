'use client'
/**
 * Read-only voice call viewer for /switchboard/call-logs. Mirrors the
 * shape of WebChatConversationsClient — same two-pane layout, same
 * message rendering — but with a few voice-specific bits:
 *
 * - No "office reply" composer. A human can't reply to a voice call
 *   asynchronously; takeover would mean picking up the phone, which is
 *   a future Phase work.
 * - Recording URL is parsed from `closed_reason` (we stash it there
 *   from the end-of-call-report) and rendered as an inline player.
 * - Vapi call id (`external_call_id`) shows as a debug pill so support
 *   can correlate to the Vapi dashboard.
 */
import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { AgentConversation, AgentMessage } from '@/lib/agent-conversations'

export type CallLogsClientProps = {
  conversations: AgentConversation[]
  activeId: string | null
  active: AgentConversation | null
  messages: AgentMessage[]
}

export default function CallLogsClient(props: CallLogsClientProps) {
  const { conversations, activeId, active, messages } = props
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'escalated'>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return conversations
    return conversations.filter((c) => c.status === filter)
  }, [conversations, filter])

  // Master-detail pattern for mobile (fix to 2026-05-27 PM Tyler feedback —
  // on phone/iPad, the threadlist + activepane stack vertically so the
  // transcript and audio player were buried below 50 thread rows. On
  // mobile we now show one or the other based on activeId; desktop still
  // shows both side by side.
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
      {/* Thread list — hidden on mobile when a call is selected */}
      <aside
        className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden ${
          activeId ? 'hidden lg:block' : 'block'
        }`}
      >
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-800">
          {(['all', 'open', 'closed', 'escalated'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                filter === f
                  ? 'bg-blue text-white dark:bg-blue-light dark:text-navy'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <ul className="max-h-[80vh] lg:max-h-[70vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.length === 0 && (
            <li className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No calls yet.
            </li>
          )}
          {filtered.map((c) => {
            const isActive = c.id === activeId
            const label = c.customer_name || c.customer_phone || shortId(c.id)
            const recordingUrl = parseRecording(c.closed_reason)
            return (
              <li key={c.id}>
                <Link
                  href={`/switchboard/call-logs?id=${encodeURIComponent(c.id)}`}
                  className={`block px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${
                    isActive ? 'bg-blue/5 dark:bg-blue-light/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <StatusDot status={c.status} />
                    <span className="font-semibold text-sm text-navy dark:text-white truncate">
                      {label}
                    </span>
                    {recordingUrl && (
                      <span className="ml-auto text-[10px] uppercase tracking-wider font-mono text-blue dark:text-blue-light">
                        REC
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {c.customer_phone || c.attribution_channel || 'No caller ID'}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider font-mono text-gray-400 dark:text-gray-500">
                    {formatRelative(c.created_at)}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* Active conversation pane — hidden on mobile when no call selected */}
      <section
        className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden flex-col min-h-[60vh] ${
          !activeId ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {!active ? (
          <div className="flex-1 grid place-items-center text-sm text-gray-500 dark:text-gray-400 p-10 text-center">
            Pick a call from the list to view its transcript.
          </div>
        ) : (
          <ActiveCallPane active={active} messages={messages} />
        )}
      </section>
    </div>
  )
}

function ActiveCallPane({
  active,
  messages,
}: {
  active: AgentConversation
  messages: AgentMessage[]
}) {
  const recordingUrl = parseRecording(active.closed_reason)
  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-800 p-4">
        {/* Back to list — mobile only. Lets users return to the thread
            list without using the browser back button (which loses state). */}
        <Link
          href="/switchboard/call-logs"
          className="lg:hidden inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light font-mono mb-3 transition-colors"
        >
          <span aria-hidden>←</span>
          <span>All calls</span>
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wider font-mono text-blue dark:text-blue-light/80">
              Voice Call · {active.status}
            </div>
            <h2 className="text-lg font-bold text-navy dark:text-white mt-0.5">
              {active.customer_name || active.customer_phone || shortId(active.id)}
            </h2>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
              {active.customer_phone || 'No caller ID'}
              {active.external_call_id && (
                <span className="ml-2">· Vapi {shortId(active.external_call_id)}</span>
              )}
            </div>
          </div>
          {active.tz_lead_id && (
            <Link
              href={`/switchboard/lead-pipeline?leadId=${encodeURIComponent(active.tz_lead_id)}`}
              className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              Lead captured →
            </Link>
          )}
        </div>
        {recordingUrl && (
          <div className="mt-3">
            <audio controls preload="none" src={recordingUrl} className="w-full">
              Recording: <a href={recordingUrl}>download</a>
            </audio>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No transcript yet. End-of-call report may still be processing.
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>
    </>
  )
}

function MessageBubble({ message }: { message: AgentMessage }) {
  if (message.role === 'tool_use') {
    return (
      <details className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs">
        <summary className="cursor-pointer font-mono uppercase tracking-wider text-amber-800 dark:text-amber-300">
          Tool call · {message.tool_name}
        </summary>
        <pre className="mt-2 whitespace-pre-wrap break-words text-amber-900 dark:text-amber-200">
          {JSON.stringify(message.tool_input, null, 2)}
        </pre>
      </details>
    )
  }
  if (message.role === 'tool_result') {
    return (
      <details className="rounded-lg border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/30 p-3 text-xs">
        <summary className="cursor-pointer font-mono uppercase tracking-wider text-purple-800 dark:text-purple-300">
          Tool result · {message.tool_name}
        </summary>
        <pre className="mt-2 whitespace-pre-wrap break-words text-purple-900 dark:text-purple-200">
          {message.content}
        </pre>
      </details>
    )
  }

  const isAssistant = message.role === 'assistant'
  const isUser = message.role === 'user'
  if (!isAssistant && !isUser) return null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-navy text-white dark:bg-blue-dark'
            : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
        }`}
      >
        <div className="text-[10px] uppercase tracking-wider font-mono opacity-60 mb-1">
          {isUser ? 'Caller' : 'Claire'}
        </div>
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: AgentConversation['status'] }) {
  const tone =
    status === 'escalated'
      ? 'bg-red-500'
      : status === 'closed'
        ? 'bg-gray-400'
        : 'bg-emerald-500'
  return <span className={`w-2 h-2 rounded-full ${tone} flex-shrink-0`} aria-hidden />
}

function shortId(id: string): string {
  const stripped = id.replace(/-/g, '').toUpperCase()
  return `${stripped.slice(0, 3)} ${stripped.slice(3, 8)}`
}

function parseRecording(closedReason: string | null): string | null {
  if (!closedReason) return null
  const match = closedReason.match(/recording:(https?:\/\/[^|\s]+)/)
  return match ? match[1] : null
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime()
  const diff = Date.now() - t
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  const d = new Date(iso)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}
