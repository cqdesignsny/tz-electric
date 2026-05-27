'use client'
/**
 * Admin Claire chat — the in-Switchboard chat at /switchboard/agent-training.
 * Tyler / Terry / Cesar talk to Claire conversationally to read + edit
 * the KB, browse her daily self-improvement reports, search recent
 * conversations.
 *
 * Auth happens server-side at /api/agents/admin-chat/stream — this
 * component just streams text and renders the transcript + tool calls.
 */
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isTextUIPart, type UIMessage } from 'ai'

const CONVERSATION_KEY = 'tz-claire-admin-conversation-id'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const CHIPS: Array<{ id: string; label: string; prompt: string }> = [
  {
    id: 'yesterday',
    label: "Yesterday's report",
    prompt:
      "Show me yesterday's daily learning report. Summarize the key failure patterns and the proposed prompt rules.",
  },
  {
    id: 'gaps',
    label: 'KB gaps this week',
    prompt:
      'Look at the daily reports from the last 7 days. What KB gaps came up most often and what would you propose adding?',
  },
  {
    id: 'sections',
    label: 'KB section list',
    prompt: 'List all knowledge base sections with which ones have Tyler overrides applied.',
  },
  {
    id: 'fee',
    label: 'After-hours fee policy',
    prompt:
      "Pull up the after-hours dispatch fee section so I can review the current wording.",
  },
  {
    id: 'transfer',
    label: 'Transfer-request behavior',
    prompt:
      "Show me the section in the voice prompt about handling transfer requests. I want to review what we tell Claire to say.",
  },
]

function generateConversationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function readOrCreateConversationId(): string {
  if (typeof window === 'undefined') return ''
  try {
    const stored = window.sessionStorage.getItem(CONVERSATION_KEY)
    if (stored && UUID_RE.test(stored)) return stored
  } catch {
    // ignore
  }
  const fresh = generateConversationId()
  try {
    window.sessionStorage.setItem(CONVERSATION_KEY, fresh)
  } catch {
    // ignore
  }
  return fresh
}

function uiMessageText(m: UIMessage): string {
  if (!Array.isArray(m.parts)) return ''
  return m.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join('')
    .trim()
}

type Props = {
  actorName: string | null
  actorEmail: string
  actorRole: 'owner' | 'admin'
}

export default function AdminClaireChat({ actorName, actorEmail, actorRole }: Props) {
  const [conversationId, setConversationId] = useState('')
  const [draft, setDraft] = useState('')
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setConversationId(readOrCreateConversationId())
  }, [])

  const transport = useMemo(() => {
    if (!conversationId) return null
    return new DefaultChatTransport({
      api: '/api/agents/admin-chat/stream',
      body: { conversationId },
    })
  }, [conversationId])

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: transport ?? undefined,
    id: conversationId,
  })

  const isStreaming = status === 'submitted' || status === 'streaming'

  // Smart auto-scroll: keep latest visible, but don't yank if user scrolled up.
  const lastScrollTopRef = useRef(0)
  const userScrolledUpRef = useRef(false)
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      const dy = el.scrollTop - lastScrollTopRef.current
      lastScrollTopRef.current = el.scrollTop
      if (dy < 0) userScrolledUpRef.current = true
      const nearBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 80
      if (nearBottom) userScrolledUpRef.current = false
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])
  useLayoutEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    if (userScrolledUpRef.current) return
    el.scrollTop = el.scrollHeight
  }, [messages, status])

  function startOver() {
    const fresh = generateConversationId()
    try {
      window.sessionStorage.setItem(CONVERSATION_KEY, fresh)
    } catch {
      // ignore
    }
    setConversationId(fresh)
    setMessages([])
    setDraft('')
    composerRef.current?.focus()
  }

  function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    if (!conversationId) return
    sendMessage({ text: trimmed })
    setDraft('')
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isStreaming) return
    submit(draft)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(draft)
    }
  }

  const firstName = actorName?.split(' ')[0] || actorEmail.split('@')[0]

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
      <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider font-mono text-blue dark:text-blue-light/80">
            Claire · admin mode · Opus 4.7
          </div>
          <h2 className="text-base font-bold text-navy dark:text-white mt-0.5">
            Signed in as {firstName} ({actorRole})
          </h2>
        </div>
        <button
          type="button"
          onClick={startOver}
          className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Start over
        </button>
      </header>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="text-xs uppercase tracking-[0.2em] text-blue dark:text-blue-light/80 font-mono mb-2">
              Hey {firstName}
            </div>
            <h3 className="text-xl font-bold text-navy dark:text-white mb-2">
              What do you want to look at?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
              I can read the knowledge base, propose and apply edits with your
              approval, browse my daily learning reports, and look up specific
              calls. Ask me anything.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => submit(chip.prompt)}
                  className="text-xs font-mono uppercase tracking-wider px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:bg-blue/5 dark:hover:bg-blue-light/10 hover:border-blue/30 dark:hover:border-blue-light/30 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <MessageView key={m.id} message={m} />
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue dark:bg-blue-light animate-pulse" />
            Claire is thinking...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-800 dark:text-red-300">
            <div className="font-bold mb-1">Something went wrong</div>
            <code className="font-mono">{error.message}</code>
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-900/40"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={composerRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Ask Claire... (e.g. "What did you learn yesterday?" or "Show me section 1.2")`}
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue dark:focus:ring-blue-light disabled:opacity-50"
            style={{ minHeight: '40px', maxHeight: '180px', fontSize: 'max(16px, 1rem)' }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isStreaming}
            className="px-4 py-2 rounded-lg bg-blue dark:bg-blue-light text-white dark:text-navy text-sm font-semibold hover:bg-blue-dark dark:hover:bg-blue transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div className="mt-2 text-[10px] uppercase tracking-wider font-mono text-gray-400 dark:text-gray-500">
          Enter to send · Shift+Enter for newline · KB edits require your approval
        </div>
      </form>
    </div>
  )
}

function MessageView({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  // Tool-related parts vs. text parts. AI SDK v6 includes tool steps
  // inline in `parts`. We render any text first, then tool blocks.
  const parts = Array.isArray(message.parts) ? message.parts : []

  if (isUser) {
    const text = uiMessageText(message)
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-navy text-white dark:bg-blue-dark">
          <div className="text-[10px] uppercase tracking-wider font-mono opacity-60 mb-1">You</div>
          <div className="whitespace-pre-wrap break-words">{text}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] space-y-2">
        {parts.map((p, i) => {
          // text part
          if (isTextUIPart(p)) {
            const text = p.text || ''
            if (!text.trim()) return null
            return (
              <div
                key={`text-${i}`}
                className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              >
                <div className="text-[10px] uppercase tracking-wider font-mono opacity-60 mb-1">
                  Claire
                </div>
                <div className="whitespace-pre-wrap break-words">{text}</div>
              </div>
            )
          }
          // tool-call part (renders both input and output)
          const partType: string = (p as { type?: string }).type || ''
          if (partType.startsWith('tool-')) {
            const toolName = partType.replace(/^tool-/, '')
            const tp = p as {
              type: string
              toolCallId?: string
              state?: string
              input?: unknown
              output?: unknown
              errorText?: string
            }
            const stateLabel =
              tp.state === 'output-available' || tp.state === 'output-streaming'
                ? 'completed'
                : tp.state === 'input-streaming' || tp.state === 'input-available'
                  ? 'running'
                  : tp.state || 'pending'
            return (
              <details
                key={`tool-${i}`}
                className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs"
              >
                <summary className="cursor-pointer font-mono uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Tool: {toolName} <span className="opacity-60">· {stateLabel}</span>
                </summary>
                {tp.input !== undefined && (
                  <div className="mt-2">
                    <div className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                      Input
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-amber-900 dark:text-amber-200 text-[11px]">
                      {JSON.stringify(tp.input, null, 2)}
                    </pre>
                  </div>
                )}
                {tp.output !== undefined && (
                  <div className="mt-2">
                    <div className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                      Output
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-amber-900 dark:text-amber-200 text-[11px]">
                      {typeof tp.output === 'string' ? tp.output : JSON.stringify(tp.output, null, 2)}
                    </pre>
                  </div>
                )}
                {tp.errorText && (
                  <div className="mt-2 text-red-700 dark:text-red-400">{tp.errorText}</div>
                )}
              </details>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}
