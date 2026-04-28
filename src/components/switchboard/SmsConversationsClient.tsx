'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type {
  AgentConversation,
  AgentMessage,
} from '@/lib/agent-conversations'

type Props = {
  conversations: AgentConversation[]
  activeId: string | null
  active: AgentConversation | null
  messages: AgentMessage[]
}

export default function SmsConversationsClient({
  conversations,
  activeId,
  active,
  messages,
}: Props) {
  const [composeText, setComposeText] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function refreshAfter(action: () => Promise<void>) {
    setActionError(null)
    startTransition(async () => {
      try {
        await action()
        router.refresh()
      } catch (e) {
        setActionError(e instanceof Error ? e.message : String(e))
      }
    })
  }

  async function postAction(payload: Record<string, unknown>) {
    const res = await fetch('/api/agents/sms/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error || `Action failed (${res.status})`)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4">
      <ConversationList conversations={conversations} activeId={activeId} />

      {active ? (
        <div className="rounded-2xl border border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0F1C3F] overflow-hidden flex flex-col min-h-[600px]">
          <ConversationHeader
            active={active}
            isPending={isPending}
            onTakeover={() =>
              refreshAfter(() =>
                postAction({ action: 'takeover', conversationId: active.id }),
              )
            }
            onRelease={() =>
              refreshAfter(() =>
                postAction({ action: 'release', conversationId: active.id }),
              )
            }
            onClose={() =>
              refreshAfter(() =>
                postAction({
                  action: 'close',
                  conversationId: active.id,
                  reason: 'office_resolved',
                }),
              )
            }
          />

          {actionError && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 text-xs text-red-800 dark:text-red-300">
              {actionError}
            </div>
          )}

          <MessageTimeline messages={messages} active={active} />

          <ComposeBox
            disabled={isPending || !active.takeover_by_user}
            placeholder={
              active.takeover_by_user
                ? 'Type your reply as office staff...'
                : 'Take over this conversation to respond as office.'
            }
            value={composeText}
            onChange={setComposeText}
            onSend={() => {
              if (!composeText.trim()) return
              const text = composeText.trim()
              setComposeText('')
              refreshAfter(() =>
                postAction({
                  action: 'office_reply',
                  conversationId: active.id,
                  content: text,
                }),
              )
            }}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-navy-light/50 p-10 text-center text-sm text-gray-500 dark:text-gray-400 min-h-[600px] flex items-center justify-center">
          {conversations.length === 0
            ? 'No SMS conversations yet. Once Twilio is wired up, inbound texts will appear here.'
            : 'Pick a conversation from the list to view its messages.'}
        </div>
      )}
    </div>
  )
}

function ConversationList({
  conversations,
  activeId,
}: {
  conversations: AgentConversation[]
  activeId: string | null
}) {
  if (conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-navy-light/50 p-6 text-center text-xs text-gray-500 dark:text-gray-400">
        No conversations yet.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0F1C3F] overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-navy-light/40 text-[10px] uppercase tracking-wider font-bold text-blue dark:text-blue-light/80">
        Threads · {conversations.length}
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-navy-light/40 max-h-[640px] overflow-auto">
        {conversations.map((c) => (
          <li key={c.id}>
            <Link
              href={`/switchboard/sms-conversations?id=${encodeURIComponent(c.id)}`}
              className={[
                'block px-4 py-3 text-sm transition-colors',
                c.id === activeId
                  ? 'bg-blue/5 dark:bg-blue-light/10 border-l-4 border-blue'
                  : 'hover:bg-gray-50 dark:hover:bg-navy-light/20 border-l-4 border-transparent',
              ].join(' ')}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-navy dark:text-white truncate">
                  {c.customer_name || formatPhone(c.customer_phone)}
                </span>
                <StatusDot status={c.status} takeover={!!c.takeover_by_user} />
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                {c.customer_phone ? formatPhone(c.customer_phone) : '—'} ·{' '}
                {relativeTime(c.updated_at)}
              </div>
              {c.takeover_by_user && (
                <div className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300 mt-1">
                  Office responding ({c.takeover_by_user})
                </div>
              )}
              {c.status === 'escalated' && (
                <div className="text-[10px] uppercase tracking-wider font-bold text-red-700 dark:text-red-300 mt-1">
                  Escalated
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ConversationHeader({
  active,
  isPending,
  onTakeover,
  onRelease,
  onClose,
}: {
  active: AgentConversation
  isPending: boolean
  onTakeover: () => void
  onRelease: () => void
  onClose: () => void
}) {
  return (
    <div className="px-4 py-3 border-b border-gray-100 dark:border-navy-light/40 flex items-center justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <div className="font-bold text-navy dark:text-white truncate">
          {active.customer_name || formatPhone(active.customer_phone)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {active.customer_phone ? formatPhone(active.customer_phone) : 'No phone'} ·{' '}
          status: {active.status}
          {active.takeover_by_user && (
            <span className="ml-2 text-amber-700 dark:text-amber-300">
              Office responding
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {active.takeover_by_user ? (
          <button
            type="button"
            onClick={onRelease}
            disabled={isPending}
            className="rounded-full bg-blue px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-dark disabled:opacity-50"
          >
            Release to Claire
          </button>
        ) : (
          <button
            type="button"
            onClick={onTakeover}
            disabled={isPending || active.status !== 'open'}
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            Take over
          </button>
        )}
        {active.status === 'open' && (
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-full border border-gray-300 dark:border-navy-light/60 px-4 py-1.5 text-xs font-semibold text-navy dark:text-white hover:border-blue disabled:opacity-50"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}

function MessageTimeline({
  messages,
  active,
}: {
  messages: AgentMessage[]
  active: AgentConversation
}) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 px-6 py-12 text-center">
        No messages yet. When the customer texts {formatPhone(active.customer_phone)},
        their message appears here and Claire replies (or the office, if takeover is on).
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto px-4 py-4 space-y-3 bg-gray-50 dark:bg-[#0A1128]">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  )
}

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user'
  const isOffice = message.role === 'office'
  const isAssistant = message.role === 'assistant'
  const isToolUse = message.role === 'tool_use'
  const isToolResult = message.role === 'tool_result'

  if (isToolUse || isToolResult) {
    return (
      <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 px-2">
        <span className="uppercase tracking-wider font-bold">{message.role}</span>
        {message.tool_name ? `: ${message.tool_name}` : ''} ·{' '}
        {relativeTime(message.created_at)}
      </div>
    )
  }

  const align = isUser ? 'items-start' : 'items-end'
  const bubble = isUser
    ? 'bg-white dark:bg-navy-light/40 text-navy dark:text-white border border-gray-200 dark:border-navy-light/60'
    : isOffice
      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-800'
      : 'bg-blue text-white'

  return (
    <div className={`flex flex-col ${align}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${bubble} whitespace-pre-wrap`}>
        {message.content}
      </div>
      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 px-1">
        {isUser
          ? 'Customer'
          : isOffice
            ? `Office${message.authored_by ? ` · ${message.authored_by}` : ''}`
            : isAssistant
              ? 'Claire'
              : message.role}
        {' · '}
        {relativeTime(message.created_at)}
      </div>
    </div>
  )
}

function ComposeBox({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled: boolean
  placeholder: string
}) {
  return (
    <div className="px-4 py-3 border-t border-gray-100 dark:border-navy-light/40 flex items-end gap-2 bg-white dark:bg-[#0F1C3F]">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder={placeholder}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            onSend()
          }
        }}
        className="flex-1 rounded-xl border border-gray-300 dark:border-navy-light/60 bg-white dark:bg-[#0A1128] px-3 py-2 text-sm text-navy dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className="rounded-full bg-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </div>
  )
}

function StatusDot({
  status,
  takeover,
}: {
  status: AgentConversation['status']
  takeover: boolean
}) {
  const tone = takeover
    ? 'bg-amber-500'
    : status === 'escalated'
      ? 'bg-red-500'
      : status === 'closed'
        ? 'bg-gray-400'
        : 'bg-emerald-500'
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${tone}`} aria-hidden />
}

function formatPhone(phone: string | null): string {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 10) return phone
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = now - then
  const sec = Math.round(diffMs / 1000)
  const min = Math.round(sec / 60)
  const hr = Math.round(min / 60)
  const day = Math.round(hr / 24)

  if (sec < 45) return 'just now'
  if (min < 60) return `${min}m ago`
  if (hr < 24) return `${hr}h ago`
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
