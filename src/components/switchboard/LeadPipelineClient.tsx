'use client'

import { useMemo, useState } from 'react'
import {
  formatPhoneForDisplay,
  relativeTime,
  type LeadSummary,
} from './lead-pipeline-utils'

type Props = {
  leads: LeadSummary[]
}

type ServiceFilter = 'all' | string
type StatusFilter = 'all' | 'open' | 'won' | 'lost'

export default function LeadPipelineClient({ leads }: Props) {
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
      if (statusFilter !== 'all') {
        const isWon = l.pipelineStatus?.toLowerCase().includes('won') || l.status === 'won'
        const isLost = l.pipelineStatus?.toLowerCase().includes('lost') || !!leadIsLost(l)
        if (statusFilter === 'won' && !isWon) return false
        if (statusFilter === 'lost' && !isLost) return false
        if (statusFilter === 'open' && (isWon || isLost)) return false
      }
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
          l.parsed.customerNotes || '',
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
    const renters = leads.filter((l) => l.isRenter).length
    const activeLeak = leads.filter((l) => l.isActiveLeak).length
    const ads = leads.filter((l) => l.isGoogleAds).length
    return { total, renters, activeLeak, ads }
  }, [leads])

  return (
    <div>
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total leads" value={counts.total} />
        <Stat label="Active leaks" value={counts.activeLeak} accent={counts.activeLeak > 0 ? 'danger' : 'muted'} />
        <Stat label="Renters" value={counts.renters} />
        <Stat label="Google Ads" value={counts.ads} />
      </div>

      {/* Filters */}
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
      </div>

      {/* List */}
      {leads.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-navy-light/50 p-10 text-center text-sm text-gray-500 dark:text-gray-400">
          No leads match your filters.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
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
      )}

      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        Showing {filtered.length} of {leads.length} leads
      </div>
    </div>
  )
}

function leadIsLost(l: LeadSummary): boolean {
  // HCP returns lost_at on the lead, not always reflected in status. We only
  // have summary fields; treat pipelineStatus 'Lost' as lost.
  return (l.pipelineStatus || '').toLowerCase() === 'lost'
}

function Stat({
  label,
  value,
  accent = 'default',
}: {
  label: string
  value: number
  accent?: 'default' | 'muted' | 'danger'
}) {
  const tone =
    accent === 'danger' && value > 0
      ? 'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40'
      : accent === 'muted'
        ? 'border-gray-200 dark:border-navy-light/40 bg-gray-50 dark:bg-[#0A1128]'
        : 'border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0F1C3F]'

  const num =
    accent === 'danger' && value > 0
      ? 'text-red-700 dark:text-red-300'
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
  const accentBorder = lead.isActiveLeak
    ? 'border-red-400 dark:border-red-700'
    : lead.isRenter
      ? 'border-amber-300 dark:border-amber-700'
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
              #{lead.number} · {relativeTime(lead.createdAt)}
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
                  t === 'Active leak'
                    ? 'danger'
                    : t === 'Medical equipment' || t === 'Renter'
                      ? 'warning'
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
        {/* Contact + address */}
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
        </div>

        {/* Qualification + property + attribution */}
        <div>
          {lead.parsed.qualification.length > 0 && (
            <>
              <SectionLabel>Qualification</SectionLabel>
              <KVList
                items={lead.parsed.qualification.map((q) => ({
                  k: q.key,
                  v: q.value,
                }))}
              />
            </>
          )}

          {lead.parsed.customerNotes && (
            <div className="mt-5">
              <SectionLabel>Customer notes</SectionLabel>
              <div className="rounded-lg bg-gray-50 dark:bg-[#0A1128] border border-gray-200 dark:border-navy-light/40 p-3 text-sm text-navy dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
                {lead.parsed.customerNotes}
              </div>
            </div>
          )}

          {lead.parsed.property.length > 0 && (
            <div className="mt-5">
              <SectionLabel>Property</SectionLabel>
              <KVList
                items={lead.parsed.property.map((p) => ({ k: p.key, v: p.value }))}
              />
            </div>
          )}

          {lead.parsed.attribution.length > 0 && (
            <div className="mt-5">
              <SectionLabel>Attribution</SectionLabel>
              <KVList
                items={lead.parsed.attribution.map((a) => ({ k: a.key, v: a.value }))}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-navy-light/40">
        <a
          href={lead.hcpInboxUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent text-white text-xs font-bold px-4 py-2 hover:bg-accent-dark transition-colors"
        >
          Open in Housecall Pro
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
        <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500 font-mono self-center">
          HCP Lead {lead.id}
        </span>
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
  tone: 'service' | 'urgency' | 'scope' | 'danger' | 'warning' | 'neutral'
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
