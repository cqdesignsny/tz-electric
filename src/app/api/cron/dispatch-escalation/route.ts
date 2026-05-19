/**
 * After-hours emergency dispatch escalation worker.
 *
 * Runs every 5 minutes via Vercel Cron (`vercel.json`). Walks open
 * dispatches in `tz_emergency_dispatches`, fires the next-due step in
 * the cascade per Tyler's 2026-05-18 SOP (T+15, T+30 with supervisor,
 * T+60 final, then customer "team tied up" callback), and closes the
 * dispatch when the cascade completes without response.
 *
 * Overnight-window dispatches do not enter the cascade — they fire one
 * text each at T+0 inside `dispatchAfterHoursEmergencyImpl` and end.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`.
 */
import { NextRequest, NextResponse } from 'next/server'
import { runEscalationTick } from '@/lib/after-hours-dispatch'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const result = await runEscalationTick()
    return NextResponse.json({
      ok: true,
      processed: result.processed,
      fired: result.fired,
      errors: result.errors,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[cron/dispatch-escalation] tick failed:', e)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
