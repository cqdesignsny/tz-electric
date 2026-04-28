import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { syncEstimateStatuses } from '@/lib/lead-status-sync'
import { SWITCHBOARD_COOKIE, verifySessionToken } from '@/lib/switchboard-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Manual estimate-status sync. Hit by the "Refresh statuses" button on
 * /switchboard/lead-pipeline (auth-gated via the Switchboard cookie) and,
 * optionally, by a Vercel cron job that signs requests with CRON_SECRET.
 */
async function handle(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization') || ''
  const isCron = !!cronSecret && authHeader === `Bearer ${cronSecret}`

  if (!isCron) {
    const cookieStore = await cookies()
    const token = cookieStore.get(SWITCHBOARD_COOKIE)?.value
    let authed = false
    try {
      authed = await verifySessionToken(token)
    } catch {
      authed = false
    }
    if (!authed) {
      return NextResponse.json({ ok: false, error: 'Sign in first' }, { status: 401 })
    }
  }

  let body: { force?: boolean; limit?: number } = {}
  try {
    body = (await req.json()) as { force?: boolean; limit?: number }
  } catch {
    body = {}
  }

  const result = await syncEstimateStatuses({
    staleThresholdMs: body.force === true ? 0 : undefined,
    limit: typeof body.limit === 'number' ? body.limit : undefined,
  })

  return NextResponse.json({ ok: true, result })
}

export async function POST(req: NextRequest) {
  return handle(req)
}

export async function GET(req: NextRequest) {
  return handle(req)
}
