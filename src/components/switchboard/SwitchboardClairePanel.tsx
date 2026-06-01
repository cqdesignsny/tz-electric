'use client'
/**
 * Persistent Claire panel — the right column of the agentic-style
 * Switchboard layout. Owner + admin only.
 *
 * Desktop (lg ≥ 1024px): **always open**, no toggle. Renders as a
 * fixed-positioned right column. DashboardShell adds matching
 * `lg:pr-[…]` to the main row so the content area doesn't sit
 * underneath the panel — true 3-column layout (left nav, content,
 * right Claire). Panel width:
 *   - lg (1024-1279px): 320px
 *   - xl (1280-1535px): 380px
 *   - 2xl (1536+):      420px
 *
 * Mobile (<lg): floating circular Claire button bottom-right. Tap
 * opens a full-screen modal with the same chat thread.
 *
 * State persistence (so the panel feels continuous across page nav
 * AND between viewport sizes):
 * - conversationId in sessionStorage (per-tab thread)
 * - visible messages in localStorage keyed by conversationId
 *
 * Mounted inside DashboardShell so it survives in-app navigation
 * without unmounting (React state stays alive between page renders).
 * Backend is /api/agents/admin-chat/stream. Claire does NOT receive
 * the user's current Switchboard URL — three rounds of "tell her what
 * page the user is on" all backfired (hallucinated other pages,
 * mirrored stale assistant turns when the user navigated mid-thread).
 * Per Cesar 2026-05-27 ~9:30 PM, she now answers generically about
 * her capabilities and asks the user to name specific records when
 * they reference "this X". Cleaner contract.
 */
import {
  useCallback,
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

const CONVERSATION_KEY = 'tz-claire-panel-conversation-id'
const messagesKeyFor = (id: string) => `tz-claire-panel-messages:${id}`
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Props = {
  /** Desktop (lg+) column open/closed. Controlled by DashboardShell so it can
   *  drop the matching content gutter when collapsed. Mobile (<lg) keeps its
   *  own bubble/modal state below and is unaffected. */
  open: boolean
  onOpenChange: (open: boolean) => void
  actorName: string | null
  actorEmail: string
  actorRole: 'owner' | 'admin'
}

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

export default function SwitchboardClairePanel({ open, onOpenChange, actorName, actorEmail, actorRole }: Props) {
  const [conversationId, setConversationId] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const firstName = actorName?.split(' ')[0] || actorEmail.split('@')[0]

  // Hydrate the conversation id on mount.
  useEffect(() => {
    setConversationId(readOrCreateConversationId())
  }, [])

  const transport = useMemo(() => {
    if (!conversationId) return null
    return new DefaultChatTransport({
      api: '/api/agents/admin-chat/stream',
      body: () => ({ conversationId }),
    })
  }, [conversationId])

  // Hydrate visible messages from localStorage.
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | undefined>(undefined)
  useEffect(() => {
    if (!conversationId) return
    try {
      const stored = window.localStorage.getItem(messagesKeyFor(conversationId))
      if (stored) {
        const parsed = JSON.parse(stored) as UIMessage[]
        if (Array.isArray(parsed)) {
          setInitialMessages(parsed)
          return
        }
      }
    } catch {
      // ignore
    }
    setInitialMessages([])
  }, [conversationId])

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: transport ?? undefined,
    id: conversationId,
    messages: initialMessages,
  })

  // Persist visible messages on every change.
  useEffect(() => {
    if (!conversationId) return
    if (initialMessages === undefined) return
    try {
      window.localStorage.setItem(messagesKeyFor(conversationId), JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages, conversationId, initialMessages])

  const isStreaming = status === 'submitted' || status === 'streaming'

  const startOver = useCallback(() => {
    const fresh = generateConversationId()
    try {
      window.sessionStorage.setItem(CONVERSATION_KEY, fresh)
      if (conversationId) {
        window.localStorage.removeItem(messagesKeyFor(conversationId))
      }
    } catch {
      // ignore
    }
    setConversationId(fresh)
    setInitialMessages([])
    setMessages([])
    setDraft('')
  }, [conversationId, setMessages])

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      if (!conversationId) return
      sendMessage({ text: trimmed })
      setDraft('')
    },
    [conversationId, sendMessage],
  )

  // Don't render anything until we have a conversation id — prevents
  // server / client hydration mismatch flicker.
  if (!conversationId) return null

  // Render both wrappers (desktop inline + mobile bubble/modal). CSS
  // hides whichever doesn't match the viewport. The chat state lives at
  // this outer component so it stays consistent across re-renders even
  // if the viewport changes mid-conversation.
  return (
    <>
      {/* DESKTOP — collapsible inline column (lg+). Always mounted so the chat
          thread survives collapse/expand; slides off-screen to the right when
          closed and DashboardShell drops the matching content gutter. */}
      <aside
        aria-label="Claire chat"
        aria-hidden={!open}
        inert={!open}
        className={`hidden lg:flex fixed right-0 top-16 bottom-0 z-30 flex-col bg-white dark:bg-[#0A1128] border-l border-gray-200 dark:border-navy-light/40 shadow-lg
                   lg:w-[320px] xl:w-[380px] 2xl:w-[420px]
                   transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <ChatBody
          firstName={firstName}
          actorRole={actorRole}
          messages={messages}
          isStreaming={isStreaming}
          error={error?.message ?? null}
          draft={draft}
          setDraft={setDraft}
          submit={submit}
          startOver={startOver}
          mode="inline"
          onHide={() => onOpenChange(false)}
        />
      </aside>

      {/* DESKTOP LAUNCHER (lg+, when collapsed) — a tab on the right edge that
          slides the panel back open. Hidden + inert while the panel is open. */}
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        aria-label="Open Claire chat"
        aria-hidden={open}
        inert={open}
        className={`hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-2 rounded-l-xl bg-blue dark:bg-blue-light text-white dark:text-navy shadow-lg px-2.5 py-3 hover:bg-blue-dark dark:hover:bg-blue transition ${open ? 'translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100'}`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
          Claire
        </span>
      </button>

      {/* MOBILE BUBBLE (<lg) */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open Claire chat"
          className="lg:hidden fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full bg-blue dark:bg-blue-light text-white dark:text-navy shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* MOBILE FULL-SCREEN MODAL (<lg, when open) */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-[#0A1128] flex flex-col">
            <ChatBody
              firstName={firstName}
              actorRole={actorRole}
              messages={messages}
              isStreaming={isStreaming}
              error={error?.message ?? null}
              draft={draft}
              setDraft={setDraft}
              submit={submit}
              startOver={startOver}
              mode="modal"
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}
    </>
  )
}

// =============================================================================
// Shared chat body (renders inside both inline aside + mobile modal)
// =============================================================================

type ChatBodyProps = {
  firstName: string
  actorRole: 'owner' | 'admin'
  messages: UIMessage[]
  isStreaming: boolean
  error: string | null
  draft: string
  setDraft: (v: string) => void
  submit: (text: string) => void
  startOver: () => void
  mode: 'inline' | 'modal'
  onClose?: () => void
  onHide?: () => void
}

function ChatBody(props: ChatBodyProps) {
  const {
    firstName,
    actorRole,
    messages,
    isStreaming,
    error,
    draft,
    setDraft,
    submit,
    startOver,
    mode,
    onClose,
    onHide,
  } = props
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const composerRef = useRef<HTMLTextAreaElement | null>(null)
  const lastScrollTopRef = useRef(0)
  const userScrolledUpRef = useRef(false)

  // Smart auto-scroll (per-instance — inline and modal each have their
  // own scroll position, which is fine since only one is visible at a
  // time).
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
  }, [messages, isStreaming])

  // Focus the composer when the modal opens.
  useEffect(() => {
    if (mode !== 'modal') return
    const t = setTimeout(() => composerRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [mode])

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

  return (
    <>
      <header className="border-b border-gray-200 dark:border-navy-light/40 px-4 py-3 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wider font-mono text-blue dark:text-blue-light/80">
            Claire · admin · Opus 4.7
          </div>
          <h2 className="text-sm font-bold text-navy dark:text-white mt-0.5 truncate">
            Hey {firstName}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={startOver}
            className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Start over (new conversation)"
          >
            New
          </button>
          {mode === 'inline' && onHide && (
            <button
              type="button"
              onClick={onHide}
              aria-label="Hide Claire panel"
              title="Hide panel"
              className="touch-manipulation w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center justify-center"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>
          )}
          {mode === 'modal' && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Claire chat"
              className="w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center justify-center"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {messages.length === 0 && (
          <div className="text-center pt-6 pb-3 px-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              I can help across the whole Switchboard. Ask me about the
              knowledge base, my daily learning reports, recent calls and
              chats, or anything else you want to work on.
            </p>
            <div className="flex flex-col gap-1.5 max-w-full">
              <PanelChip
                label="What can you do?"
                onSubmit={submit}
                prompt="What can you do for me? Give me the list."
              />
              <PanelChip
                label="Yesterday&apos;s report"
                onSubmit={submit}
                prompt="Show me yesterday's daily learning report. Summarize the key failure patterns and proposed prompt rules."
              />
              <PanelChip
                label="KB gaps this week"
                onSubmit={submit}
                prompt="Look at the daily reports from the last 7 days. What KB gaps came up most often and what would you propose adding?"
              />
            </div>
          </div>
        )}

        {messages.map((m) => (
          <PanelMessage key={m.id} message={m} />
        ))}

        {isStreaming && (
          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue dark:bg-blue-light animate-pulse" />
            Claire is thinking...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-[11px] text-red-800 dark:text-red-300">
            <div className="font-bold mb-1">Something went wrong</div>
            <code className="font-mono">{error}</code>
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="border-t border-gray-200 dark:border-navy-light/40 p-3 bg-gray-50 dark:bg-[#0A1128] flex-shrink-0"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={composerRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask Claire..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue dark:focus:ring-blue-light disabled:opacity-50"
            style={{ minHeight: '38px', maxHeight: '160px', fontSize: 'max(16px, 0.95rem)' }}
          />
          <button
            type="submit"
            disabled={!draft.trim() || isStreaming}
            className="px-3 py-2 rounded-lg bg-blue dark:bg-blue-light text-white dark:text-navy text-sm font-semibold hover:bg-blue-dark dark:hover:bg-blue transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div className="mt-1.5 text-[9px] uppercase tracking-wider font-mono text-gray-400 dark:text-gray-500 flex items-center justify-between">
          <span>Enter to send · Shift+Enter newline</span>
          <span>{actorRole}</span>
        </div>
      </form>
    </>
  )
}

function PanelChip({
  label,
  prompt,
  onSubmit,
}: {
  label: string
  prompt: string
  onSubmit: (text: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSubmit(prompt)}
      className="text-left text-xs px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:bg-blue/5 dark:hover:bg-blue-light/10 hover:border-blue/30 dark:hover:border-blue-light/30 transition-colors"
    >
      {label}
    </button>
  )
}

function PanelMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const parts = Array.isArray(message.parts) ? message.parts : []

  if (isUser) {
    const text = uiMessageText(message)
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed bg-navy text-white dark:bg-blue-dark">
          <div className="whitespace-pre-wrap break-words">{text}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] space-y-1.5 w-full">
        {parts.map((p, i) => {
          if (isTextUIPart(p)) {
            const text = p.text || ''
            if (!text.trim()) return null
            return (
              <div
                key={`text-${i}`}
                className="rounded-2xl px-3 py-2 text-xs leading-relaxed bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              >
                <div className="whitespace-pre-wrap break-words">{text}</div>
              </div>
            )
          }
          const partType: string = (p as { type?: string }).type || ''
          if (partType.startsWith('tool-')) {
            const toolName = partType.replace(/^tool-/, '')
            const tp = p as {
              type: string
              state?: string
              input?: unknown
              output?: unknown
              errorText?: string
            }
            const stateLabel =
              tp.state === 'output-available' || tp.state === 'output-streaming'
                ? 'done'
                : tp.state === 'input-streaming' || tp.state === 'input-available'
                  ? 'running'
                  : tp.state || ''
            return (
              <details
                key={`tool-${i}`}
                className="rounded-md border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 px-2 py-1.5 text-[10px]"
              >
                <summary className="cursor-pointer font-mono uppercase tracking-wider text-amber-800 dark:text-amber-300">
                  Tool · {toolName}{' '}
                  <span className="opacity-60">{stateLabel ? `(${stateLabel})` : ''}</span>
                </summary>
                {tp.output !== undefined && (
                  <pre className="mt-1.5 whitespace-pre-wrap break-words text-amber-900 dark:text-amber-200 text-[10px] max-h-48 overflow-y-auto">
                    {typeof tp.output === 'string'
                      ? tp.output
                      : JSON.stringify(tp.output, null, 2)}
                  </pre>
                )}
                {tp.errorText && (
                  <div className="mt-1 text-red-700 dark:text-red-400">{tp.errorText}</div>
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
