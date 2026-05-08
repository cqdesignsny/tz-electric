/**
 * Office notifications for Claire's tool calls. Without these, Claire's
 * escalations and lead bookings only update database rows — the office
 * has no signal that something happened until they happen to check the
 * Switchboard. Tyler caught this 2026-05-08 with the David Maros
 * conversation: contractor escalation got flagged but no notification
 * fired, and we almost lost a real prospect.
 *
 * Every Claire tool that needs office attention now also fires an
 * immediate email via Resend. SMS paging will layer on top once Twilio
 * A2P 10DLC clears (Tyler can configure DIGEST_PAGER_NUMBER for that).
 */
import { renderEmailLayout } from './email-templates'

const SITE_URL = 'https://tzelectricinc.com'

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getRecipients(): string[] {
  return (
    process.env.LEAD_FORM_TO_EMAILS ||
    'tyler@tzelectricinc.com,terry@tzelectricinc.com,service@tzelectricinc.com,cesar@creativequalitymarketing.com'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY
  const from =
    process.env.AGENT_TRAINING_FROM_EMAIL ||
    'TZ Switchboard <notifications@tzelectricinc.com>'
  const replyTo =
    process.env.AGENT_TRAINING_REPLY_TO || 'service@tzelectricinc.com'
  return { apiKey, from, replyTo }
}

async function sendEmail(args: {
  subject: string
  html: string
  text: string
  to?: string[]
}): Promise<void> {
  const { apiKey, from, replyTo } = getResendConfig()
  const to = args.to ?? getRecipients()
  if (!apiKey || to.length === 0) {
    console.warn('[agent-notifications] No RESEND_API_KEY or recipients, skipping send.')
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: replyTo,
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => 'unknown')
      console.error(`[agent-notifications] Resend ${res.status}: ${errText}`)
    }
  } catch (e) {
    console.error('[agent-notifications] Resend send failed:', e)
  }
}

// ============================================================================
// FLAG FOR OFFICE REVIEW
// ============================================================================

export async function sendOfficeFlagEmail(args: {
  conversationId: string
  channel: 'sms' | 'voice' | 'web_chat'
  reason: string
  priority: 'low' | 'normal' | 'high'
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  attributionChannel: string | null
}): Promise<void> {
  const channelLabel = args.channel === 'web_chat' ? 'Web chat' : args.channel === 'sms' ? 'SMS' : 'Voice'
  const priorityLabel =
    args.priority === 'high' ? 'HIGH' : args.priority === 'low' ? 'Low' : 'Normal'

  const customerLine =
    [
      args.customerName,
      args.customerPhone,
      args.customerEmail,
    ]
      .filter(Boolean)
      .join(' · ') || '(no contact captured)'

  const subject = `[TZ Claire] ${priorityLabel === 'HIGH' ? 'HIGH PRIORITY ' : ''}${channelLabel} flagged: ${args.reason.slice(0, 70)}`

  const bodyHtml = `
    <div style="background:#FEF3C7;border-left:4px solid #D97706;border-radius:8px;padding:16px 18px;margin-bottom:18px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#92400E;font-weight:700;margin-bottom:6px;">${escapeHtml(priorityLabel)} priority</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#78350F;line-height:1.5;">
        Claire flagged this conversation for office review. Reason below.
      </div>
    </div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.7;color:#1E293B;">
      <strong>Customer:</strong> ${escapeHtml(customerLine)}<br />
      <strong>Channel:</strong> ${escapeHtml(channelLabel)}${args.attributionChannel ? ` · ${escapeHtml(args.attributionChannel)}` : ''}<br />
      <strong>Reason:</strong> ${escapeHtml(args.reason)}
    </div>`

  const html = renderEmailLayout({
    preheader: `Claire flagged a ${channelLabel} conversation: ${args.reason.slice(0, 100)}`,
    eyebrow: `Office review — ${priorityLabel}`,
    heading: 'Claire flagged a conversation',
    intro: `${channelLabel} conversation needs office attention. Customer: ${customerLine}.`,
    bodyHtml,
    cta: { label: 'Open conversation in Switchboard', href: `${SITE_URL}/switchboard/web-chat` },
  })

  const text = [
    `[TZ Claire] ${priorityLabel} priority — ${channelLabel} flagged for review`,
    '',
    `Customer: ${customerLine}`,
    `Channel: ${channelLabel}${args.attributionChannel ? ' · ' + args.attributionChannel : ''}`,
    `Reason: ${args.reason}`,
    '',
    `Open conversation: ${SITE_URL}/switchboard/web-chat`,
  ].join('\n')

  await sendEmail({ subject, html, text })
}

// ============================================================================
// ESCALATE EMERGENCY
// ============================================================================

export async function sendEmergencyEscalationEmail(args: {
  conversationId: string
  channel: 'sms' | 'voice' | 'web_chat'
  reason: string
  customerName: string | null
  customerPhone: string
  address: string | null
  attributionChannel: string | null
}): Promise<void> {
  const channelLabel = args.channel === 'web_chat' ? 'Web chat' : args.channel === 'sms' ? 'SMS' : 'Voice'

  const subject = `[TZ EMERGENCY] ${channelLabel}: ${args.reason.slice(0, 90)}`

  const bodyHtml = `
    <div style="background:#FEE2E2;border-left:4px solid #DC2626;border-radius:8px;padding:16px 18px;margin-bottom:18px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#991B1B;font-weight:700;margin-bottom:6px;">EMERGENCY — Action required now</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#7F1D1D;line-height:1.5;">
        Claire flagged this as an emergency. Call the customer back immediately.
      </div>
    </div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.7;color:#1E293B;">
      <strong>Customer:</strong> ${escapeHtml(args.customerName || '(no name captured)')}<br />
      <strong>Phone:</strong> <a href="tel:${escapeHtml(args.customerPhone)}" style="color:#DC2626;font-weight:700;text-decoration:none;">${escapeHtml(args.customerPhone)}</a><br />
      ${args.address ? `<strong>Address:</strong> ${escapeHtml(args.address)}<br />` : ''}
      <strong>Channel:</strong> ${escapeHtml(channelLabel)}${args.attributionChannel ? ` · ${escapeHtml(args.attributionChannel)}` : ''}<br />
      <strong>What's happening:</strong> ${escapeHtml(args.reason)}
    </div>`

  const html = renderEmailLayout({
    preheader: `EMERGENCY — Call ${args.customerPhone} now. ${args.reason.slice(0, 80)}`,
    eyebrow: 'EMERGENCY',
    heading: 'Call this customer right now',
    intro: `Claire flagged a ${channelLabel} conversation as an emergency. Customer phone: ${args.customerPhone}.`,
    bodyHtml,
    cta: { label: `Call ${args.customerPhone}`, href: `tel:${args.customerPhone}` },
  })

  const text = [
    `[TZ EMERGENCY] ${channelLabel}`,
    '',
    `CALL ${args.customerPhone} IMMEDIATELY`,
    '',
    `Customer: ${args.customerName || '(no name)'}`,
    args.address ? `Address: ${args.address}` : '',
    `Channel: ${channelLabel}`,
    `What's happening: ${args.reason}`,
    '',
    `Open conversation: ${SITE_URL}/switchboard/web-chat`,
  ].filter(Boolean).join('\n')

  await sendEmail({ subject, html, text })
}

// ============================================================================
// LEAD CAPTURED VIA CLAIRE
// ============================================================================

export async function sendClaireLeadCapturedEmail(args: {
  conversationId: string
  channel: 'sms' | 'voice' | 'web_chat'
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  serviceLabel: string
  urgency: string | null
  scope: string | null
  address: string | null
  hcpEstimateId: string | null
  hcpCustomerId: string | null
  hcpError: string | null
  attributionChannel: string | null
}): Promise<void> {
  const channelLabel = args.channel === 'web_chat' ? 'Web chat' : args.channel === 'sms' ? 'SMS' : 'Voice'
  const fullName = args.customerName || '(name pending)'
  const subject = `[TZ Claire] New lead via ${channelLabel}: ${args.serviceLabel} — ${fullName}`

  const stats = [
    { label: 'Service', value: args.serviceLabel },
    { label: 'Urgency', value: args.urgency || 'Not specified' },
    { label: 'Channel', value: channelLabel },
  ]

  const errorBlock = args.hcpError
    ? `
    <div style="background:#FEE2E2;border-left:4px solid #DC2626;border-radius:8px;padding:14px 16px;margin-bottom:18px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#991B1B;font-weight:700;margin-bottom:4px;">HCP sync error</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#7F1D1D;line-height:1.5;">
        ${escapeHtml(args.hcpError)}
      </div>
    </div>`
    : ''

  const bodyHtml = `
    ${errorBlock}
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.7;color:#1E293B;">
      <strong>Customer:</strong> ${escapeHtml(fullName)}<br />
      ${args.customerPhone ? `<strong>Phone:</strong> <a href="tel:${escapeHtml(args.customerPhone)}" style="color:#1E40AF;text-decoration:none;font-weight:600;">${escapeHtml(args.customerPhone)}</a><br />` : ''}
      ${args.customerEmail ? `<strong>Email:</strong> ${escapeHtml(args.customerEmail)}<br />` : ''}
      ${args.address ? `<strong>Address:</strong> ${escapeHtml(args.address)}<br />` : ''}
      ${args.scope ? `<strong>Scope:</strong> ${escapeHtml(args.scope)}<br />` : ''}
      ${args.attributionChannel ? `<strong>Attribution:</strong> ${escapeHtml(args.attributionChannel)}<br />` : ''}
      ${args.hcpEstimateId ? `<strong>HCP Estimate:</strong> ${escapeHtml(args.hcpEstimateId)}<br />` : ''}
    </div>
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.6;color:#4B5563;margin-top:16px;">
      Full transcript and qualification answers are in the TZ Switchboard.
    </p>`

  const html = renderEmailLayout({
    preheader: `New lead via ${channelLabel}: ${args.serviceLabel}, ${fullName}.`,
    eyebrow: `Claire — ${channelLabel}`,
    heading: `New lead from ${fullName}`,
    intro: `Claire booked a ${args.serviceLabel} lead via ${channelLabel}. Customer: ${fullName}${args.customerPhone ? `, ${args.customerPhone}` : ''}.`,
    stats,
    bodyHtml,
    cta: { label: 'Open in Switchboard', href: `${SITE_URL}/switchboard/lead-pipeline` },
  })

  const text = [
    `[TZ Claire] New lead via ${channelLabel}`,
    '',
    `Service: ${args.serviceLabel}`,
    `Customer: ${fullName}`,
    args.customerPhone ? `Phone: ${args.customerPhone}` : '',
    args.customerEmail ? `Email: ${args.customerEmail}` : '',
    args.address ? `Address: ${args.address}` : '',
    args.urgency ? `Urgency: ${args.urgency}` : '',
    args.scope ? `Scope: ${args.scope}` : '',
    args.attributionChannel ? `Attribution: ${args.attributionChannel}` : '',
    args.hcpError ? `\nHCP SYNC ERROR: ${args.hcpError}` : '',
    '',
    `Open: ${SITE_URL}/switchboard/lead-pipeline`,
  ].filter(Boolean).join('\n')

  await sendEmail({ subject, html, text })
}
