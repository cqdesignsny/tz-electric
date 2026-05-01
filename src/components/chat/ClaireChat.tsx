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
  { id: 'leak', label: 'I have a leak', prompt: "I have a leak at my house and I'm not sure what to do." },
  { id: 'ac', label: "AC isn't cooling", prompt: "My AC isn't cooling like it should. Can you help?" },
  { id: 'gen', label: 'New generator quote', prompt: "I'd like a quote on a new standby generator for my home." },
  { id: 'ev', label: 'EV charger install', prompt: 'I want to install an EV charger at my house.' },
  { id: 'panel', label: 'Panel upgrade', prompt: "I'm thinking about upgrading my electrical panel. Where do I start?" },
  { id: 'other', label: 'Something else', prompt: 'I have a question about a service I need.' },
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
  const [conversationId, setConversationId] = useState('')
  const [attribution, setAttribution] = useState<Record<string, string>>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setConversationId(readOrCreateConversationId())
    setAttribution(captureAttribution())
    setHydrated(true)
  }, [])

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: '/api/agents/web-chat/stream',
      prepareSendMessagesRequest: ({ messages, body }) => ({
        body: {
          ...(body ?? {}),
          messages,
          conversationId,
          attribution,
        },
      }),
    })
  }, [conversationId, attribution])

  const { messages, sendMessage, status, error } = useChat({ transport })

  const isThinking = status === 'submitted' || status === 'streaming'
  const showEmptyState = messages.length === 0 && !isThinking
  const canSend = hydrated && !!conversationId && !isThinking

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

  // Autoscroll thread on new tokens / new messages.
  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
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
    <div className="relative flex flex-col bg-gray-50 text-charcoal dark:bg-[#070D1F] dark:text-gray-100 min-h-[calc(100vh-80px)]">
      {/* Floating theme toggle for the thread view. Empty state has its own
          centered toggle, so suppress this one there. */}
      {!showEmptyState && (
        <div className="pointer-events-auto absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <ChatThemeToggle />
        </div>
      )}

      {showEmptyState ? (
        <div className="flex-1 flex flex-col items-center px-4 pt-10 pb-12 sm:px-6 sm:pt-16">
          <div className="w-full max-w-3xl">
            <div className="flex flex-col items-center text-center">
              <ChatThemeToggle />
              <div className="mt-6">
                <ClairePortrait size="hero" />
              </div>
              <h1 className="mt-6 font-heading text-3xl font-bold text-navy dark:text-white sm:text-4xl">
                Hi, I&apos;m Claire.
              </h1>
              <p className="mt-3 max-w-xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
                I&apos;m an AI assistant for TZ Electric. Ask me anything about your project. Cooling, heating, electrical, plumbing, generators, EV chargers.
              </p>
            </div>

            <div className="mt-8 grid gap-2 sm:grid-cols-2">
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

            <div className="mt-8">
              <Composer
                input={input}
                onInputChange={setInput}
                textareaRef={textareaRef}
                onSubmit={onSubmit}
                onKeyDown={onKeyDown}
                disabled={!canSend}
                isThinking={isThinking}
                stickyBottom={false}
              />
              <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                Identifies as AI. For emergencies call (518) 678-1230 — we answer 24/7.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={threadRef}
            className="flex-1 overflow-y-auto px-4 pt-6 pb-32 sm:px-6"
          >
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

          <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50/95 backdrop-blur dark:border-white/5 dark:bg-[#070D1F]/95">
            <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
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
                Identifies as AI. For emergencies call (518) 678-1230.
              </p>
            </div>
          </div>
        </>
      )}
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
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-navy px-4 py-3 text-sm leading-relaxed text-white shadow-sm dark:bg-blue">
          <p className="whitespace-pre-wrap break-words">{text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <ClairePortrait size="avatar" />
      <div className="flex-1 pt-1">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue dark:text-blue-light">
          Claire
        </p>
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-charcoal dark:text-gray-100">
          {text}
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
        <div className="flex items-center gap-1.5 py-2">
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
          alt="Claire, AI assistant for TZ Electric"
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
      className={[
        'flex items-end gap-2 rounded-2xl border bg-white p-2 shadow-sm transition-shadow focus-within:shadow-md dark:bg-[#0F1A36]',
        stickyBottom
          ? 'border-gray-200 dark:border-white/10'
          : 'border-gray-200 dark:border-white/10',
      ].join(' ')}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={isThinking ? 'Claire is typing…' : 'Ask Claire anything about your project…'}
        rows={1}
        className="flex-1 resize-none rounded-xl bg-transparent px-3 py-2.5 text-sm leading-relaxed text-navy placeholder:text-gray-400 focus:outline-none dark:text-white dark:placeholder:text-gray-500"
      />
      <button
        type="submit"
        disabled={!canSubmit}
        aria-label="Send message"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue text-white shadow-sm transition-all hover:bg-blue-dark disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-white/10 dark:disabled:text-gray-500"
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
