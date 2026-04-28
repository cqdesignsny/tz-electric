import type { Metadata } from 'next'
import Link from 'next/link'
import { listStoredLeads } from '@/lib/leads-store'
import {
  summarizeStoredLead,
  type LeadSummary,
} from '@/components/switchboard/lead-pipeline-utils'
import LeadPipelineClient from '@/components/switchboard/LeadPipelineClient'

export const metadata: Metadata = {
  title: 'Lead Pipeline',
}

export const dynamic = 'force-dynamic'

export default async function LeadPipelinePage() {
  let summaries: LeadSummary[] = []
  let error: string | null = null

  try {
    const stored = await listStoredLeads({ limit: 200 })
    summaries = stored.map(summarizeStoredLead)
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
    console.error('[lead-pipeline] listStoredLeads failed:', error)
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
          channels. Each row mirrors a Housecall Pro estimate. Click any
          lead to see the full qualification answers and jump to the
          matching estimate in HCP.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/30 dark:border-red-900/60 p-4 text-sm text-danger dark:text-red-300">
          <div className="font-bold mb-1">Couldn&apos;t load leads</div>
          <code className="text-xs font-mono">{error}</code>
        </div>
      )}

      <LeadPipelineClient leads={summaries} />

      <p className="mt-10 text-xs text-gray-400 dark:text-gray-500 leading-relaxed max-w-3xl">
        Reads from the TZ Switchboard&apos;s own database (Neon Postgres).
        Each form submission is also routed to Housecall Pro: existing
        customers get a new estimate appended to their record, new
        customers get a fresh customer + estimate. The &quot;Open in
        Housecall Pro&quot; button on each row deep-links to the matching
        estimate.
      </p>
    </div>
  )
}
