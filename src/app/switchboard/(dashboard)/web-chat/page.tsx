import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getConversation,
  listConversations,
  listMessages,
  type AgentConversation,
  type AgentMessage,
} from '@/lib/agent-conversations'
import WebChatConversationsClient from '@/components/switchboard/WebChatConversationsClient'
import { requireModuleAccess } from '@/lib/current-user'

export const metadata: Metadata = {
  title: 'Web Chat',
}

export const dynamic = 'force-dynamic'

type SearchParams = { id?: string }

export default async function WebChatPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireModuleAccess('web-chat')
  const { id } = await searchParams

  let conversations: AgentConversation[] = []
  let active: AgentConversation | null = null
  let messages: AgentMessage[] = []
  let error: string | null = null

  try {
    conversations = await listConversations({ channel: 'web_chat', limit: 50 })
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
          TZ Switchboard · Web Chat Claire
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
          Web Chat Conversations
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base max-w-3xl leading-relaxed">
          Live and historical chat threads from{' '}
          <Link
            href="/claire"
            className="text-blue dark:text-blue-light underline-offset-2 hover:underline"
          >
            tzelectricinc.com/claire
          </Link>
          . Every visitor message, Claire reply, tool call, and lead capture is persisted with first-touch attribution. Take over a thread to respond as office, or release to give it back to Claire.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
          <div className="font-bold mb-1">Couldn&apos;t load conversations</div>
          <code className="text-xs font-mono">{error}</code>
        </div>
      )}

      <WebChatConversationsClient
        conversations={conversations}
        activeId={active?.id || null}
        active={active}
        messages={messages}
      />
    </div>
  )
}
