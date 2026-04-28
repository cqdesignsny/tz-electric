import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getConversation,
  listConversations,
  listMessages,
  type AgentConversation,
  type AgentMessage,
} from '@/lib/agent-conversations'
import SmsConversationsClient from '@/components/switchboard/SmsConversationsClient'

export const metadata: Metadata = {
  title: 'SMS Conversations',
}

export const dynamic = 'force-dynamic'

type SearchParams = { id?: string }

export default async function SmsConversationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { id } = await searchParams

  let conversations: AgentConversation[] = []
  let active: AgentConversation | null = null
  let messages: AgentMessage[] = []
  let error: string | null = null

  try {
    conversations = await listConversations({ channel: 'sms', limit: 50 })
    if (id) {
      active = await getConversation(id)
      if (active) messages = await listMessages(id)
    } else if (conversations.length > 0) {
      active = conversations[0]
      messages = await listMessages(active.id)
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  const ready =
    !!process.env.ANTHROPIC_API_KEY &&
    !!process.env.TWILIO_AUTH_TOKEN &&
    !!process.env.TWILIO_ACCOUNT_SID &&
    !!process.env.TWILIO_PHONE_NUMBER

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-10 lg:py-12 max-w-7xl mx-auto w-full">
      <Link
        href="/switchboard"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light font-mono mb-4 transition-colors"
      >
        <span aria-hidden>←</span>
        <span>Dashboard</span>
      </Link>

      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-blue dark:text-blue-light/80 font-mono mb-2">
          TZ Switchboard · SMS Claire
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
          SMS Conversations
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base max-w-3xl leading-relaxed">
          Live SMS thread between Claire and customers. Take over a thread to respond as office staff; release to give it back to Claire. Every message is persisted with channel attribution and lead linkage.
        </p>
      </header>

      {!ready && (
        <div className="mb-6 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-200">
          <div className="font-bold mb-1">SMS Claire is in pre-launch.</div>
          <div className="text-xs">
            The pipeline is wired but waiting on environment configuration.
            Required env vars: <code className="font-mono">ANTHROPIC_API_KEY</code>,{' '}
            <code className="font-mono">TWILIO_ACCOUNT_SID</code>,{' '}
            <code className="font-mono">TWILIO_AUTH_TOKEN</code>,{' '}
            <code className="font-mono">TWILIO_PHONE_NUMBER</code>. A2P 10DLC business
            registration must also be approved before Twilio will reliably deliver SMS.
            Until then, inbound messages get a holding-pattern reply and persist here for
            office review.
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
          <div className="font-bold mb-1">Couldn&apos;t load conversations</div>
          <code className="text-xs font-mono">{error}</code>
        </div>
      )}

      <SmsConversationsClient
        conversations={conversations}
        activeId={active?.id || null}
        active={active}
        messages={messages}
      />
    </div>
  )
}
