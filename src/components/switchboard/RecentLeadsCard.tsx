import Link from 'next/link'
import { listStoredLeads } from '@/lib/leads-store'
import {
  summarizeStoredLead,
  relativeTime,
  formatPhoneForDisplay,
} from './lead-pipeline-utils'

export default async function RecentLeadsCard() {
  let summaries: ReturnType<typeof summarizeStoredLead>[] = []
  let errored = false
  let weekCount = 0

  try {
    const stored = await listStoredLeads({ limit: 50 })
    summaries = stored.map(summarizeStoredLead)
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    weekCount = summaries.filter(
      (l) => new Date(l.createdAt).getTime() > oneWeekAgo,
    ).length
  } catch {
    errored = true
  }

  const recent = summaries.slice(0, 5)

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0F1C3F] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-gray-100 dark:border-navy-light/40">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-blue dark:text-blue-light/80">
            Recent leads
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {errored
              ? 'Live data unavailable'
              : weekCount > 0
                ? `${weekCount} new this week`
                : 'Mirrored from Housecall Pro'}
          </div>
        </div>
        <Link
          href="/switchboard/lead-pipeline"
          className="text-xs font-semibold text-blue dark:text-blue-light hover:text-blue-dark dark:hover:text-white inline-flex items-center gap-1"
        >
          View all
          <span aria-hidden>→</span>
        </Link>
      </div>

      {errored ? (
        <div className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">
          Couldn&apos;t load recent leads.{' '}
          <Link
            href="/switchboard/lead-pipeline"
            className="text-blue dark:text-blue-light hover:underline"
          >
            Open the Lead Pipeline
          </Link>{' '}
          to retry.
        </div>
      ) : recent.length === 0 ? (
        <div className="px-5 py-6 text-sm text-gray-500 dark:text-gray-400">
          No leads yet. The website form is live at{' '}
          <a
            href="/quote"
            className="text-blue dark:text-blue-light hover:underline"
          >
            tzelectricinc.com/quote
          </a>
          .
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-navy-light/40">
          {recent.map((l) => (
            <li key={l.id}>
              <Link
                href="/switchboard/lead-pipeline"
                className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-navy-light/20 transition-colors"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue/10 dark:bg-blue-light/20 text-blue dark:text-blue-light font-bold flex items-center justify-center text-xs">
                  {l.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <div className="font-semibold text-navy dark:text-white text-sm truncate">
                      {l.fullName}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                      {relativeTime(l.createdAt)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {[
                      l.serviceTag,
                      l.scopeTag,
                      l.phone ? formatPhoneForDisplay(l.phone) : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {l.isActiveLeak && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                        Active leak
                      </span>
                    )}
                    {l.isRenter && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        Renter
                      </span>
                    )}
                    {l.isMedical && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        Medical equipment
                      </span>
                    )}
                    {l.isExistingHcpCustomer && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        Existing customer
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
