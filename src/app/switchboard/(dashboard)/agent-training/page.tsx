/**
 * Claire (admin mode) — the conversational interface for keeping Claire
 * sharp. Used to be the agent-training questionnaire (one-time intake);
 * post 2026-05-27 it's the living, breathing chat where Tyler / Terry /
 * Cesar talk to Claire to:
 *   - Read + edit the knowledge base
 *   - Browse her nightly self-improvement reports
 *   - Search recent conversations
 *
 * Same persona as customer-facing Claire (one name across all surfaces,
 * per the 2026-05-18 "Claire as TZ AI" architecture).
 */
import type { Metadata } from 'next'
import Link from 'next/link'

import AdminClaireChat from '@/components/switchboard/AdminClaireChat'
import DailyReportsBrowser, {
  type DailyReport,
} from '@/components/switchboard/DailyReportsBrowser'
import { requireModuleAccess } from '@/lib/current-user'
import { db } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Claire (admin)',
  description: 'Chat with Claire to edit her knowledge base, browse daily reports, and search recent activity.',
}

export const dynamic = 'force-dynamic'

export default async function AgentTrainingPage() {
  const actor = await requireModuleAccess('agent-training')

  // Restrict to Google-signed users for proper attribution on KB edits.
  if (actor.source !== 'google' || !actor.user) {
    return (
      <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-10 lg:py-12 max-w-5xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">Claire (admin)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base leading-relaxed">
            Sign in with your TZ Electric Google account to edit the knowledge base.
            Password-based sessions can view, but every KB edit needs a real Google
            identity for the audit trail.
          </p>
        </header>
        <Link
          href="/switchboard/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue dark:bg-blue-light text-white dark:text-navy text-sm font-semibold hover:bg-blue-dark dark:hover:bg-blue transition-colors"
        >
          Sign in with Google
        </Link>
      </div>
    )
  }

  // Owner + admin only. Office users hit this URL → bounce them to the
  // module-overview (where they'll see "not available for your role").
  if (actor.role !== 'owner' && actor.role !== 'admin') {
    return (
      <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-10 lg:py-12 max-w-5xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">Claire (admin)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base leading-relaxed">
            This page is owner + admin only. Daily reports and KB edits affect
            customer-facing Claire — they need a higher access tier than your
            current role ({actor.role}).
          </p>
        </header>
        <Link
          href="/switchboard"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light font-mono transition-colors"
        >
          <span aria-hidden>←</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>
    )
  }

  // Pull the last 7 days of self-improvement reports.
  let reports: DailyReport[] = []
  let loadError: string | null = null
  try {
    const sql = db()
    type Row = {
      analysis_date: string
      voice_count: number
      web_chat_count: number
      sms_count: number
      lead_form_count: number
      total_leads: number
      escalation_count: number
      emergency_dispatch_count: number
      silence_timeout_count: number
      llm_model: string
      proposals: DailyReport['proposals']
    }
    const rows = (await sql`
      SELECT
        analysis_date::text AS analysis_date,
        voice_count, web_chat_count, sms_count, lead_form_count,
        total_leads, escalation_count, emergency_dispatch_count,
        silence_timeout_count, llm_model, proposals
      FROM tz_claire_daily_analysis
      ORDER BY analysis_date DESC
      LIMIT 14
    `) as unknown as Row[]
    reports = rows
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e)
  }

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-12 py-8 md:py-10 lg:py-12 max-w-6xl mx-auto w-full">
      <Link
        href="/switchboard"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue dark:hover:text-blue-light font-mono mb-4 transition-colors"
      >
        <span aria-hidden>←</span>
        <span>Dashboard</span>
      </Link>

      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-blue dark:text-blue-light/80 font-mono mb-2">
          TZ Switchboard · Claire (admin mode)
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-navy dark:text-white">
          Talk to Claire
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base max-w-3xl leading-relaxed">
          The living interface for keeping Claire sharp. Ask her to edit the
          knowledge base, review her nightly self-improvement reports, or look
          up a specific call. Every KB edit goes through a propose then approve
          flow so nothing changes without your sign-off.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-mono mb-3">
          Recent self-improvement reports
        </h2>
        {loadError ? (
          <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-300">
            Couldn&apos;t load reports: <code className="font-mono text-xs">{loadError}</code>
          </div>
        ) : (
          <DailyReportsBrowser reports={reports} />
        )}
      </section>

      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-mono mb-3">
          Chat
        </h2>
        <AdminClaireChat
          actorName={actor.user.name ?? null}
          actorEmail={actor.email}
          actorRole={actor.role as 'owner' | 'admin'}
        />
      </section>
    </div>
  )
}
