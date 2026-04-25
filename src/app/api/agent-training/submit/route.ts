import { NextResponse } from 'next/server'

const RECIPIENT = 'cesar@creativequalitymarketing.com'

export async function POST(request: Request) {
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
  if (!markdown || typeof markdown !== 'string' || markdown.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Missing answers' },
      { status: 400 },
    )
  }

  const resendKey = process.env.RESEND_API_KEY
  const subject = `TZ Agent Training submitted${filledBy ? ` by ${filledBy}` : ''}`

  if (!resendKey) {
    console.warn(
      '[agent-training/submit] RESEND_API_KEY not set — submission accepted but not emailed',
    )
    console.log('[agent-training/submit] Submission preview:', subject)
    return NextResponse.json({ ok: true, delivered: false })
  }

  const fromAddress =
    process.env.AGENT_TRAINING_FROM_EMAIL ||
    'TZ Switchboard <onboarding@resend.dev>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [RECIPIENT],
        subject,
        text: markdown,
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
