/**
 * Helpers for the Lead Pipeline view. Reads from tz_leads (Neon) so the
 * TZ Switchboard mirrors exactly what the office sees in Housecall Pro:
 * every form submission persisted with its HCP customer + estimate ids,
 * deep-linking back to HCP from each row.
 */

import {
  findService,
  getQuestionLabel,
  type ServiceConfig,
} from '@/components/forms/lead-form-config'
import type { StoredLead } from '@/lib/leads-store'

const HCP_APP_BASE = 'https://pro.housecallpro.com/app'

export type LeadSummary = {
  id: string
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
  isRenter: boolean
  isActiveLeak: boolean
  isMedical: boolean
  isGoogleAds: boolean
  isExistingHcpCustomer: boolean
  hasHcpEstimate: boolean
  hcpError: string | null
  createdAt: string
  qualification: Array<{ key: string; value: string }>
  customerNotes: string | null
  attribution: Array<{ key: string; value: string }>
  hcpDeepLink: string
  hcpDeepLinkLabel: string
}

function fullNameOrFallback(first: string | null, last: string | null): string {
  const f = (first || '').trim()
  const l = (last || '').trim()
  const joined = `${f} ${l}`.trim()
  return joined || 'Unknown'
}

function initialsFor(first: string | null, last: string | null): string {
  const f = (first || '').trim()
  const l = (last || '').trim()
  const result = `${f.charAt(0)}${l.charAt(0)}`.toUpperCase()
  return result || '?'
}

function buildAttribution(stored: StoredLead): Array<{ key: string; value: string }> {
  const t = stored.tracking || {}
  const out: Array<{ key: string; value: string }> = []
  if (t.gclid) out.push({ key: 'GCLID', value: String(t.gclid) })
  if (t.utmSource) out.push({ key: 'UTM source', value: String(t.utmSource) })
  if (t.utmMedium) out.push({ key: 'UTM medium', value: String(t.utmMedium) })
  if (t.utmCampaign) out.push({ key: 'UTM campaign', value: String(t.utmCampaign) })
  if (t.utmTerm) out.push({ key: 'UTM term', value: String(t.utmTerm) })
  if (t.utmContent) out.push({ key: 'UTM content', value: String(t.utmContent) })
  if (t.landingPage) out.push({ key: 'Landing page', value: String(t.landingPage) })
  if (t.landingAt) out.push({ key: 'Landed at', value: String(t.landingAt) })
  if (stored.referral_source) out.push({ key: 'Heard via', value: stored.referral_source })
  return out
}

function buildQualification(
  stored: StoredLead,
  service: ServiceConfig | undefined,
): Array<{ key: string; value: string }> {
  const q = stored.qualification || {}
  if (!service) {
    return Object.entries(q)
      .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
      .map(([k, v]) => ({ key: k, value: v as string }))
  }
  // Render in service-defined question order so the office reads them in
  // the same flow the customer answered them.
  const out: Array<{ key: string; value: string }> = []
  for (const question of service.questions) {
    const v = q[question.id]
    if (typeof v === 'string' && v.trim().length > 0) {
      out.push({ key: getQuestionLabel(service, question.id), value: v })
    }
  }
  return out
}

function buildDeepLink(stored: StoredLead): { url: string; label: string } {
  if (stored.hcp_estimate_id) {
    return {
      url: `${HCP_APP_BASE}/estimates/${stored.hcp_estimate_id}`,
      label: 'Open estimate in Housecall Pro',
    }
  }
  if (stored.hcp_customer_id) {
    return {
      url: `${HCP_APP_BASE}/customers/${stored.hcp_customer_id}`,
      label: 'Open customer in Housecall Pro',
    }
  }
  return {
    url: `${HCP_APP_BASE}/customers`,
    label: 'Open Housecall Pro',
  }
}

function shorten(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

export function summarizeStoredLead(stored: StoredLead): LeadSummary {
  const service = findService(stored.service_key || undefined)
  const q = stored.qualification || {}

  const isRenter = stored.ownership === 'renter'
  const isActiveLeak = q.urgentNow === 'Yes — active leak'
  const isMedical = q.medical === 'Yes'
  const isGoogleAds = !!stored.tracking?.gclid
  const hasHcpEstimate = !!stored.hcp_estimate_id
  const isExistingHcpCustomer = stored.hcp_customer_existing === true

  const flagTags: string[] = []
  if (isActiveLeak) flagTags.push('Active leak')
  if (isMedical) flagTags.push('Medical equipment')
  if (isRenter) flagTags.push('Renter')
  if (isGoogleAds) flagTags.push('Google Ads')
  if (isExistingHcpCustomer) flagTags.push('Existing customer')
  if (stored.hcp_error) flagTags.push('HCP sync error')

  const serviceTag = stored.service_label || service?.label || null
  const urgencyTag = q.urgency ? shorten(q.urgency, 40) : null
  const scopeTag = q.scope ? shorten(q.scope, 60) : null

  const sourceLabel = (() => {
    switch (stored.source) {
      case 'web_form':
        return 'Web Form'
      case 'sms_agent':
        return 'TZ AI Agent (SMS)'
      case 'voice_agent':
        return 'TZ AI Agent (Voice)'
      case 'web_chat':
        return 'TZ AI Agent (Chat)'
      case 'manual':
        return 'Manual'
      default:
        return null
    }
  })()

  const { url: hcpDeepLink, label: hcpDeepLinkLabel } = buildDeepLink(stored)

  return {
    id: stored.id,
    fullName: fullNameOrFallback(stored.first_name, stored.last_name),
    initials: initialsFor(stored.first_name, stored.last_name),
    email: stored.email,
    phone: stored.phone,
    city: stored.city,
    state: stored.state,
    street: stored.street,
    zip: stored.zip,
    serviceTag,
    urgencyTag,
    scopeTag,
    flagTags,
    source: sourceLabel,
    isRenter,
    isActiveLeak,
    isMedical,
    isGoogleAds,
    isExistingHcpCustomer,
    hasHcpEstimate,
    hcpError: stored.hcp_error,
    createdAt: stored.created_at,
    qualification: buildQualification(stored, service),
    customerNotes: stored.customer_notes,
    attribution: buildAttribution(stored),
    hcpDeepLink,
    hcpDeepLinkLabel,
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
