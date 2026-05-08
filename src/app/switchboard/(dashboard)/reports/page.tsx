import type { Metadata } from 'next'
import Link from 'next/link'
import {
  rangeFromDays,
  getHeadlineStats,
  getLeadVolumeByDay,
  getChannelBreakdown,
  getServiceMix,
  getConversationStats,
  getNoContactConversations,
} from '@/lib/reports-queries'
import {
  StatCard,
  BarList,
  DailyVolumeBars,
} from '@/components/switchboard/ReportsCharts'

export const metadata: Metadata = {
  title: 'Reports',
}

// Always render fresh — reports are time-sensitive.
export const dynamic = 'force-dynamic'
export const revalidate = 0

const PERIOD_OPTIONS = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
] as const

function formatCents(cents: number): string {
  if (!cents) return '$0'
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function trendBadge(curr: number, prev: number): { label: string; tone: 'positive' | 'caution' | 'default' } {
  if (prev === 0 && curr === 0) return { label: 'No change', tone: 'default' }
  if (prev === 0) return { label: 'New activity', tone: 'positive' }
  const delta = curr - prev
  const pct = Math.round((delta / prev) * 100)
  if (delta === 0) return { label: 'No change vs prev', tone: 'default' }
  if (delta > 0) return { label: `↑ ${pct}% vs prev period`, tone: 'positive' }
  return { label: `↓ ${Math.abs(pct)}% vs prev period`, tone: 'caution' }
}

function shortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function truncate(s: string | null, n = 140): string {
  if (!s) return ''
  if (s.length <= n) return s
  return s.slice(0, n - 1).trimEnd() + '…'
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const params = await searchParams
  const requested = parseInt(params.days || '', 10)
  const days =
    Number.isFinite(requested) && [7, 30, 90].includes(requested) ? requested : 30
  const range = rangeFromDays(days)

  // Pull everything in parallel — reads are independent.
  const [
    headline,
    volume,
    channels,
    services,
    conv,
    noContact,
  ] = await Promise.all([
    getHeadlineStats(range),
    getLeadVolumeByDay(range),
    getChannelBreakdown(range),
    getServiceMix(range),
    getConversationStats(range),
    getNoContactConversations(range, 25),
  ])

  const trend = trendBadge(headline.totalLeads, headline.totalLeadsPrev)
  const channelLabels = channels.map((c) => c.channel)

  return (
    <div className="space-y-8">
      {/* Header + period switcher */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-navy text-3xl dark:text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Lead volume, channel mix, service mix, and Claire conversation health for the selected period.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map((opt) => {
            const active = days === opt.days
            return (
              <Link
                key={opt.days}
                href={`/switchboard/reports?days=${opt.days}`}
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
          <Link
            href={`/api/switchboard/reports/export?days=${days}`}
            prefetch={false}
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-heading font-semibold bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10"
            title="Download CSV of leads in this period"
          >
            CSV
          </Link>
        </div>
      </header>

      {/* Headline stat cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total leads"
          value={headline.totalLeads.toLocaleString()}
          sub={trend.label}
          tone={trend.tone === 'positive' ? 'positive' : trend.tone === 'caution' ? 'caution' : 'default'}
        />
        <StatCard
          label="Web form"
          value={headline.webFormLeads.toLocaleString()}
          sub={`${headline.totalLeads ? Math.round((headline.webFormLeads / headline.totalLeads) * 100) : 0}% of leads`}
        />
        <StatCard
          label="Claire (agents)"
          value={headline.agentLeads.toLocaleString()}
          sub={`${headline.totalLeads ? Math.round((headline.agentLeads / headline.totalLeads) * 100) : 0}% of leads`}
        />
        <StatCard
          label="Pipeline value"
          value={formatCents(headline.totalValueCents)}
          sub={
            headline.hcpSyncErrors
              ? `${headline.hcpSyncErrors} HCP sync error${headline.hcpSyncErrors === 1 ? '' : 's'}`
              : 'No HCP sync errors'
          }
          tone={headline.hcpSyncErrors > 0 ? 'danger' : 'default'}
        />
      </section>

      {/* Lead volume over time */}
      <section className="rounded-2xl border-2 border-blue/15 bg-white dark:bg-white/5 dark:border-white/10 p-5 lg:p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-navy dark:text-white text-lg">
              Lead volume
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Leads per day, stacked by attribution channel.
            </p>
          </div>
          <span className="text-xs text-gray-500 tabular-nums">
            {volume[0]?.date} → {volume[volume.length - 1]?.date}
          </span>
        </div>
        <DailyVolumeBars points={volume} channels={channelLabels} />
      </section>

      {/* Channel + service mix */}
      <section className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border-2 border-blue/15 bg-white dark:bg-white/5 dark:border-white/10 p-5 lg:p-6">
          <h2 className="font-heading font-bold text-navy dark:text-white text-lg">
            Channel breakdown
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-4">
            Where the leads came from. Pipeline value is the total
            estimated lead value if every lead converted.
          </p>
          <BarList
            rows={channels.map((c) => ({
              label: c.channel,
              count: c.count,
              share: c.share,
              meta: c.valueCents > 0 ? formatCents(c.valueCents) : null,
            }))}
            emptyMessage="No leads in this period."
          />
        </div>

        <div className="rounded-2xl border-2 border-blue/15 bg-white dark:bg-white/5 dark:border-white/10 p-5 lg:p-6">
          <h2 className="font-heading font-bold text-navy dark:text-white text-lg">
            Service mix
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-4">
            What people are asking about. Useful for capacity planning
            and ad-spend allocation.
          </p>
          <BarList
            rows={services.map((s) => ({
              label: s.serviceLabel,
              count: s.count,
              share: s.share,
            }))}
            emptyMessage="No leads in this period."
          />
        </div>
      </section>

      {/* Conversation stats */}
      <section className="rounded-2xl border-2 border-blue/15 bg-white dark:bg-white/5 dark:border-white/10 p-5 lg:p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-navy dark:text-white text-lg">
              Claire conversations
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Visitor chat sessions across channels. Healthy ratio is most
              conversations capturing contact and many converting to leads.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total conversations" value={conv.total.toLocaleString()} />
          <StatCard
            label="Captured contact"
            value={conv.withContact.toLocaleString()}
            sub={`${conv.total ? Math.round((conv.withContact / conv.total) * 100) : 0}% of conversations`}
            tone="positive"
          />
          <StatCard
            label="Booked a lead"
            value={conv.withLead.toLocaleString()}
            sub={`${conv.total ? Math.round((conv.withLead / conv.total) * 100) : 0}% of conversations`}
            tone="positive"
          />
          <StatCard
            label="No contact captured"
            value={conv.withoutContact.toLocaleString()}
            sub={`${conv.total ? Math.round((conv.withoutContact / conv.total) * 100) : 0}% of conversations`}
            tone={conv.withoutContact > 0 ? 'caution' : 'default'}
          />
        </div>

        {conv.byChannel.length > 0 && (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-heading font-semibold mb-2">
              By channel
            </p>
            <BarList
              rows={conv.byChannel.map((c) => ({
                label: c.channel === 'web_chat' ? 'Web chat' : c.channel === 'sms' ? 'SMS' : 'Voice',
                count: c.count,
                share: c.count / Math.max(1, conv.total),
              }))}
              emptyMessage=""
            />
          </div>
        )}
      </section>

      {/* Conversations to review — Tyler's 2026-05-02 ask + David Maros gap 2026-05-08 */}
      {noContact.length > 0 && (
        <section className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 dark:bg-amber-500/5 dark:border-amber-500/20 p-5 lg:p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-navy dark:text-white text-lg">
                Conversations to review
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 max-w-2xl">
                Conversations Claire couldn&apos;t close on her own: ones she
                explicitly flagged or escalated, and ones where the visitor
                started chatting but never shared their name or phone.
                Top of the list is highest priority.
              </p>
            </div>
            <Link
              href="/switchboard/web-chat"
              className="text-xs font-heading font-semibold text-blue hover:text-blue-dark whitespace-nowrap"
            >
              Open Web Chat module →
            </Link>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <tr className="text-left">
                  <th className="px-2 py-2 font-heading font-semibold">When</th>
                  <th className="px-2 py-2 font-heading font-semibold">Reason</th>
                  <th className="px-2 py-2 font-heading font-semibold">Customer</th>
                  <th className="px-2 py-2 font-heading font-semibold">Channel</th>
                  <th className="px-2 py-2 font-heading font-semibold">Msgs</th>
                  <th className="px-2 py-2 font-heading font-semibold">Why / first message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/60 dark:divide-white/10">
                {noContact.map((c) => {
                  const reasonLabel =
                    c.reviewReason === 'emergency'
                      ? { label: 'Emergency', cls: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300' }
                      : c.reviewReason === 'flagged'
                        ? { label: 'Flagged', cls: 'bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300' }
                        : c.reviewReason === 'escalated'
                          ? { label: 'Escalated', cls: 'bg-orange-200 text-orange-900 dark:bg-orange-500/20 dark:text-orange-300' }
                          : { label: 'No contact', cls: 'bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-300' }

                  const customerLabel = c.customerName
                    ? `${c.customerName}${c.customerPhone ? ' · ' + c.customerPhone : ''}`
                    : '(anonymous)'

                  const detailOrFirstMsg = c.reviewDetail || c.firstUserMessage

                  return (
                    <tr key={c.id} className="text-gray-800 dark:text-gray-200 align-top">
                      <td className="px-2 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {shortDate(c.createdAt)}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-heading font-semibold ${reasonLabel.cls}`}>
                          {reasonLabel.label}
                        </span>
                      </td>
                      <td className="px-2 py-3 max-w-xs">
                        <span className="text-gray-800 dark:text-gray-200 break-words">
                          {customerLabel}
                        </span>
                        {c.attributionChannel && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {c.attributionChannel}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {c.channel === 'web_chat' ? 'Web chat' : c.channel === 'sms' ? 'SMS' : 'Voice'}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap tabular-nums">
                        {c.messageCount}
                      </td>
                      <td className="px-2 py-3 max-w-md">
                        <span className="line-clamp-3 text-gray-700 dark:text-gray-300">
                          {truncate(detailOrFirstMsg, 200) || <em className="text-gray-400">(no message)</em>}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {noContact.length === 0 && conv.total > 0 && (
        <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 dark:bg-emerald-500/5 dark:border-emerald-500/20 p-5 lg:p-6">
          <h2 className="font-heading font-bold text-navy dark:text-white text-lg">
            Conversations to review
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Every conversation in this period either captured contact info or booked a lead. Nothing to audit.
          </p>
        </section>
      )}
    </div>
  )
}
