'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  formatPhoneForDisplay,
  relativeTime,
  type LeadSummary,
} from './lead-pipeline-utils'

const PAGE_SIZE = 15

type Props = {
  leads: LeadSummary[]
  lastSyncedAt: string | null
}

type ServiceFilter = 'all' | string
type StatusFilter = 'all' | 'open' | 'won' | 'lost'

export default function LeadPipelineClient({ leads, lastSyncedAt }: Props) {
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  const services = useMemo(() => {
    const set = new Set<string>()
    leads.forEach((l) => {
      if (l.serviceTag) set.add(l.serviceTag)
    })
    return Array.from(set).sort()
  }, [leads])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return leads.filter((l) => {
      if (serviceFilter !== 'all' && l.serviceTag !== serviceFilter) return false
      if (statusFilter !== 'all' && l.estimateStatus !== statusFilter) return false
      if (q) {
        const hay = [
          l.fullName,
          l.email || '',
          l.phone || '',
          l.serviceTag || '',
          l.scopeTag || '',
          l.urgencyTag || '',
          l.city || '',
          l.zip || '',
          l.customerNotes || '',
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [leads, serviceFilter, statusFilter, search])

  const counts = useMemo(() => {
    const total = leads.length
    const open = leads.filter((l) => l.estimateStatus === 'open').length
    const won = leads.filter((l) => l.estimateStatus === 'won').length
    const lost = leads.filter((l) => l.estimateStatus === 'lost').length
    const renters = leads.filter((l) => l.isRenter).length
    const activeLeak = leads.filter((l) => l.isActiveLeak).length
    return { total, open, won, lost, renters, activeLeak }
  }, [leads])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  )

  useEffect(() => {
    setPage(1)
  }, [serviceFilter, statusFilter, search])

  async function refreshStatuses() {
    setRefreshing(true)
    setRefreshError(null)
    try {
      const res = await fetch('/api/leads/sync-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true, limit: 100 }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || `Sync failed (${res.status})`)
      }
      // Force a server re-render so we see the updated estimate_status
      // values. Simplest approach is a soft reload.
      window.location.reload()
    } catch (e) {
      setRefreshing(false)
      setRefreshError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
        <Stat label="Total" value={counts.total} />
        <Stat label="Open" value={counts.open} />
        <Stat label="Won" value={counts.won} accent={counts.won > 0 ? 'success' : 'muted'} />
        <Stat label="Lost" value={counts.lost} accent="muted" />
        <Stat
          label="Active leaks"
          value={counts.activeLeak}
          accent={counts.activeLeak > 0 ? 'danger' : 'muted'}
        />
      </div>

      <div className="flex items-center justify-between gap-3 mb-5 text-xs text-gray-500 dark:text-gray-400">
        <div>
          {lastSyncedAt
            ? `HCP statuses synced ${relativeTime(lastSyncedAt)}`
            : 'HCP status sync not run yet'}
          {refreshError && (
            <span className="ml-2 text-red-600 dark:text-red-400">
              · {refreshError}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={refreshStatuses}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 dark:border-navy-light/60 px-3 py-1.5 text-xs font-semibold text-navy dark:text-white hover:border-blue hover:text-blue disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {refreshing ? 'Refreshing…' : 'Refresh statuses'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, scope, city, zip…"
            className="w-full rounded-xl border border-gray-300 dark:border-navy-light/60 bg-white dark:bg-[#0F1C3F] px-4 py-2.5 text-sm text-navy dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-xl border border-gray-300 dark:border-navy-light/60 bg-white dark:bg-[#0F1C3F] px-3 py-2.5 text-sm text-navy dark:text-white focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="rounded-xl border border-gray-300 dark:border-navy-light/60 bg-white dark:bg-[#0F1C3F] px-3 py-2.5 text-sm text-navy dark:text-white focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
        >
          <option value="all">All services</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {leads.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-navy-light/50 p-10 text-center text-sm text-gray-500 dark:text-gray-400">
          No leads match your filters.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                expanded={expandedId === lead.id}
                onToggle={() =>
                  setExpandedId((cur) => (cur === lead.id ? null : lead.id))
                }
              />
            ))}
          </div>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={(p) => {
              setPage(p)
              setExpandedId(null)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            shownStart={(safePage - 1) * PAGE_SIZE + 1}
            shownEnd={Math.min(safePage * PAGE_SIZE, filtered.length)}
            totalShown={filtered.length}
            totalAll={leads.length}
          />
        </>
      )}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
  shownStart,
  shownEnd,
  totalShown,
  totalAll,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
  shownStart: number
  shownEnd: number
  totalShown: number
  totalAll: number
}) {
  const pages = paginationRange(page, totalPages)

  return (
    <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Showing <span className="font-semibold text-navy dark:text-white">{shownStart}–{shownEnd}</span>{' '}
        of <span className="font-semibold text-navy dark:text-white">{totalShown}</span>
        {totalShown !== totalAll && (
          <span className="text-gray-400 dark:text-gray-500"> (filtered from {totalAll})</span>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <PageButton
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
            ariaLabel="Previous page"
          >
            ←
          </PageButton>
          {pages.map((p, i) =>
            p === '…' ? (
              <span
                key={`gap-${i}`}
                className="px-2 text-xs text-gray-400 dark:text-gray-500"
                aria-hidden
              >
                …
              </span>
            ) : (
              <PageButton
                key={p}
                active={p === page}
                onClick={() => onChange(p)}
                ariaLabel={`Page ${p}`}
              >
                {p}
              </PageButton>
            ),
          )}
          <PageButton
            disabled={page >= totalPages}
            onClick={() => onChange(page + 1)}
            ariaLabel="Next page"
          >
            →
          </PageButton>
        </nav>
      )}
    </div>
  )
}

function PageButton({
  children,
  onClick,
  active,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  disabled?: boolean
  ariaLabel?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={[
        'min-w-[36px] h-9 px-2 text-xs font-semibold rounded-lg border transition-colors',
        active
          ? 'bg-blue text-white border-blue dark:bg-blue-light dark:border-blue-light dark:text-navy'
          : 'bg-white dark:bg-[#0F1C3F] text-navy dark:text-white border-gray-200 dark:border-navy-light/60 hover:border-blue hover:text-blue dark:hover:border-blue-light dark:hover:text-blue-light',
        disabled ? 'opacity-40 cursor-not-allowed hover:border-gray-200 dark:hover:border-navy-light/60' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function paginationRange(page: number, total: number): Array<number | '…'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const result: Array<number | '…'> = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)
  if (start > 2) result.push('…')
  for (let i = start; i <= end; i++) result.push(i)
  if (end < total - 1) result.push('…')
  result.push(total)
  return result
}

function Stat({
  label,
  value,
  accent = 'default',
}: {
  label: string
  value: number
  accent?: 'default' | 'muted' | 'danger' | 'success'
}) {
  const tone =
    accent === 'danger' && value > 0
      ? 'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40'
      : accent === 'success' && value > 0
        ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40'
        : accent === 'muted'
          ? 'border-gray-200 dark:border-navy-light/40 bg-gray-50 dark:bg-[#0A1128]'
          : 'border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0F1C3F]'

  const num =
    accent === 'danger' && value > 0
      ? 'text-red-700 dark:text-red-300'
      : accent === 'success' && value > 0
        ? 'text-emerald-700 dark:text-emerald-300'
        : 'text-navy dark:text-white'

  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold ${num}`}>{value}</div>
    </div>
  )
}

function LeadCard({
  lead,
  expanded,
  onToggle,
}: {
  lead: LeadSummary
  expanded: boolean
  onToggle: () => void
}) {
  const accentBorder = lead.estimateStatus === 'won'
    ? 'border-emerald-300 dark:border-emerald-700'
    : lead.estimateStatus === 'lost'
      ? 'border-gray-200 dark:border-navy-light/40 opacity-75'
      : lead.isActiveLeak
        ? 'border-red-400 dark:border-red-700'
        : lead.isRenter
          ? 'border-amber-300 dark:border-amber-700'
          : lead.hcpError
            ? 'border-orange-300 dark:border-orange-700'
            : 'border-gray-200 dark:border-navy-light/40'

  return (
    <div
      className={`rounded-2xl border ${accentBorder} bg-white dark:bg-[#0F1C3F] overflow-hidden transition-shadow ${expanded ? 'shadow-lg shadow-navy/10 dark:shadow-black/30' : 'hover:shadow-md'}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full text-left px-4 py-4 sm:px-5 sm:py-5 flex items-start gap-4"
      >
        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue dark:bg-blue-light text-white font-bold flex items-center justify-center text-sm">
          {lead.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="font-bold text-navy dark:text-white text-base">
              {lead.fullName}
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {relativeTime(lead.createdAt)}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {[
              lead.phone ? formatPhoneForDisplay(lead.phone) : null,
              lead.email,
              lead.city ? `${lead.city}${lead.state ? `, ${lead.state}` : ''}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {lead.serviceTag && (
              <Tag tone="service">{lead.serviceTag}</Tag>
            )}
            {lead.urgencyTag && (
              <Tag tone="urgency">Urgency: {lead.urgencyTag}</Tag>
            )}
            {lead.scopeTag && <Tag tone="scope">{lead.scopeTag}</Tag>}
            {lead.flagTags.map((t) => (
              <Tag
                key={t}
                tone={
                  t === 'Active leak' || t === 'HCP sync error'
                    ? 'danger'
                    : t === 'Won'
                      ? 'success'
                      : t === 'Lost'
                        ? 'neutral'
                        : t === 'Medical equipment' || t === 'Renter'
                          ? 'warning'
                          : t.startsWith('Existing customer')
                            ? 'success'
                            : 'neutral'
                }
              >
                {t}
              </Tag>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 self-center">
          <span
            className={`text-gray-400 dark:text-gray-500 transition-transform inline-block ${expanded ? 'rotate-180' : ''}`}
            aria-hidden
          >
            ▾
          </span>
        </div>
      </button>

      {expanded && <LeadDetail lead={lead} />}
    </div>
  )
}

function LeadDetail({ lead }: { lead: LeadSummary }) {
  return (
    <div className="px-4 pb-5 sm:px-5 border-t border-gray-100 dark:border-navy-light/40 pt-5">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <SectionLabel>Contact</SectionLabel>
          <KVList
            items={[
              { k: 'Name', v: lead.fullName },
              { k: 'Phone', v: lead.phone ? formatPhoneForDisplay(lead.phone) : '(not provided)', href: lead.phone ? `tel:${lead.phone}` : undefined },
              { k: 'Email', v: lead.email || '(not provided)', href: lead.email ? `mailto:${lead.email}` : undefined },
            ]}
          />
          <div className="mt-5">
            <SectionLabel>Service address</SectionLabel>
            <KVList
              items={[
                { k: 'Street', v: lead.street || '(not provided)' },
                {
                  k: 'City / State / Zip',
                  v:
                    [lead.city, lead.state, lead.zip].filter(Boolean).join(', ') ||
                    '(not provided)',
                },
              ]}
            />
          </div>

          <div className="mt-5">
            <SectionLabel>HCP routing</SectionLabel>
            <KVList
              items={[
                {
                  k: 'Customer',
                  v: lead.isExistingHcpCustomer
                    ? `Existing${lead.matchedVia ? ` (matched by ${lead.matchedVia})` : ''}`
                    : 'New (created from this submission)',
                },
                {
                  k: 'Estimate',
                  v: lead.hasHcpEstimate
                    ? `${lead.estimateStatus.toUpperCase()}${lead.estimateStatusRaw ? ` · ${lead.estimateStatusRaw}` : ''}`
                    : '(not created)',
                },
              ]}
            />
          </div>

          {lead.source && (
            <div className="mt-5">
              <SectionLabel>Source</SectionLabel>
              <KVList items={[{ k: 'Channel', v: lead.source }]} />
            </div>
          )}
        </div>

        <div>
          {lead.qualification.length > 0 && (
            <>
              <SectionLabel>Qualification</SectionLabel>
              <KVList items={lead.qualification.map((q) => ({ k: q.key, v: q.value }))} />
            </>
          )}

          {lead.customerNotes && (
            <div className="mt-5">
              <SectionLabel>Customer notes</SectionLabel>
              <div className="rounded-lg bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-navy-light/40 p-3 text-sm text-navy dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                {lead.customerNotes}
              </div>
            </div>
          )}

          {lead.attribution.length > 0 && (
            <div className="mt-5">
              <SectionLabel>Attribution</SectionLabel>
              <KVList items={lead.attribution.map((a) => ({ k: a.key, v: a.value }))} />
            </div>
          )}
        </div>
      </div>

      {lead.hcpError && (
        <div className="mt-5 rounded-xl border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/40 p-4 text-sm text-orange-900 dark:text-orange-200">
          <div className="font-bold mb-1">HCP sync error</div>
          <code className="text-xs font-mono break-all">{lead.hcpError}</code>
          <p className="text-xs mt-2 text-orange-800 dark:text-orange-300">
            The lead is saved here. The estimate did not make it into Housecall Pro.
            Reach out to the customer directly and re-create the estimate manually.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-navy-light/40">
        <a
          href={lead.hcpDeepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent text-white text-xs font-bold px-4 py-2 hover:bg-accent-dark transition-colors"
        >
          {lead.hcpDeepLinkLabel}
          <span aria-hidden>↗</span>
        </a>
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue text-white text-xs font-bold px-4 py-2 hover:bg-blue-dark transition-colors"
          >
            Call {formatPhoneForDisplay(lead.phone)}
          </a>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#0F1C3F] border border-gray-300 dark:border-navy-light/60 text-navy dark:text-white text-xs font-bold px-4 py-2 hover:border-blue transition-colors"
          >
            Email
          </a>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider font-bold text-blue dark:text-blue-light/80 mb-2">
      {children}
    </div>
  )
}

function KVList({
  items,
}: {
  items: Array<{ k: string; v: string; href?: string }>
}) {
  return (
    <dl className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 text-sm">
          <dt className="w-32 flex-shrink-0 text-gray-500 dark:text-gray-400 font-medium">
            {item.k}
          </dt>
          <dd className="text-navy dark:text-gray-100 break-words min-w-0">
            {item.href ? (
              <a
                href={item.href}
                className="text-blue dark:text-blue-light hover:underline"
              >
                {item.v}
              </a>
            ) : (
              item.v
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Tag({
  children,
  tone,
}: {
  children: React.ReactNode
  tone: 'service' | 'urgency' | 'scope' | 'danger' | 'warning' | 'success' | 'neutral'
}) {
  const styles = {
    service:
      'bg-blue/10 text-blue dark:bg-blue-light/20 dark:text-blue-light border border-blue/20 dark:border-blue-light/30',
    urgency:
      'bg-gray-100 text-gray-700 dark:bg-navy-light/40 dark:text-gray-200 border border-gray-200 dark:border-navy-light/60',
    scope:
      'bg-blue-light/10 text-blue-dark dark:bg-blue-light/15 dark:text-blue-light border border-blue-light/20 dark:border-blue-light/25',
    danger:
      'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900/60',
    warning:
      'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60',
    success:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60',
    neutral:
      'bg-gray-100 text-gray-700 dark:bg-navy-light/40 dark:text-gray-200 border border-gray-200 dark:border-navy-light/60',
  } as const

  return (
    <span
      className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${styles[tone]}`}
    >
      {children}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 dark:border-navy-light/50 p-10 text-center">
      <div className="text-base font-semibold text-navy dark:text-white mb-1">
        No leads yet
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
        Once a customer submits the website form or an AI agent captures
        a lead, it&apos;ll appear here in real time.
      </p>
    </div>
  )
}
