import type { Metadata } from 'next'
import Link from 'next/link'
import { listLeads } from '@/lib/housecall-pro'
import { summarizeLead, type LeadSummary } from '@/components/switchboard/lead-pipeline-utils'
import LeadPipelineClient from '@/components/switchboard/LeadPipelineClient'

export const metadata: Metadata = {
  title: 'Lead Pipeline',
}

export const dynamic = 'force-dynamic'

export default async function LeadPipelinePage() {
  let summaries: LeadSummary[] = []
  let error: string | null = null

  try {
    const { leads } = await listLeads({ pageSize: 100 })
    summaries = leads.map(summarizeLead)
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
    console.error('[lead-pipeline] HCP listLeads failed:', error)
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
          TZ Switchboard · Live data
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
          Lead Pipeline
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base max-w-3xl leading-relaxed">
          Every lead from the website form, AI agents, and other inbound
          channels. Reads live from Housecall Pro. Click any lead to see
          the full qualification answers, customer notes, and attribution.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
          <div className="font-bold mb-1">Couldn&apos;t load leads from Housecall Pro</div>
          <code className="text-xs font-mono">{error}</code>
        </div>
      )}

      <LeadPipelineClient leads={summaries} />

      <p className="mt-10 text-xs text-gray-400 dark:text-gray-500 leading-relaxed max-w-3xl">
        v1 reads directly from Housecall Pro. Long-term we&apos;ll persist
        every submission to our own database (Neon Postgres via Vercel
        Marketplace) so we can do historical analytics, structured
        search, and feed the self-improving learning loop. See{' '}
        <code className="font-mono">HANDOFF.md</code> for the migration
        trigger.
      </p>
    </div>
  )
}
