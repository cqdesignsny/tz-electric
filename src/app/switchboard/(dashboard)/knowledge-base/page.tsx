import type { Metadata } from 'next'
import Link from 'next/link'
import { Marked } from 'marked'

import KnowledgeBaseClient from '@/components/switchboard/KnowledgeBaseClient'
import { loadMergedKnowledgeBase, type KbSection } from '@/lib/agent-knowledge-base'
import { getCurrentUser, requireModuleAccess } from '@/lib/current-user'
import { canEditKnowledgeBase } from '@/lib/users'

export const metadata: Metadata = {
  title: 'Knowledge Base',
}

export const dynamic = 'force-dynamic'

export type RenderedKbSection = {
  path: string
  level: number
  heading: string
  baseContent: string
  effectiveContent: string
  baseHtml: string
  effectiveHtml: string
  override: KbSection['override']
}

export default async function KnowledgeBasePage() {
  await requireModuleAccess('knowledge-base')
  const cu = await getCurrentUser()
  const canEdit = canEditKnowledgeBase(cu?.role)
  const editorEmail = cu?.source === 'google' ? cu.email : null

  let kb
  let loadErr: string | null = null
  try {
    kb = await loadMergedKnowledgeBase()
  } catch (e) {
    loadErr = e instanceof Error ? e.message : String(e)
  }

  const md = new Marked()
  const sections: RenderedKbSection[] = (kb?.sections || []).map((s) => {
    const effective = s.override?.content || s.baseContent
    return {
      path: s.path,
      level: s.level,
      heading: s.heading,
      baseContent: s.baseContent,
      effectiveContent: effective,
      baseHtml: md.parse(s.baseContent || '', { async: false }) as string,
      effectiveHtml: md.parse(effective || '', { async: false }) as string,
      override: s.override,
    }
  })
  const preambleHtml =
    kb?.preamble ? (new Marked()).parse(kb.preamble, { async: false }) as string : ''

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-10 lg:py-12 max-w-[1400px] mx-auto w-full">
      <Link
        href="/switchboard"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light font-mono mb-4 transition-colors"
      >
        <span aria-hidden>←</span>
        <span>Dashboard</span>
      </Link>

      <header className="mb-8 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.2em] text-blue dark:text-blue-light/80 font-mono mb-2">
          TZ Switchboard · Source of truth
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
          Knowledge Base
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base leading-relaxed">
          Every policy, price, script, and SOP the AI agents (SMS, voice, web chat) load as their system prompt context. The base content lives in git; <strong>any edit you make here lands as a per-section override that always wins</strong>, even if CQ Studio later updates the base.
        </p>
      </header>

      {loadErr && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
          <div className="font-bold mb-1">Couldn&apos;t load the knowledge base</div>
          <code className="text-xs font-mono">{loadErr}</code>
        </div>
      )}

      {!canEdit && (
        <div className="mb-6 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3 text-sm text-amber-900 dark:text-amber-200">
          You&apos;re viewing in read-only mode. Owners and admins can edit sections in place.
        </div>
      )}
      {canEdit && !editorEmail && (
        <div className="mb-6 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-3 text-sm text-amber-900 dark:text-amber-200">
          Editing requires signing in with your TZ Electric Google account so we can attribute changes. Use the Google sign-in on the login page.
        </div>
      )}

      <KnowledgeBaseClient
        preambleHtml={preambleHtml}
        sections={sections}
        canEdit={canEdit && !!editorEmail}
      />

      <p className="mt-12 text-xs text-gray-400 dark:text-gray-500 max-w-3xl leading-relaxed">
        Tyler-authored edits are sticky. CQ Studio updates the base content via deploy; your overrides survive every deploy and continue to render until you revert them. The agents (SMS / voice / web chat) load this exact merged content as their system prompt on every conversation.
      </p>
    </div>
  )
}
