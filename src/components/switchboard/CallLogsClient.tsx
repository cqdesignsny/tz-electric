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
 * - "Mark for review": a per-call flag (⚑) so office staff can mark a
 *   call where Claire slipped up. Flagged calls badge in the list, get
 *   their own "marked" filter, and an optional note in the detail pane.
 *   A focused review pass later pulls only the flagged set.
 */
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'

import type { AgentConversation, AgentMessage } from '@/lib/agent-conversations'

export type CallLogsClientProps = {
  conversations: AgentConversation[]
  activeId: string | null
  active: AgentConversation | null
  messages: AgentMessage[]
  /** conversationId → review mark (presence = flagged for review). */
  reviewMarks: Record<string, { note: string | null }>
}

type SetMark = (conversationId: string, marked: boolean, note: string | null) => void

export default function CallLogsClient(props: CallLogsClientProps) {
  const { conversations, activeId, active, messages, reviewMarks } = props
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'escalated' | 'marked'>('all')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (filter === 'marked') return conversations.filter((c) => reviewMarks[c.id])
    if (filter === 'all') return conversations
    return conversations.filter((c) => c.status === filter)
  }, [conversations, filter, reviewMarks])

  const setMark: SetMark = (conversationId, marked, note) => {
    setError(null)
    setBusyId(conversationId)
    startTransition(async () => {
      try {
        const res = await fetch('/api/switchboard/call-logs/review-mark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, marked, note }),
        })
        if (!res.ok) {
          const b = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(b.error || `Failed (${res.status})`)
        }
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setBusyId(null)
      }
    })
  }

  // Master-detail pattern for mobile (fix to 2026-05-27 PM Tyler feedback —
  // on phone/iPad, the threadlist + activepane stack vertically so the
  // transcript and audio player were buried below 50 thread rows. On
  // mobile we now show one or the other based on activeId; desktop still
  // shows both side by side.
  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-2.5 text-xs text-danger dark:text-red-300"
        >
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:gap-6">
        {/* Thread list — hidden on mobile when a call is selected */}
        <aside
          className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden ${
            activeId ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-800">
            {(['all', 'open', 'closed', 'escalated', 'marked'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${
                  filter === f
                    ? f === 'marked'
                      ? 'bg-amber-500 text-white dark:bg-amber-500 dark:text-navy'
                      : 'bg-blue text-white dark:bg-blue-light dark:text-navy'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {f === 'marked' ? '⚑' : f}
              </button>
            ))}
          </div>
          <ul className="max-h-[calc(100dvh-260px)] lg:max-h-[70vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.length === 0 && (
              <li className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                {filter === 'marked' ? 'No calls flagged for review.' : 'No calls yet.'}
              </li>
            )}
            {filtered.map((c) => {
              const isActive = c.id === activeId
              const label = c.customer_name || c.customer_phone || shortId(c.id)
              const recordingUrl = parseRecording(c.closed_reason)
              const marked = !!reviewMarks[c.id]
              return (
                <li
                  key={c.id}
                  className={`flex items-stretch ${isActive ? 'bg-blue/5 dark:bg-blue-light/10' : ''}`}
                >
                  <Link
                    href={`/switchboard/call-logs?id=${encodeURIComponent(c.id)}`}
                    className="flex-1 min-w-0 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <StatusDot status={c.status} />
                      <span className="font-semibold text-sm text-navy dark:text-white truncate min-w-0">
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
                  {/* Quick "mark for review" toggle on the side of every row.
                      Amber + filled flag = flagged. */}
                  <button
                    type="button"
                    onClick={() => setMark(c.id, !marked, null)}
                    disabled={busyId === c.id}
                    aria-pressed={marked}
                    title={marked ? 'Flagged for review — click to clear' : 'Mark this call for review'}
                    className={`shrink-0 w-10 flex items-center justify-center border-l transition-colors disabled:opacity-50 ${
                      marked
                        ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                        : 'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                    }`}
                  >
                    <FlagIcon filled={marked} />
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Active conversation pane — hidden on mobile when no call selected.
            Height is viewport-bounded (dvh on mobile to handle iOS URL bar)
            so the inner flex-1 transcript actually gets a height to scroll
            within. */}
        <section
          className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden flex-col h-[calc(100dvh-220px)] min-h-[360px] lg:h-[calc(100vh-260px)] lg:min-h-[500px] ${
            !activeId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {!active ? (
            <div className="flex-1 grid place-items-center text-sm text-gray-500 dark:text-gray-400 p-10 text-center">
              Pick a call from the list to view its transcript.
            </div>
          ) : (
            <ActiveCallPane
              active={active}
              messages={messages}
              marked={!!reviewMarks[active.id]}
              note={reviewMarks[active.id]?.note ?? null}
              busy={busyId === active.id}
              onSetMark={setMark}
            />
          )}
        </section>
      </div>
    </>
  )
}

function ActiveCallPane({
  active,
  messages,
  marked,
  note,
  busy,
  onSetMark,
}: {
  active: AgentConversation
  messages: AgentMessage[]
  marked: boolean
  note: string | null
  busy: boolean
  onSetMark: SetMark
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
        <div className="flex items-start justify-between gap-3">
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
              className="flex-shrink-0 text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            >
              Lead captured →
            </Link>
          )}
        </div>

        <div className="mt-3">
          <ReviewMarker
            conversationId={active.id}
            marked={marked}
            note={note}
            busy={busy}
            onSetMark={onSetMark}
          />
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

/** Mark-for-review control in the call detail pane: toggle + optional note. */
function ReviewMarker({
  conversationId,
  marked,
  note,
  busy,
  onSetMark,
}: {
  conversationId: string
  marked: boolean
  note: string | null
  busy: boolean
  onSetMark: SetMark
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  if (!marked) {
    return (
      <button
        type="button"
        onClick={() => onSetMark(conversationId, true, null)}
        disabled={busy}
        className="touch-manipulation inline-flex items-center gap-1.5 rounded-md border border-amber-300 dark:border-amber-700/60 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer transition-colors disabled:opacity-50"
      >
        <FlagIcon filled={false} />
        Mark for review
      </button>
    )
  }

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
          <FlagIcon filled />
          Flagged for review
        </span>
        <button
          type="button"
          onClick={() => {
            setDraft(note ?? '')
            setEditing((v) => !v)
          }}
          className="touch-manipulation text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
        >
          {note ? 'Edit note' : 'Add note'}
        </button>
        <button
          type="button"
          onClick={() => onSetMark(conversationId, false, null)}
          disabled={busy}
          className="touch-manipulation ml-auto text-xs text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer disabled:opacity-50"
        >
          Unmark
        </button>
      </div>

      {note && !editing && (
        <div className="mt-2 text-xs italic text-amber-900/80 dark:text-amber-200/80">
          &ldquo;{note}&rdquo;
        </div>
      )}

      {editing && (
        <div className="mt-2 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            maxLength={1000}
            autoFocus
            placeholder="What went wrong? (optional — helps the review)"
            style={{ fontSize: '16px' }}
            className="w-full resize-none rounded-md border border-amber-300 dark:border-amber-800 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-sm text-navy dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="touch-manipulation text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-navy dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onSetMark(conversationId, true, draft.trim() || null)
                setEditing(false)
              }}
              className="touch-manipulation rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 cursor-pointer transition-colors disabled:opacity-50"
            >
              Save note
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function FlagIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
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
