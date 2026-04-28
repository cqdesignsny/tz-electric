/**
 * Helpers for the Lead Pipeline view. Pulls structure out of the
 * customer.notes blob the lead form writes (see
 * src/app/api/leads/submit/route.ts buildLeadNotes).
 *
 * v1 reads from HCP. The long-term path replaces this with structured
 * fields from our own DB (see HANDOFF.md "What's NOT built").
 */

import type { HCPLead } from '@/lib/housecall-pro'

export type ParsedLeadNotes = {
  flags: string[]
  service: string | null
  qualification: Array<{ key: string; value: string }>
  customerNotes: string | null
  property: Array<{ key: string; value: string }>
  attribution: Array<{ key: string; value: string }>
  raw: string
}

const SECTION_RE = /^---\s*(.+?)\s*---$/
const FLAG_RE = /^\[(.+?)\]$/
const KV_RE = /^([A-Za-z][\w\s/-]*?):\s*(.*)$/
const BANNER_RE = /^={3,}|WEBSITE LEAD/i

export function parseLeadNotes(notes: string | null | undefined): ParsedLeadNotes {
  const empty: ParsedLeadNotes = {
    flags: [],
    service: null,
    qualification: [],
    customerNotes: null,
    property: [],
    attribution: [],
    raw: notes || '',
  }
  if (!notes) return empty

  const result: ParsedLeadNotes = { ...empty, raw: notes }
  let section = 'header'
  const lines = notes.split('\n')

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    if (BANNER_RE.test(line)) continue

    const sectionMatch = line.match(SECTION_RE)
    if (sectionMatch) {
      section = sectionMatch[1].toLowerCase()
      continue
    }

    const flagMatch = line.match(FLAG_RE)
    if (flagMatch) {
      result.flags.push(flagMatch[1])
      continue
    }

    if (section === 'header' && line.toLowerCase().startsWith('service:')) {
      result.service = line.replace(/^service:\s*/i, '')
      continue
    }

    const kvMatch = line.match(KV_RE)

    if (section === 'qualification') {
      if (kvMatch) result.qualification.push({ key: kvMatch[1], value: kvMatch[2] })
      continue
    }
    if (section === 'property') {
      if (kvMatch) result.property.push({ key: kvMatch[1], value: kvMatch[2] })
      continue
    }
    if (section === 'attribution') {
      if (kvMatch) result.attribution.push({ key: kvMatch[1], value: kvMatch[2] })
      continue
    }
    if (section === 'customer notes') {
      result.customerNotes = result.customerNotes
        ? `${result.customerNotes}\n${line}`
        : line
      continue
    }
  }

  return result
}

export type LeadSummary = {
  id: string
  number: number
  fullName: string
  initials: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  street: string | null
  zip: string | null
  serviceTag: string | null
  urgencyTag: string | null
  scopeTag: string | null
  flagTags: string[]
  source: string | null
  status: string
  pipelineStatus: string | null
  isRenter: boolean
  isActiveLeak: boolean
  isMedical: boolean
  isGoogleAds: boolean
  createdAt: string
  parsed: ParsedLeadNotes
  hcpInboxUrl: string
}

const HCP_INBOX_URL = 'https://pro.housecallpro.com/app/job_inbox'

export function summarizeLead(lead: HCPLead): LeadSummary {
  const first = lead.customer.first_name?.trim() || ''
  const last = lead.customer.last_name?.trim() || ''
  const fullName = `${first} ${last}`.trim() || 'Unknown'
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?'

  let serviceTag: string | null = null
  let urgencyTag: string | null = null
  let scopeTag: string | null = null
  const flagTags: string[] = []
  let source: string | null = null
  let isRenter = false
  let isActiveLeak = false
  let isMedical = false
  let isGoogleAds = false

  for (const tag of lead.tags) {
    if (tag.startsWith('Service:')) serviceTag = tag.replace(/^Service:\s*/, '')
    else if (tag.startsWith('Urgency:')) urgencyTag = tag.replace(/^Urgency:\s*/, '')
    else if (tag === 'Web Form') source = 'Web Form'
    else if (tag === 'TZ AI AGENT') source = 'TZ AI Agent'
    else if (tag === 'Renter - Verify with Landlord' || tag.startsWith('Renter')) {
      isRenter = true
      flagTags.push('Renter')
    } else if (tag === 'ACTIVE LEAK') {
      isActiveLeak = true
      flagTags.push('Active leak')
    } else if (tag === 'Medical Equipment in Home') {
      isMedical = true
      flagTags.push('Medical equipment')
    } else if (tag === 'Google Ads') {
      isGoogleAds = true
      flagTags.push('Google Ads')
    } else if (!tag.startsWith('Service:') && !tag.startsWith('Urgency:') && tag !== 'Web Form' && tag !== 'TZ AI AGENT') {
      // Treat any other tag as the scope answer (e.g. "Whole-house rewire")
      if (!scopeTag) scopeTag = tag
    }
  }

  const parsed = parseLeadNotes(lead.customer.notes)
  if (!serviceTag && parsed.service) serviceTag = parsed.service.replace(/\s*\([\w-]+\)$/, '')

  return {
    id: lead.id,
    number: lead.number,
    fullName,
    initials,
    email: lead.customer.email,
    phone: lead.customer.mobile_number,
    city: lead.address?.city ?? null,
    state: lead.address?.state ?? null,
    street: lead.address?.street ?? null,
    zip: lead.address?.zip ?? null,
    serviceTag,
    urgencyTag,
    scopeTag,
    flagTags,
    source,
    status: lead.status || 'open',
    pipelineStatus: lead.pipeline_status,
    isRenter,
    isActiveLeak,
    isMedical,
    isGoogleAds,
    createdAt: lead.customer.created_at,
    parsed,
    hcpInboxUrl: HCP_INBOX_URL,
  }
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMs = now - then
  const sec = Math.round(diffMs / 1000)
  const min = Math.round(sec / 60)
  const hr = Math.round(min / 60)
  const day = Math.round(hr / 24)

  if (sec < 45) return 'just now'
  if (min < 60) return `${min}m ago`
  if (hr < 24) return `${hr}h ago`
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatPhoneForDisplay(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 10) return phone
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}
