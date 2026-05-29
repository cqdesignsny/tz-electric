/**
 * End-of-day follow-up recap cron. Sends each flagged employee their own
 * callback list + a master recap to the service inbox. See src/lib/eod-recap.ts.
 *
 * Timing: fires at 6:00 PM EASTERN year-round (DST-proof). Vercel crons run on
 * fixed UTC and don't shift with daylight saving, so vercel.json schedules this
 * at BOTH 22:00 and 23:00 UTC daily and we gate below to only send when it's
 * actually 6 PM in America/New_York:
 *   - EDT (summer): 22:00 UTC = 6 PM ET → send; 23:00 UTC = 7 PM ET → skip.
 *   - EST (winter): 22:00 UTC = 5 PM ET → skip; 23:00 UTC = 6 PM ET → send.
 * Net effect: exactly one send per day at 6 PM Eastern.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when the env
 * var is set; we verify before doing any work. Manual fire / backfill (bypasses
 * the 6 PM gate): GET /api/cron/end-of-day-flags?date=YYYY-MM-DD (or ?dryRun=1,
 * or ?force=1) with the same Bearer header.
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
  const force = url.searchParams.get('force') === '1'

  // 6 PM Eastern gate (DST-proof). The scheduled job fires at both 22:00 and
  // 23:00 UTC; only the one that is 6 PM ET right now proceeds. Manual fires
  // (?date / ?dryRun / ?force) bypass the gate.
  const isManual = Boolean(dateLabel) || dryRun || force
  if (!isManual) {
    const etHour = Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false,
      }).format(new Date()),
    )
    if (etHour !== 18) {
      return NextResponse.json({ ok: true, skipped: true, reason: `not 6 PM ET (currently ${etHour}:00 ET)` })
    }
  }

  try {
    const result = await sendEndOfDayRecap({ dateLabel, dryRun })
    console.log('[cron/end-of-day-flags] done:', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/end-of-day-flags] failed:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
