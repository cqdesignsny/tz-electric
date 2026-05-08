/**
 * CSV export for the Reports module. Pulls every lead in the requested
 * window from tz_leads and serves a CSV download. Auth-gated like the
 * rest of the Switchboard via middleware.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rangeFromDays } from '@/lib/reports-queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type LeadRow = {
  id: string
  created_at: string
  source: string
  service_label: string | null
  service_key: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  email: string | null
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  ownership: string | null
  attribution_channel: string | null
  attribution_value_cents: number | null
  estimate_status: string | null
  hcp_estimate_id: string | null
  hcp_customer_id: string | null
  hcp_error: string | null
  referral_source: string | null
}

const HEADERS = [
  'created_at',
  'source',
  'service_label',
  'service_key',
  'first_name',
  'last_name',
  'phone',
  'email',
  'street',
  'city',
  'state',
  'zip',
  'ownership',
  'attribution_channel',
  'attribution_value_dollars',
  'estimate_status',
  'hcp_estimate_id',
  'hcp_customer_id',
  'hcp_error',
  'referral_source',
] as const

function csvCell(v: unknown): string {
  if (v == null) return ''
  const s = typeof v === 'string' ? v : String(v)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const requested = parseInt(url.searchParams.get('days') || '', 10)
  const days = Number.isFinite(requested) && [7, 30, 90].includes(requested) ? requested : 30
  const range = rangeFromDays(days)

  const sql = db()
  const rows = (await sql`
    SELECT
      id, created_at, source, service_label, service_key,
      first_name, last_name, phone, email,
      street, city, state, zip, ownership,
      attribution_channel, attribution_value_cents,
      estimate_status, hcp_estimate_id, hcp_customer_id, hcp_error,
      referral_source
    FROM tz_leads
    WHERE hidden = FALSE
      AND created_at >= ${range.start}
      AND created_at <= ${range.end}
    ORDER BY created_at DESC
  `) as unknown as LeadRow[]

  const lines: string[] = [HEADERS.join(',')]
  for (const r of rows) {
    lines.push(
      [
        r.created_at,
        r.source,
        r.service_label,
        r.service_key,
        r.first_name,
        r.last_name,
        r.phone,
        r.email,
        r.street,
        r.city,
        r.state,
        r.zip,
        r.ownership,
        r.attribution_channel,
        r.attribution_value_cents != null ? (r.attribution_value_cents / 100).toFixed(2) : '',
        r.estimate_status,
        r.hcp_estimate_id,
        r.hcp_customer_id,
        r.hcp_error,
        r.referral_source,
      ]
        .map(csvCell)
        .join(','),
    )
  }
  const body = lines.join('\n')

  const filename = `tz-leads-last-${days}d-${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
