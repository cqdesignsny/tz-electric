/**
 * /switchboard/cost-analysis — what Claire actually costs.
 *
 * Reads tz_voice_call_costs (populated from Vapi's end-of-call-report via
 * voice/server route). Vapi only retains 14 days; this table is the only
 * durable record beyond that.
 *
 * Owner + admin only — cost data is operationally sensitive.
 */
import type { Metadata } from 'next'
import Link from 'next/link'

import { requireModuleAccess } from '@/lib/current-user'
import {
  getCostHeadlineStats,
  getCostByComponent,
  getCostByDay,
  getMostExpensiveCalls,
} from '@/lib/cost-analysis-queries'
import { StatCard, BarList } from '@/components/switchboard/ReportsCharts'

export const metadata: Metadata = {
  title: 'Cost Analysis',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PERIOD_OPTIONS = [
  { days: 7, label: 'Last 7 days' },
  { days: 14, label: 'Last 14 days' },
  { days: 30, label: 'Last 30 days' },
] as const

function fmtMoney(usd: number): string {
  if (Math.abs(usd) < 0.01) return '$0'
  if (Math.abs(usd) < 1) return `$${usd.toFixed(3)}`
  if (Math.abs(usd) < 100) return `$${usd.toFixed(2)}`
  return `$${usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function fmtMinutes(min: number): string {
  if (min < 1) return `${Math.round(min * 60)}s`
  if (min < 60) return `${min.toFixed(1)} min`
  return `${(min / 60).toFixed(1)}h`
}

function shortDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function dayLabel(day: string): string {
  // YYYY-MM-DD → "May 28"
  const d = new Date(`${day}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function CostAnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  await requireModuleAccess('cost-analysis')

  const params = await searchParams
  const requested = parseInt(params.days || '', 10)
  const days =
    Number.isFinite(requested) && [7, 14, 30].includes(requested) ? requested : 14

  const [headline, byComponent, byDay, expensive] = await Promise.all([
    getCostHeadlineStats(days),
    getCostByComponent(days),
    getCostByDay(days),
    getMostExpensiveCalls(days, 10),
  ])

  const maxDailyCost = Math.max(0.01, ...byDay.map((d) => d.totalCost))
  const cacheRatePct = Math.round(headline.llmCacheRate * 100)
  const projTone: 'positive' | 'caution' | 'danger' | 'default' =
    headline.projectedMonthlyCost > 300
      ? 'danger'
      : headline.projectedMonthlyCost > 150
        ? 'caution'
        : 'default'

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-navy text-3xl dark:text-white">
            Cost Analysis
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
            What Vapi + Claire + 11labs cost over the selected period. Reads from{' '}
            <code className="text-xs">tz_voice_call_costs</code>, written on every
            call&apos;s end-of-call-report so it survives Vapi&apos;s 14-day retention.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map((opt) => {
            const active = days === opt.days
            return (
              <Link
                key={opt.days}
                href={`/switchboard/cost-analysis?days=${opt.days}`}
                prefetch={false}
                className={[
                  'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-heading font-semibold transition-colors',
                  active
                    ? 'bg-blue text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10',
                ].join(' ')}
              >
                {opt.label}
              </Link>
            )
          })}
        </div>
      </header>

      {/* Headline stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={`Spend (${days}d)`}
          value={fmtMoney(headline.totalCost)}
          sub={`${headline.totalCalls} call${headline.totalCalls === 1 ? '' : 's'} · ${fmtMinutes(headline.totalMinutes)}`}
        />
        <StatCard
          label="Projected / month"
          value={fmtMoney(headline.projectedMonthlyCost)}
          sub={`at current ${fmtMoney(headline.totalCost / Math.max(1, days))}/day pace`}
          tone={projTone}
        />
        <StatCard
          label="Per call avg"
          value={fmtMoney(headline.avgCostPerCall)}
          sub={`per minute: ${fmtMoney(headline.avgCostPerMinute)}`}
        />
        <StatCard
          label="LLM cache rate"
          value={`${cacheRatePct}%`}
          sub={
            cacheRatePct === 0
              ? 'Vapi does not pass cache_control to Anthropic — see notes below'
              : 'Cached prompt tokens are billed at 10% the normal rate'
          }
          tone={cacheRatePct === 0 ? 'caution' : 'positive'}
        />
      </section>

      {/* Cost by component */}
      <section className="rounded-2xl border-2 border-blue/15 bg-white dark:bg-white/5 dark:border-white/10 p-5 lg:p-6">
        <div className="mb-4">
          <h2 className="font-heading font-bold text-navy dark:text-white text-lg">
            Where the money goes
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Vapi side only. 11labs is BYOK so it doesn&apos;t appear here — see the
            estimate below for that.
          </p>
        </div>
        <BarList
          rows={byComponent
            .filter((c) => c.totalCost > 0 || c.component === 'tts')
            .map((c) => ({
              label: c.label,
              count: Math.round(c.totalCost * 10000) / 100, // show as cents-like number for the bar
              share: c.share,
              meta: `${fmtMoney(c.totalCost)} · ${Math.round(c.share * 100)}%`,
            }))}
          emptyMessage="No spend in this period yet."
        />
      </section>

      {/* Daily burn */}
      <section className="rounded-2xl border-2 border-blue/15 bg-white dark:bg-white/5 dark:border-white/10 p-5 lg:p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-navy dark:text-white text-lg">
              Daily burn
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Vapi spend per day (Eastern Time). Hover a bar for details.
            </p>
          </div>
          <span className="text-xs text-gray-500 tabular-nums">
            {byDay[0]?.day} → {byDay[byDay.length - 1]?.day}
          </span>
        </div>
        {byDay.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No calls in this period. Once an inbound call ends, Vapi posts its
            end-of-call-report and the cost lands here within seconds.
          </p>
        ) : (
          <>
            <div className="flex items-end gap-[3px] h-40">
              {byDay.map((d) => {
                const heightPct = (d.totalCost / maxDailyCost) * 100
                return (
                  <div
                    key={d.day}
                    className="flex-1 min-w-0 flex flex-col-reverse items-stretch"
                    style={{ height: '100%' }}
                    title={`${dayLabel(d.day)}: ${fmtMoney(d.totalCost)} · ${d.callCount} call${d.callCount === 1 ? '' : 's'} · ${fmtMinutes(d.totalMinutes)}`}
                  >
                    <div
                      className="bg-blue rounded-t-sm"
                      style={{ height: `${heightPct}%`, minHeight: d.totalCost > 0 ? 2 : 0 }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-gray-500 tabular-nums">
              <span>{dayLabel(byDay[0].day)}</span>
              <span>{dayLabel(byDay[byDay.length - 1].day)}</span>
            </div>
          </>
        )}
      </section>

      {/* 11labs estimate */}
      <section className="rounded-2xl border-2 border-amber-200 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/20 p-5 lg:p-6">
        <h2 className="font-heading font-bold text-navy dark:text-white text-lg">
          11labs TTS (BYOK — billed separately to your 11labs account)
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 mb-4">
          Vapi doesn&apos;t bill for 11labs since the credential is yours. Real cost
          shows up on your 11labs invoice. Estimate based on character count for
          the selected period:
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Characters spoken"
            value={headline.totalTtsCharacters.toLocaleString()}
            sub="across all Claire's turns"
          />
          <StatCard
            label="Creator plan ($0.30/1k)"
            value={fmtMoney(headline.estTtsCostCreatorPlan)}
            sub={`projected /month: ${fmtMoney((headline.estTtsCostCreatorPlan / Math.max(1, days)) * 30)}`}
          />
          <StatCard
            label="Pro plan ($0.18/1k)"
            value={fmtMoney(headline.estTtsCostProPlan)}
            sub={`projected /month: ${fmtMoney((headline.estTtsCostProPlan / Math.max(1, days)) * 30)}`}
            tone="positive"
          />
        </div>
      </section>

      {/* Top expensive calls */}
      <section className="rounded-2xl border-2 border-blue/15 bg-white dark:bg-white/5 dark:border-white/10 p-5 lg:p-6">
        <h2 className="font-heading font-bold text-navy dark:text-white text-lg mb-4">
          Top 10 most expensive calls
        </h2>
        {expensive.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No calls in this period yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th className="text-left py-2 pr-3">When</th>
                  <th className="text-left py-2 pr-3">Caller</th>
                  <th className="text-right py-2 pr-3 tabular-nums">Cost</th>
                  <th className="text-right py-2 pr-3 tabular-nums">Duration</th>
                  <th className="text-right py-2 pr-3 tabular-nums">Prompt tokens</th>
                  <th className="text-left py-2">Ended</th>
                </tr>
              </thead>
              <tbody>
                {expensive.map((c) => {
                  const durSec = c.durationSeconds ?? 0
                  const minutes = durSec / 60
                  const cacheRate = c.promptTokens
                    ? Math.round((c.cachedPromptTokens / c.promptTokens) * 100)
                    : 0
                  return (
                    <tr key={c.vapiCallId} className="border-b border-gray-100 dark:border-white/5">
                      <td className="py-2.5 pr-3 text-gray-700 dark:text-gray-300">
                        {shortDate(c.startedAt)}
                      </td>
                      <td className="py-2.5 pr-3">
                        {c.conversationId ? (
                          <Link
                            href={`/switchboard/call-logs?conv=${c.conversationId}`}
                            prefetch={false}
                            className="text-blue dark:text-blue-light hover:underline tabular-nums"
                          >
                            {c.customerPhone || '(unknown)'}
                          </Link>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400 tabular-nums">
                            {c.customerPhone || '(unknown)'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums font-semibold text-navy dark:text-white">
                        {fmtMoney(c.totalCost)}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        {fmtMinutes(minutes)}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                        {c.promptTokens.toLocaleString()}
                        {cacheRate > 0 && (
                          <span className="text-emerald-600 text-xs ml-1">
                            ({cacheRate}% cached)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-gray-600 dark:text-gray-400 text-xs">
                        {c.endedReason || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Optimization notes */}
      <section className="rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-5 lg:p-6">
        <h2 className="font-heading font-bold text-navy dark:text-white text-lg mb-3">
          Cost notes
        </h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <li>
            <strong>Vapi&apos;s post-call analysis is disabled</strong> as of 2026-05-28.
            Summary + success eval + structured data plans all set to{' '}
            <code className="text-xs">enabled: false</code>. Calls before that
            still show analysis cost; calls after won&apos;t.
          </li>
          <li>
            <strong>Anthropic prompt caching isn&apos;t available through Vapi&apos;s
            standard assistant config.</strong> Vapi&apos;s{' '}
            <code className="text-xs">AnthropicModel.messages</code> only accepts
            bare <code className="text-xs">OpenAIMessage</code> (role + content) —
            no <code className="text-xs">cache_control</code> passthrough.
            Enabling caching would require routing through a custom-LLM-URL
            endpoint that proxies to Anthropic with{' '}
            <code className="text-xs">cache_control: ephemeral</code> set.
            Roughly 4–6 hours of build work, parked for now.
          </li>
          <li>
            <strong>Deepgram is on nova-3</strong> already (verified in the live
            assistant config). nova-2-phonecall would be slightly cheaper but
            less accurate.
          </li>
          <li>
            <strong>System prompt trimmed</strong> to exclude internal-only KB
            sections (Open Questions for Tyler, Server-side HCP Routing) — saves
            roughly 1k tokens per turn.
          </li>
          <li>
            <strong>Vapi platform fee is fixed</strong> at ~$0.05/minute and is
            unavoidable as long as we use Vapi. It dominates the cost mix.
          </li>
        </ul>
      </section>
    </div>
  )
}
