/**
 * Nightly HCP customer mirror sync. Wired to run at 07:00 UTC (≈ 3 AM ET, just
 * after the 06:00 UTC / 2 AM ET daily analyzer) via the `crons` array in
 * vercel.json. Paginates HCP /customers and upserts every customer into
 * tz_hcp_customers so the voice route can recognize returning callers by name
 * with a single indexed Neon lookup (no live HCP call during the conversation).
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when the env
 * var is set. We verify it before doing any work so the endpoint can't be hit
 * anonymously to burn HCP API quota.
 *
 * Manual fire (e.g. first backfill): GET /api/cron/hcp-customer-sync with the
 * same Bearer header. Add ?maxPages=N to cap the run while testing.
 */
import { NextRequest, NextResponse } from 'next/server'

import { syncHcpCustomers } from '@/lib/hcp-customers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// ~3,600 customers across ~37 paginated round-trips + batched upserts. Comfortably
// under a minute in practice, but bump the ceiling so a slow HCP day can't time out.
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  const url = new URL(req.url)
  const maxPagesParam = url.searchParams.get('maxPages')
  const maxPages = maxPagesParam ? Number(maxPagesParam) : undefined

  try {
    const result = await syncHcpCustomers({ maxPages })
    console.log('[cron/hcp-customer-sync] done:', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/hcp-customer-sync] failed:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
