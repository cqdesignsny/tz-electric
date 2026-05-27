'use client'
/**
 * Browse Claire's nightly self-improvement reports. Renders the
 * tz_claire_daily_analysis rows fetched server-side as expandable cards
 * above the admin chat. Click "Ask Claire about this" to seed the chat
 * composer with a relevant prompt.
 */
import { useState } from 'react'

type ProposalCounts = {
  wins: number
  failure_patterns: number
  kb_gaps: number
  proposed_prompt_rules: number
  calls_worth_listening_to: number
  questions_for_tyler: number
}

export type DailyReport = {
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
  proposals: {
    summary: string
    wins?: Array<{ description: string; evidence_conversation_ids: string[] }>
    failure_patterns?: Array<{
      pattern: string
      severity: string
      n_calls_affected: number
      evidence_conversation_ids: string[]
    }>
    kb_gaps?: Array<{
      question_asked: string
      claire_response: string
      proposed_addition: string
      evidence_conversation_ids: string[]
    }>
    proposed_prompt_rules?: Array<{
      rule: string
      rationale: string
      evidence_conversation_ids: string[]
    }>
    calls_worth_listening_to?: Array<{ conversation_id: string; why: string }>
    questions_for_tyler?: Array<{ question: string; context: string }>
  }
}

function fmtDate(yyyyMmDd: string): string {
  // 2026-05-27 → "Wed, May 27"
  const [y, m, d] = yyyyMmDd.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  })
}

export default function DailyReportsBrowser({ reports }: { reports: DailyReport[] }) {
  const [expandedDate, setExpandedDate] = useState<string | null>(
    reports[0]?.analysis_date ?? null,
  )

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-sm text-gray-500 dark:text-gray-400">
        No daily reports yet. The first one fires at 2 AM ET. You can also
        manually trigger one via{' '}
        <code className="font-mono text-xs">
          /api/cron/claire-daily-analysis?date=YYYY-MM-DD
        </code>
        .
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => {
        const isOpen = expandedDate === r.analysis_date
        const counts = countsOf(r.proposals)
        return (
          <article
            key={r.analysis_date}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedDate(isOpen ? null : r.analysis_date)
              }
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-navy dark:text-white">
                      {fmtDate(r.analysis_date)}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider font-mono text-gray-400 dark:text-gray-500">
                      {r.analysis_date}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-3 gap-y-1 mb-2">
                    <span>{r.voice_count} voice</span>
                    <span>{r.web_chat_count} web chat</span>
                    <span>{r.sms_count} SMS</span>
                    <span>{r.lead_form_count} lead form</span>
                    <span className="font-semibold">{r.total_leads} leads</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                    {r.proposals.summary}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {isOpen ? '−' : '+'}
                  </span>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">
                    <div>{counts.failure_patterns} patterns</div>
                    <div>{counts.kb_gaps} KB gaps</div>
                    <div>{counts.proposed_prompt_rules} prompt rules</div>
                  </div>
                </div>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-4 space-y-4 bg-gray-50/40 dark:bg-gray-800/20">
                <ReportSection title="Wins" rows={r.proposals.wins?.map((w) => ({
                  primary: w.description,
                  evidence: w.evidence_conversation_ids,
                })) ?? []} />

                <ReportSection
                  title="Failure patterns"
                  rows={
                    r.proposals.failure_patterns?.map((p) => ({
                      primary: `[${p.severity}] ${p.pattern} (${p.n_calls_affected} call${p.n_calls_affected === 1 ? '' : 's'})`,
                      evidence: p.evidence_conversation_ids,
                    })) ?? []
                  }
                />

                <ReportSection
                  title="KB gaps with proposed additions"
                  rows={
                    r.proposals.kb_gaps?.map((g) => ({
                      primary: `Q: ${g.question_asked}`,
                      secondary: `Proposed: ${g.proposed_addition}`,
                      evidence: g.evidence_conversation_ids,
                    })) ?? []
                  }
                />

                <ReportSection
                  title="Proposed prompt rules"
                  rows={
                    r.proposals.proposed_prompt_rules?.map((rule) => ({
                      primary: rule.rule,
                      secondary: `Why: ${rule.rationale}`,
                      evidence: rule.evidence_conversation_ids,
                    })) ?? []
                  }
                />

                <ReportSection
                  title="Calls worth listening to"
                  rows={
                    r.proposals.calls_worth_listening_to?.map((c) => ({
                      primary: `${c.conversation_id} — ${c.why}`,
                      evidence: [c.conversation_id],
                    })) ?? []
                  }
                />

                <ReportSection
                  title="Questions for the team"
                  rows={
                    r.proposals.questions_for_tyler?.map((q) => ({
                      primary: q.question,
                      secondary: q.context,
                      evidence: [],
                    })) ?? []
                  }
                />

                <div className="text-[10px] uppercase tracking-wider font-mono text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
                  Model: {r.llm_model}
                </div>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

function ReportSection({
  title,
  rows,
}: {
  title: string
  rows: Array<{ primary: string; secondary?: string; evidence: string[] }>
}) {
  if (rows.length === 0) return null
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider font-mono text-blue dark:text-blue-light/80 mb-2">
        {title}
      </h4>
      <ul className="space-y-2">
        {rows.map((row, i) => (
          <li
            key={i}
            className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
          >
            <div>{row.primary}</div>
            {row.secondary && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {row.secondary}
              </div>
            )}
            {row.evidence.length > 0 && (
              <div className="text-[10px] font-mono text-gray-400 dark:text-gray-500 mt-1">
                [{row.evidence.map((e) => e.slice(0, 8)).join(', ')}]
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function countsOf(p: DailyReport['proposals']): ProposalCounts {
  return {
    wins: p.wins?.length ?? 0,
    failure_patterns: p.failure_patterns?.length ?? 0,
    kb_gaps: p.kb_gaps?.length ?? 0,
    proposed_prompt_rules: p.proposed_prompt_rules?.length ?? 0,
    calls_worth_listening_to: p.calls_worth_listening_to?.length ?? 0,
    questions_for_tyler: p.questions_for_tyler?.length ?? 0,
  }
}
