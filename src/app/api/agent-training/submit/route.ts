import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  SWITCHBOARD_COOKIE,
  verifySessionToken,
} from '@/lib/switchboard-auth'
import { renderQuestionnaireSubmissionEmail } from '@/lib/email-templates'

const DEFAULT_RECIPIENT = 'cesar@creativequalitymarketing.com'
const DEFAULT_FROM = 'TZ Switchboard <notifications@tzelectricinc.com>'
const DEFAULT_REPLY_TO = 'service@tzelectricinc.com'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SWITCHBOARD_COOKIE)?.value
  let authed = false
  try {
    authed = await verifySessionToken(token)
  } catch {
    authed = false
  }
  if (!authed) {
    return NextResponse.json(
      { ok: false, error: 'Sign in first' },
      { status: 401 },
    )
  }

  let body: { markdown?: string; filledBy?: string; answers?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON' },
      { status: 400 },
    )
  }

  const { markdown, filledBy } = body
  if (
    !markdown ||
    typeof markdown !== 'string' ||
    markdown.trim().length === 0
  ) {
    return NextResponse.json(
      { ok: false, error: 'Missing answers' },
      { status: 400 },
    )
  }

  const totalCount = (markdown.match(/^### /gm) || []).length
  const unansweredCount = (markdown.match(/^_\(no answer\)_/gm) || []).length
  const answeredCount = Math.max(0, totalCount - unansweredCount)

  const email = renderQuestionnaireSubmissionEmail({
    filledBy: filledBy || '',
    markdown,
    answeredCount,
    totalCount,
  })

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.warn(
      '[agent-training/submit] RESEND_API_KEY not set — submission accepted but not emailed',
    )
    return NextResponse.json({ ok: true, delivered: false })
  }

  const fromAddress = process.env.AGENT_TRAINING_FROM_EMAIL || DEFAULT_FROM
  const recipient = process.env.AGENT_TRAINING_TO_EMAIL || DEFAULT_RECIPIENT
  const replyTo = process.env.AGENT_TRAINING_REPLY_TO || DEFAULT_REPLY_TO

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [recipient],
        reply_to: replyTo,
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown')
      console.error('[agent-training/submit] Resend error', res.status, errText)
      return NextResponse.json(
        { ok: false, error: 'Email delivery failed' },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, delivered: true })
  } catch (err) {
    console.error('[agent-training/submit] fetch failed', err)
    return NextResponse.json(
      { ok: false, error: 'Email delivery failed' },
      { status: 502 },
    )
  }
}
