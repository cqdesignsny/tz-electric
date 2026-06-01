import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getConversation,
  listConversations,
  listMessages,
  type AgentConversation,
  type AgentMessage,
} from '@/lib/agent-conversations'
import CallLogsClient from '@/components/switchboard/CallLogsClient'
import { getReviewMarksFor, type ReviewMark } from '@/lib/call-review'
import { requireModuleAccess } from '@/lib/current-user'

export const metadata: Metadata = {
  title: 'Call Logs',
}

export const dynamic = 'force-dynamic'

type SearchParams = { id?: string }

export default async function CallLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireModuleAccess('call-logs')
  const { id } = await searchParams

  let conversations: AgentConversation[] = []
  let active: AgentConversation | null = null
  let messages: AgentMessage[] = []
  let reviewMarks: Record<string, ReviewMark> = {}
  let error: string | null = null

  try {
    conversations = await listConversations({ channel: 'voice', limit: 50 })
    if (id) {
      active = await getConversation(id)
      // Only show the call if it actually is a voice call. Stops a
      // hand-typed id for a chat or sms conversation from rendering
      // here in the wrong viewer.
      if (active && active.channel !== 'voice') active = null
      if (active) messages = await listMessages(id)
    } else if (conversations.length > 0) {
      active = conversations[0]
      messages = await listMessages(active.id)
    }
    // Which of these calls are flagged for review (so the list can badge +
    // filter them and the active call shows its mark state). Resilient — never
    // throws, so it can't break the page.
    const ids = Array.from(
      new Set([...conversations.map((c) => c.id), ...(active ? [active.id] : [])]),
    )
    reviewMarks = await getReviewMarksFor(ids)
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
          TZ Switchboard · Voice Claire
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
          Call Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base max-w-3xl leading-relaxed">
          Every inbound call Claire answered, with full transcript, tool
          calls, captured contact, and recording playback. Calls land here
          automatically when Vapi delivers the end-of-call report.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
          <div className="font-bold mb-1">Couldn&apos;t load call logs</div>
          <code className="text-xs font-mono">{error}</code>
        </div>
      )}

      <CallLogsClient
        conversations={conversations}
        activeId={active?.id || null}
        active={active}
        messages={messages}
        reviewMarks={reviewMarks}
      />
    </div>
  )
}
