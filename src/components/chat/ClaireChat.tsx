'use client'

import Image from 'next/image'
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

import ChatThemeToggle from './ChatThemeToggle'
import { ChatThemeProvider } from './ChatThemeProvider'

const CLAIRE_PIC = '/images/agents/claire-profile.png'

const CONVERSATION_KEY = 'tz-claire-conversation-id'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const CHIPS: Array<{ id: string; label: string; prompt: string }> = [
  { id: 'mini-split', label: 'Mini-split install', prompt: "I'm thinking about a Mitsubishi mini-split for my home. Can you walk me through it?" },
  { id: 'ac', label: "AC isn't cooling", prompt: "My AC isn't cooling like it should. Can you help?" },
  { id: 'gen', label: 'New generator quote', prompt: "I'd like a quote on a new standby generator for my home." },
  { id: 'ev', label: 'EV charger install', prompt: 'I want to install an EV charger at my house.' },
  { id: 'panel', label: 'Panel upgrade', prompt: "I'm thinking about upgrading my electrical panel. Where do I start?" },
  { id: 'maintenance', label: 'Mini-split maintenance', prompt: 'I want to schedule a maintenance cleaning on my mini-split system.' },
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
    // ignore storage errors
  }
  const fresh = generateConversationId()
  try {
    window.sessionStorage.setItem(CONVERSATION_KEY, fresh)
  } catch {
    // ignore
  }
  return fresh
}

function captureAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const out: Record<string, string> = {}
  out.landingUrl = window.location.href
  if (document.referrer) out.referrer = document.referrer
  const params = new URLSearchParams(window.location.search)
  for (const key of [
    'gclid',
    'gbraid',
    'wbraid',
    'fbclid',
    'msclkid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ]) {
    const v = params.get(key)
    if (v) out[key] = v
  }
  return out
}

function uiMessageText(m: UIMessage): string {
  if (!Array.isArray(m.parts)) return ''
  return m.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join('\n')
}

export default function ClaireChat() {
  return (
    <ChatThemeProvider>
      <ClaireChatInner />
    </ChatThemeProvider>
  )
}

function ClaireChatInner() {
  // useChat captures the transport on first init and ignores later
  // useMemo updates. Stash the conversationId + attribution in refs so
  // prepareSendMessagesRequest reads the latest values on every send,
  // not whatever was in scope at first render.
  const conversationIdRef = useRef<string>('')
  const attributionRef = useRef<Record<string, string>>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    conversationIdRef.current = readOrCreateConversationId()
    attributionRef.current = captureAttribution()
    setHydrated(true)
  }, [])

  // No visualViewport gymnastics. The composer is position:fixed at the
  // viewport bottom (see render below); iOS keeps fixed elements with
  // focused inputs above the keyboard automatically. The page scrolls
  // naturally behind the fixed composer.

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: '/api/agents/web-chat/stream',
      prepareSendMessagesRequest: ({ messages, body }) => ({
        body: {
          ...(body ?? {}),
          messages,
          conversationId: conversationIdRef.current,
          attribution: attributionRef.current,
        },
      }),
    })
    // Transport is stable for the life of the component; refs above
    // carry the up-to-date conversationId / attribution into each send.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { messages, sendMessage, status, error, setMessages, clearError } =
    useChat({ transport })

  function startOver() {
    // Mint a fresh conversation id so the office sees a clean new thread
    // instead of an extension of whatever came before. The old thread
    // stays in the DB for transcript history.
    const fresh = generateConversationId()
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(CONVERSATION_KEY, fresh)
      } catch {
        // ignore
      }
    }
    conversationIdRef.current = fresh
    setMessages([])
    setInput('')
    clearError?.()
  }

  const isThinking = status === 'submitted' || status === 'streaming'
  const showEmptyState = messages.length === 0 && !isThinking
  const canSend = hydrated && !isThinking

  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const threadRef = useRef<HTMLDivElement | null>(null)

  // Autoresize textarea up to ~6 rows.
  useLayoutEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 192)}px`
  }, [input])

  // Smart auto-scroll: keep the latest message in view by default, but
  // get out of the way if the visitor scrolled up to read older history.
  // We track user scroll direction (negative dy = scrolled up); a single
  // intentional scroll-up disables autoscroll until they scroll back to
  // within 100px of the bottom. Programmatic scrolls always move down, so
  // the dy < -20 threshold reliably distinguishes them from user scrolls.
  const hasUserScrolledUpRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let lastY = window.scrollY
    function onScroll() {
      const dy = window.scrollY - lastY
      lastY = window.scrollY
      if (dy < -20) {
        hasUserScrolledUpRef.current = true
        return
      }
      const distanceFromBottom =
        document.documentElement.scrollHeight -
        (window.innerHeight + window.scrollY)
      if (distanceFromBottom < 100) {
        hasUserScrolledUpRef.current = false
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (hasUserScrolledUpRef.current) return
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'auto',
    })
  }, [messages, isThinking])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || !canSend) return
    sendMessage({ text: trimmed })
    setInput('')
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    send(input)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter inserts a newline.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="bg-gray-50 text-charcoal dark:bg-[#070D1F] dark:text-gray-100">
      {/* Slim top strip with the theme toggle + start-over — thread view only.
          The empty state has its own centered toggle above the portrait. */}
      {!showEmptyState && (
        <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/85 backdrop-blur dark:border-white/5 dark:bg-[#0A1228]/85">
          <div className="mx-auto flex max-w-3xl items-center justify-end gap-3 px-4 py-2 sm:px-6">
            <button
              type="button"
              onClick={startOver}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-gray-50 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              aria-label="Start a new conversation"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
                aria-hidden
              >
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
              </svg>
              Start over
            </button>
            <ChatThemeToggle />
          </div>
        </div>
      )}

      {/* Body content scrolls naturally with the page. The fixed
          composer below sits on top, so we add bottom padding equal to
          its rough height to keep the last message readable. */}
      <div
        ref={threadRef}
        className="min-h-[calc(100dvh-110px)] pb-40 sm:pb-44"
      >
        {showEmptyState ? (
          <div className="px-4 pt-8 sm:px-6 sm:pt-12">
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
              <ChatThemeToggle />
              <div className="mt-6">
                <ClairePortrait size="hero" />
              </div>
              <h1 className="mt-6 font-heading text-3xl font-bold text-navy dark:text-white sm:text-4xl">
                Hi, I&apos;m Claire.
              </h1>
              <p className="mt-3 max-w-xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
                I&apos;m a smart assistant for TZ Electric. Ask me anything about your project. Cooling, heating, electrical, plumbing, generators, EV chargers. How can I help you today?
              </p>
            </div>

            <div className="mx-auto mt-8 grid w-full max-w-3xl gap-2 sm:grid-cols-2">
              {CHIPS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => send(c.prompt)}
                  disabled={!canSend}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-navy transition-all hover:-translate-y-0.5 hover:border-blue hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-blue-light dark:hover:bg-white/10"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 pt-6 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((m) => (
                <MessageRow key={m.id} message={m} />
              ))}
              {isThinking && <TypingIndicator />}
              {error && (
                <div className="rounded-xl border border-danger/30 bg-red-50 p-4 text-sm text-danger dark:border-danger/40 dark:bg-red-950/40 dark:text-red-300">
                  Something went wrong. Please call (518) 678-1230 or try again.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Composer — fixed to the viewport bottom on every screen. iOS
          keeps fixed elements with focused inputs above the on-screen
          keyboard, so this stays in view while the page scrolls behind
          it. Subtle gradient mask above the bar so messages fade into
          it instead of cutting off abruptly. */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-gray-50/95 backdrop-blur dark:border-white/5 dark:bg-[#070D1F]/95"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 to-transparent dark:from-[#070D1F]"
        />
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6 sm:py-4">
          <Composer
            input={input}
            onInputChange={setInput}
            textareaRef={textareaRef}
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
            disabled={!canSend}
            isThinking={isThinking}
            stickyBottom
          />
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            For emergencies, call (518) 678-1230.
          </p>
        </div>
      </div>
    </div>
  )
}

function MessageRow({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const text = uiMessageText(message)
  if (!text) return null

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-navy px-4 py-3 text-sm leading-relaxed shadow-sm dark:bg-blue-dark">
          <p className="whitespace-pre-wrap break-words text-white">{text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <ClairePortrait size="avatar" />
      <div className="flex-1 min-w-0 pt-1">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue dark:text-blue-light">
          Claire
        </p>
        <div className="inline-block max-w-full rounded-2xl rounded-bl-md bg-gray-200 px-4 py-3 text-sm leading-relaxed shadow-sm dark:bg-white/10">
          <p className="whitespace-pre-wrap break-words text-charcoal dark:text-gray-100">
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <ClairePortrait size="avatar" />
      <div className="pt-1">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue dark:text-blue-light">
          Claire
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-gray-200 px-4 py-3 shadow-sm dark:bg-white/10">
          <Dot delay="0ms" />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </div>
      </div>
    </div>
  )
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
      style={{ animationDelay: delay }}
    />
  )
}

function ClairePortrait({ size }: { size: 'avatar' | 'hero' }) {
  // The source photo has headroom above her hair (TZ logo, ceiling) and
  // a desk/nameplate below her shoulders. We zoom in and anchor at the
  // top so her face sits in the center of the round crop.
  if (size === 'hero') {
    return (
      <div className="relative h-32 w-32 overflow-hidden rounded-full ring-4 ring-white shadow-lg sm:h-36 sm:w-36 dark:ring-white/10">
        <Image
          src={CLAIRE_PIC}
          alt="Claire, smart assistant for TZ Electric"
          fill
          sizes="(min-width: 640px) 144px, 128px"
          priority
          className="origin-top scale-[1.4] object-cover"
        />
      </div>
    )
  }
  return (
    <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm dark:ring-white/10">
      <Image
        src={CLAIRE_PIC}
        alt="Claire"
        fill
        sizes="36px"
        className="origin-top scale-[1.4] object-cover"
      />
    </div>
  )
}

function Composer({
  input,
  onInputChange,
  textareaRef,
  onSubmit,
  onKeyDown,
  disabled,
  isThinking,
  stickyBottom,
}: {
  input: string
  onInputChange: (v: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  disabled: boolean
  isThinking: boolean
  stickyBottom: boolean
}) {
  const hasText = input.trim().length > 0
  const canSubmit = hasText && !disabled

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end gap-2 rounded-3xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow focus-within:shadow-md sm:p-4 dark:border-white/10 dark:bg-[#0F1A36]"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={isThinking ? 'Claire is typing…' : 'Ask Claire anything about your project…'}
        rows={1}
        className="min-h-[28px] flex-1 resize-none rounded-xl bg-transparent px-2 py-2 text-base leading-relaxed text-navy placeholder:text-gray-400 focus:outline-none sm:min-h-[40px] sm:py-2.5 sm:text-base dark:text-white dark:placeholder:text-gray-500"
      />
      <button
        type="submit"
        disabled={!canSubmit}
        aria-label="Send message"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue text-white shadow-sm transition-all hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-300 sm:h-12 sm:w-12 dark:disabled:bg-white/10 dark:disabled:text-gray-500"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </button>
    </form>
  )
}
