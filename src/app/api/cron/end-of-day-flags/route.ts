/**
 * End-of-day follow-up recap cron. Wired to run at 21:30 UTC (≈ 5:30 PM ET
 * during EDT) via the `crons` array in vercel.json — after the 4 PM close, so
 * it captures the full day's flags. Sends each flagged employee their own
 * callback list + a master recap to the service inbox. See src/lib/eod-recap.ts.
 *
 * Note: the cron time is fixed UTC, so in EST (winter) this fires at 4:30 PM ET.
 * Adjust the vercel.json schedule if a year-round fixed ET time is wanted.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when the env
 * var is set; we verify before doing any work. Manual fire / backfill:
 * GET /api/cron/end-of-day-flags?date=YYYY-MM-DD with the same Bearer header.
 */
import { NextRequest, NextResponse } from 'next/server'

import { sendEndOfDayRecap } from '@/lib/eod-recap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  const url = new URL(req.url)
  const dateLabel = url.searchParams.get('date') ?? undefined
  const dryRun = url.searchParams.get('dryRun') === '1'

  try {
    const result = await sendEndOfDayRecap({ dateLabel, dryRun })
    console.log('[cron/end-of-day-flags] done:', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/end-of-day-flags] failed:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
