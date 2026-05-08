/**
 * Daily digest cron handler. Wired to run at 12:00 UTC daily via the
 * `crons` array in vercel.json (≈ 7-8 AM ET depending on DST). Builds
 * yesterday's lead + Claire conversation summary and emails it to the
 * office.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when
 * the `CRON_SECRET` env var is set. We verify before doing any work.
 *
 * Manual fire (for testing): GET /api/cron/daily-digest with the same
 * Authorization header from a trusted source.
 */
import { NextRequest, NextResponse } from 'next/server'
import {
  rangeForYesterday,
  getHeadlineStats,
  getChannelBreakdown,
  getServiceMix,
  getConversationStats,
  getNoContactConversations,
} from '@/lib/reports-queries'
import { renderDailyDigestEmail } from '@/lib/digest-email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // Auth check. Vercel Cron sets `Authorization: Bearer <CRON_SECRET>`.
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  const range = rangeForYesterday()
  const forDate = new Date(range.start)

  const [headline, channels, services, conversations, noContact] = await Promise.all([
    getHeadlineStats(range),
    getChannelBreakdown(range),
    getServiceMix(range),
    getConversationStats(range),
    getNoContactConversations(range, 25),
  ])

  // Skip the email entirely if yesterday had nothing to report. The
  // office shouldn't get noise on weekends or quiet days.
  if (headline.totalLeads === 0 && conversations.total === 0) {
    return NextResponse.json({
      ok: true,
      sent: false,
      reason: 'No activity yesterday, skipping digest.',
      range,
    })
  }

  const { subject, html, text } = renderDailyDigestEmail({
    forDate,
    headline,
    channels,
    services,
    conversations,
    noContact,
  })

  const apiKey = process.env.RESEND_API_KEY
  const fromAddress =
    process.env.DIGEST_FROM_EMAIL ||
    process.env.AGENT_TRAINING_FROM_EMAIL ||
    'TZ Switchboard <notifications@tzelectricinc.com>'
  const replyTo =
    process.env.DIGEST_REPLY_TO ||
    process.env.AGENT_TRAINING_REPLY_TO ||
    'service@tzelectricinc.com'

  // Default recipients: Tyler, Terry, Cesar. Override per-environment with
  // DIGEST_TO_EMAILS env var (comma-separated).
  const recipients = (
    process.env.DIGEST_TO_EMAILS ||
    'tyler@tzelectricinc.com,terry@tzelectricinc.com,cesar@creativequalitymarketing.com'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (!apiKey || recipients.length === 0) {
    return NextResponse.json({
      ok: false,
      sent: false,
      reason: !apiKey ? 'RESEND_API_KEY not set' : 'No recipients configured',
    }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipients,
        reply_to: replyTo,
        subject,
        html,
        text,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown')
      console.error('[daily-digest] Resend non-2xx', res.status, errText)
      return NextResponse.json({
        ok: false,
        sent: false,
        reason: `Resend ${res.status}: ${errText}`,
      }, { status: 502 })
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[daily-digest] Resend send failed:', message)
    return NextResponse.json({ ok: false, sent: false, reason: message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    sent: true,
    range,
    recipients,
    summary: {
      totalLeads: headline.totalLeads,
      webFormLeads: headline.webFormLeads,
      agentLeads: headline.agentLeads,
      conversationsTotal: conversations.total,
      noContactCount: noContact.length,
    },
  })
}
