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

export const SITE_URL = 'https://tzelectricinc.com'

export function escapeHtml(input: string): string {
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

export async function sendEmail(args: {
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

// ============================================================================
// CLAIRE DAILY SELF-IMPROVEMENT REPORT
// ============================================================================

import type { ClaireProposals } from './claire-self-improvement'

type DailyAnalysisEmailArgs = {
  dateLabel: string
  metrics: {
    voice_count: number
    web_chat_count: number
    sms_count: number
    lead_form_count: number
    total_leads: number
    escalation_count: number
    emergency_dispatch_count: number
    silence_timeout_count: number
    extras: {
      stall_phrase_calls: number
      repeated_phrase_calls: number
      leads_with_hcp_errors: number
      avg_conversation_messages: number
    }
  }
  proposals: ClaireProposals
}

/**
 * Render Claire's daily self-improvement digest. Two outputs (html, text)
 * + subject. Sent at 2 AM ET to Tyler + Cesar.
 *
 * Phase 1: observation only. Tyler reads proposals + approves manually
 * via /switchboard/knowledge-base or by replying to this email. Phase 2
 * adds an approval UI inside the Switchboard.
 */
export function renderClaireDailyAnalysisEmail(args: DailyAnalysisEmailArgs): {
  subject: string
  html: string
  text: string
} {
  const { dateLabel, metrics, proposals } = args
  const subject = `Claire's daily learning report · ${dateLabel}`

  const statsRow = [
    { label: 'Voice', value: String(metrics.voice_count) },
    { label: 'Web chat', value: String(metrics.web_chat_count) },
    { label: 'Lead form', value: String(metrics.lead_form_count) },
    { label: 'Leads', value: String(metrics.total_leads) },
  ]

  const listBlock = (
    title: string,
    items: string[],
    emptyMsg = '(none worth flagging)',
  ): string => {
    if (items.length === 0) {
      return `<h3 style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#0F1C3F;margin:24px 0 8px;">${escapeHtml(title)}</h3>
        <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#6B7280;margin:0;">${emptyMsg}</p>`
    }
    return `<h3 style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#0F1C3F;margin:24px 0 8px;">${escapeHtml(title)}</h3>
      <ul style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.6;color:#1E293B;margin:0;padding-left:20px;">
        ${items.map((i) => `<li style="margin-bottom:8px;">${i}</li>`).join('')}
      </ul>`
  }

  const evidenceTag = (ids: string[]): string =>
    ids.length === 0
      ? ''
      : ` <span style="font-family:'SF Mono',Menlo,monospace;font-size:11px;color:#6B7280;">[${ids.map(escapeHtml).join(', ')}]</span>`

  const winsHtml = proposals.wins.map(
    (w) => `${escapeHtml(w.description)}${evidenceTag(w.evidence_conversation_ids)}`,
  )

  const failureHtml = proposals.failure_patterns.map((p) => {
    const sevColor = p.severity === 'high' ? '#DC2626' : p.severity === 'medium' ? '#D97706' : '#6B7280'
    return `<strong style="color:${sevColor};">[${escapeHtml(p.severity)}]</strong> ${escapeHtml(p.pattern)} <span style="color:#6B7280;">(${p.n_calls_affected} ${p.n_calls_affected === 1 ? 'call' : 'calls'})</span>${evidenceTag(p.evidence_conversation_ids)}`
  })

  const kbGapHtml = proposals.kb_gaps.map(
    (g) => `<strong>Q:</strong> ${escapeHtml(g.question_asked)}<br/>
      <strong>Claire said:</strong> <em>${escapeHtml(g.claire_response)}</em><br/>
      <strong>Proposed addition:</strong> ${escapeHtml(g.proposed_addition)}${evidenceTag(g.evidence_conversation_ids)}`,
  )

  const promptRuleHtml = proposals.proposed_prompt_rules.map(
    (r) => `<strong>Rule:</strong> ${escapeHtml(r.rule)}<br/>
      <strong>Why:</strong> ${escapeHtml(r.rationale)}${evidenceTag(r.evidence_conversation_ids)}`,
  )

  const listenHtml = proposals.calls_worth_listening_to.map(
    (c) =>
      `<a href="${SITE_URL}/switchboard/call-logs" style="color:#1E40AF;font-family:'SF Mono',Menlo,monospace;font-size:12px;">${escapeHtml(c.conversation_id)}</a> &mdash; ${escapeHtml(c.why)}`,
  )

  const questionsHtml = proposals.questions_for_tyler.map(
    (q) => `<strong>${escapeHtml(q.question)}</strong><br/><span style="color:#6B7280;">${escapeHtml(q.context)}</span>`,
  )

  const bodyHtml = `
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.6;color:#1E293B;margin:0 0 16px;">
      ${escapeHtml(proposals.summary)}
    </p>
    <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;padding:14px 16px;margin:8px 0 16px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#4B5563;">
      <strong>Other signals:</strong>
      ${metrics.escalation_count} escalation${metrics.escalation_count === 1 ? '' : 's'},
      ${metrics.emergency_dispatch_count} emergency dispatch${metrics.emergency_dispatch_count === 1 ? '' : 'es'},
      ${metrics.silence_timeout_count} silence timeout${metrics.silence_timeout_count === 1 ? '' : 's'},
      ${metrics.extras.stall_phrase_calls} call${metrics.extras.stall_phrase_calls === 1 ? '' : 's'} with stall-phrase repetition,
      ${metrics.extras.repeated_phrase_calls} call${metrics.extras.repeated_phrase_calls === 1 ? '' : 's'} where Claire repeated herself verbatim,
      ${metrics.extras.leads_with_hcp_errors} lead${metrics.extras.leads_with_hcp_errors === 1 ? '' : 's'} with HCP sync errors,
      avg ${metrics.extras.avg_conversation_messages} turns / conversation.
    </div>
    ${listBlock('Wins', winsHtml, '(no standout wins today)')}
    ${listBlock('Failure patterns', failureHtml)}
    ${listBlock('KB gaps with proposed additions', kbGapHtml)}
    ${listBlock('Proposed prompt rules (review with Cesar before applying)', promptRuleHtml)}
    ${listBlock('Calls worth listening to', listenHtml)}
    ${listBlock('Questions for Tyler', questionsHtml)}
    <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#6B7280;margin-top:24px;">
      This is Phase 1 (observation only). Approved KB additions land in
      <a href="${SITE_URL}/switchboard/knowledge-base" style="color:#1E40AF;">/switchboard/knowledge-base</a>;
      prompt-rule changes still go through Cesar.
    </p>`

  const html = renderEmailLayout({
    preheader: `Claire's nightly self-improvement report for ${dateLabel}. ${proposals.failure_patterns.length} failure patterns, ${proposals.kb_gaps.length} KB gaps, ${proposals.proposed_prompt_rules.length} proposed prompt rules.`,
    eyebrow: 'Claire · Daily Learning Report',
    heading: `What Claire learned on ${dateLabel}`,
    intro: proposals.summary,
    stats: statsRow,
    bodyHtml,
    cta: { label: 'Review in Switchboard', href: `${SITE_URL}/switchboard/call-logs` },
  })

  // Plain-text fallback
  const textLines = [
    `Claire's daily learning report — ${dateLabel}`,
    '',
    proposals.summary,
    '',
    `Volume: ${metrics.voice_count} voice, ${metrics.web_chat_count} web chat, ${metrics.sms_count} SMS, ${metrics.lead_form_count} lead-form. ${metrics.total_leads} total leads.`,
    `Signals: ${metrics.escalation_count} escalations, ${metrics.emergency_dispatch_count} emergency dispatches, ${metrics.silence_timeout_count} silence timeouts, ${metrics.extras.stall_phrase_calls} stall-phrase calls, ${metrics.extras.repeated_phrase_calls} self-repeat calls.`,
    '',
    'WINS',
    ...(proposals.wins.length === 0
      ? ['(none)']
      : proposals.wins.map((w) => `- ${w.description} [${w.evidence_conversation_ids.join(', ')}]`)),
    '',
    'FAILURE PATTERNS',
    ...(proposals.failure_patterns.length === 0
      ? ['(none)']
      : proposals.failure_patterns.map(
          (p) => `- [${p.severity}] ${p.pattern} (${p.n_calls_affected} calls) [${p.evidence_conversation_ids.join(', ')}]`,
        )),
    '',
    'KB GAPS',
    ...(proposals.kb_gaps.length === 0
      ? ['(none)']
      : proposals.kb_gaps.flatMap((g) => [
          `- Q: ${g.question_asked}`,
          `  Claire said: ${g.claire_response}`,
          `  Proposed: ${g.proposed_addition}`,
          `  Evidence: ${g.evidence_conversation_ids.join(', ')}`,
        ])),
    '',
    'PROPOSED PROMPT RULES',
    ...(proposals.proposed_prompt_rules.length === 0
      ? ['(none)']
      : proposals.proposed_prompt_rules.flatMap((r) => [
          `- Rule: ${r.rule}`,
          `  Why: ${r.rationale}`,
          `  Evidence: ${r.evidence_conversation_ids.join(', ')}`,
        ])),
    '',
    'CALLS WORTH LISTENING TO',
    ...(proposals.calls_worth_listening_to.length === 0
      ? ['(none)']
      : proposals.calls_worth_listening_to.map(
          (c) => `- ${c.conversation_id}: ${c.why}`,
        )),
    '',
    'QUESTIONS FOR TYLER',
    ...(proposals.questions_for_tyler.length === 0
      ? ['(none)']
      : proposals.questions_for_tyler.flatMap((q) => [`- ${q.question}`, `  ${q.context}`])),
    '',
    `Switchboard: ${SITE_URL}/switchboard`,
  ]
  const text = textLines.join('\n')

  return { subject, html, text }
}

// ============================================================================
// USER INVITE (Switchboard access)
// ============================================================================

/**
 * Welcome / invite email when an owner adds a user to TZ Switchboard.
 * Tyler caught this gap on 2026-05-18: he invited Mike + Ty Stein but
 * neither got an email, so they didn't know they had access. Pre-fix,
 * `inviteUser()` only created a DB row.
 */
export async function sendUserInviteEmail(args: {
  inviteeEmail: string
  inviteeName?: string | null
  role: 'owner' | 'admin' | 'office' | 'viewer'
  invitedByName?: string | null
  invitedByEmail: string
}): Promise<void> {
  const loginUrl = `${SITE_URL}/switchboard/login`
  const niceRole = args.role.charAt(0).toUpperCase() + args.role.slice(1)
  const inviter = args.invitedByName || args.invitedByEmail
  const greeting = args.inviteeName ? `Hi ${args.inviteeName},` : 'Hi,'
  const subject = `You've been added to TZ Switchboard (${niceRole} access)`

  const bodyHtml = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.7;color:#1E293B;">
      <p style="margin:0 0 14px;">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 14px;"><strong>${escapeHtml(inviter)}</strong> just gave you access to TZ Switchboard, the internal control center for TZ Electric, Plumbing, Heating, and Cooling.</p>
      <p style="margin:0 0 14px;"><strong>How to sign in:</strong></p>
      <ol style="margin:0 0 14px 22px;padding:0;color:#1E293B;">
        <li style="margin-bottom:6px;">Click the <strong>Sign in to TZ Switchboard</strong> button below (or go to <a href="${loginUrl}" style="color:#1E40AF;">${loginUrl}</a>).</li>
        <li style="margin-bottom:6px;">Click <strong>Sign in with Google</strong> on the login page.</li>
        <li style="margin-bottom:6px;">Use your <strong>${escapeHtml(args.inviteeEmail)}</strong> Google account. No separate password — sign-in is handled by Google.</li>
      </ol>
      <p style="margin:0 0 14px;color:#4B5563;font-size:13px;">If "${escapeHtml(args.inviteeEmail)}" isn't a Google Workspace account yet, ask Tyler or Cesar to set one up before signing in.</p>
      <p style="margin:0;color:#6B7280;font-size:12px;">If you weren't expecting this invite, you can ignore this email or reply to let us know.</p>
    </div>`

  const html = renderEmailLayout({
    preheader: `${inviter} added you to TZ Switchboard as ${niceRole}.`,
    eyebrow: 'TZ Switchboard',
    heading: 'Welcome to TZ Switchboard',
    intro: `${inviter} just gave you ${niceRole.toLowerCase()} access. Sign in with your Google account to get in.`,
    stats: [
      { label: 'Role', value: niceRole },
      { label: 'Email', value: args.inviteeEmail },
      { label: 'Invited by', value: inviter },
    ],
    bodyHtml,
    cta: { label: 'Sign in to TZ Switchboard', href: loginUrl },
  })

  const text = [
    `${greeting}`,
    '',
    `${inviter} just gave you access to TZ Switchboard.`,
    '',
    `Role: ${niceRole}`,
    `Email: ${args.inviteeEmail}`,
    `Invited by: ${inviter}`,
    '',
    'How to sign in:',
    `1. Go to ${loginUrl}`,
    '2. Click "Sign in with Google"',
    `3. Use your ${args.inviteeEmail} Google account.`,
    '',
    "If you weren't expecting this invite, ignore this email.",
  ].join('\n')

  // Send only to the invitee. Don't blast the broadcast list.
  await sendEmail({ subject, html, text, to: [args.inviteeEmail] })
}

// ============================================================================
// NOTIFY TEAM MEMBER (Claire SMS-routed callback)
// ============================================================================

/**
 * Mirror of sendOfficeFlagEmail for the notify_team_member tool. Same group
 * inbox so the office still has a paper trail, but the subject + body call
 * out which staff member was paged by SMS, what their match status was, and
 * whether the SMS itself landed.
 */
export async function sendTeamMemberPagedEmail(args: {
  conversationId: string
  channel: 'sms' | 'voice' | 'web_chat'
  targetName: string
  matchedStaffName: string | null
  smsResult: 'sent' | 'no-phone' | 'send-failed' | 'no-match'
  smsError: string | null
  callerName: string | null
  callerPhone: string | null
  briefMessage: string
  attributionChannel: string | null
}): Promise<void> {
  const channelLabel =
    args.channel === 'web_chat' ? 'Web chat' : args.channel === 'sms' ? 'SMS' : 'Voice'
  const target = args.matchedStaffName || args.targetName

  const headlineBanner =
    args.smsResult === 'sent'
      ? {
          bg: '#DCFCE7',
          border: '#16A34A',
          title: 'SMS sent',
          color: '#166534',
          msg: `Texted ${target} directly. Office paper trail below.`,
        }
      : args.smsResult === 'no-match'
        ? {
            bg: '#FEF3C7',
            border: '#D97706',
            title: `No match for "${args.targetName}"`,
            color: '#78350F',
            msg: `Claire could not find this name in the Office Staff Directory. Group email only — no SMS sent.`,
          }
        : args.smsResult === 'no-phone'
          ? {
              bg: '#FEF3C7',
              border: '#D97706',
              title: `${target} has no phone on file`,
              color: '#78350F',
              msg: `Add a cell number in the Office Staff Directory KB section to enable SMS routing.`,
            }
          : {
              bg: '#FEE2E2',
              border: '#DC2626',
              title: 'SMS send failed',
              color: '#991B1B',
              msg: `Twilio rejected the send: ${args.smsError || 'unknown'}. Group email is the only signal.`,
            }

  const callerLine =
    [args.callerName, args.callerPhone].filter(Boolean).join(' · ') || '(no caller contact captured)'

  const subject = `[TZ Claire] ${target} paged via ${channelLabel}: ${args.briefMessage.slice(0, 70)}`

  const bodyHtml = `
    <div style="background:${headlineBanner.bg};border-left:4px solid ${headlineBanner.border};border-radius:8px;padding:16px 18px;margin-bottom:18px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${headlineBanner.color};font-weight:700;margin-bottom:6px;">${escapeHtml(headlineBanner.title)}</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:${headlineBanner.color};line-height:1.5;">
        ${escapeHtml(headlineBanner.msg)}
      </div>
    </div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.7;color:#1E293B;">
      <strong>Caller asked for:</strong> ${escapeHtml(args.targetName)}${args.matchedStaffName && args.matchedStaffName.toLowerCase() !== args.targetName.toLowerCase() ? ` <span style="color:#6B7280;">(matched to ${escapeHtml(args.matchedStaffName)})</span>` : ''}<br />
      <strong>Caller:</strong> ${escapeHtml(callerLine)}<br />
      <strong>Channel:</strong> ${escapeHtml(channelLabel)}${args.attributionChannel ? ` · ${escapeHtml(args.attributionChannel)}` : ''}<br />
      <strong>Message:</strong> ${escapeHtml(args.briefMessage)}
    </div>`

  const html = renderEmailLayout({
    preheader: `${target} paged via ${channelLabel} (${headlineBanner.title}). Caller: ${callerLine}.`,
    eyebrow: `Office page — ${channelLabel}`,
    heading: `${target} was paged`,
    intro: `Claire took a callback request for ${target} on ${channelLabel}. SMS status: ${headlineBanner.title}.`,
    bodyHtml,
    cta: { label: 'Open conversation in Switchboard', href: `${SITE_URL}/switchboard/call-logs` },
  })

  const text = [
    `[TZ Claire] ${target} paged via ${channelLabel}`,
    '',
    `SMS status: ${headlineBanner.title}`,
    args.smsError ? `Error: ${args.smsError}` : '',
    '',
    `Caller asked for: ${args.targetName}${args.matchedStaffName ? ' (matched to ' + args.matchedStaffName + ')' : ''}`,
    `Caller: ${callerLine}`,
    `Channel: ${channelLabel}${args.attributionChannel ? ' · ' + args.attributionChannel : ''}`,
    `Message: ${args.briefMessage}`,
    '',
    `Open: ${SITE_URL}/switchboard/call-logs`,
  ]
    .filter(Boolean)
    .join('\n')

  await sendEmail({ subject, html, text })
}

// ============================================================================
// PLAN SIGNUP (Stripe payment → office)
// ============================================================================

/**
 * Office notification when a customer buys a maintenance/service plan on the
 * website (Stripe checkout.session.completed). Terry caught this gap
 * 2026-05-28: a Bronze generator plan was purchased and the office got no
 * notification — only Tyler got Stripe's own receipt. sendInternalNotification
 * in housecall-pro.ts was a console.log stub. This fires the real email to the
 * service inbox + office so they know who signed up and can assign the plan
 * in HCP.
 */
export async function sendPlanSignupEmail(args: {
  firstName: string
  lastName: string
  phone: string
  address: string
  planName: string
  billingCycle: 'Monthly' | 'Yearly'
  amount: number
  perLabel: string
  hcpCustomerId: string
  isExisting: boolean
}): Promise<void> {
  const fullName = `${args.firstName} ${args.lastName}`.trim()
  const subject = `[TZ Plan Signup] ${args.planName} — ${fullName}`
  const priceLine = `${args.billingCycle} · $${args.amount}${args.perLabel}`

  const stats = [
    { label: 'Plan', value: args.planName },
    { label: 'Billing', value: priceLine },
    { label: 'Customer', value: args.isExisting ? 'Existing' : 'New' },
  ]

  const bodyHtml = `
    <div style="background:#DCFCE7;border-left:4px solid #16A34A;border-radius:8px;padding:16px 18px;margin-bottom:18px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#166534;font-weight:700;margin-bottom:6px;">Paid plan signup</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#166534;line-height:1.5;">
        ${escapeHtml(fullName)} just paid for the ${escapeHtml(args.planName)} on the website.
      </div>
    </div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.7;color:#1E293B;">
      <strong>Customer:</strong> ${escapeHtml(fullName)}${args.isExisting ? ' (existing)' : ' (new — created in HCP)'}<br />
      <strong>Phone:</strong> <a href="tel:${escapeHtml(args.phone)}" style="color:#1E40AF;text-decoration:none;font-weight:600;">${escapeHtml(args.phone)}</a><br />
      ${args.address ? `<strong>Address:</strong> ${escapeHtml(args.address)}<br />` : ''}
      <strong>Plan:</strong> ${escapeHtml(args.planName)}<br />
      <strong>Billing:</strong> ${escapeHtml(priceLine)}<br />
      <strong>HCP Customer ID:</strong> ${escapeHtml(args.hcpCustomerId)}
    </div>
    <div style="background:#FEF3C7;border-left:4px solid #D97706;border-radius:8px;padding:14px 16px;margin-top:18px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#78350F;line-height:1.5;">
        <strong>Action required:</strong> assign the service plan to this customer in Housecall Pro.
      </div>
    </div>`

  const html = renderEmailLayout({
    preheader: `${fullName} bought the ${args.planName} — ${priceLine}.`,
    eyebrow: 'TZ Plan Signup',
    heading: `New plan signup: ${args.planName}`,
    intro: `${fullName} paid for the ${args.planName} on the website. Assign the plan in HCP.`,
    stats,
    bodyHtml,
    cta: { label: 'Assign plan in Housecall Pro', href: 'https://pro.housecallpro.com/app/service_agreements' },
  })

  const text = [
    `[TZ Plan Signup] ${args.planName}`,
    '',
    `Customer: ${fullName}${args.isExisting ? ' (existing)' : ' (new)'}`,
    `Phone: ${args.phone}`,
    args.address ? `Address: ${args.address}` : '',
    `Plan: ${args.planName}`,
    `Billing: ${priceLine}`,
    `HCP Customer ID: ${args.hcpCustomerId}`,
    '',
    'ACTION REQUIRED: assign the service plan to this customer in Housecall Pro.',
    'https://pro.housecallpro.com/app/service_agreements',
  ]
    .filter(Boolean)
    .join('\n')

  await sendEmail({ subject, html, text })
}

// ============================================================================
// AFTER-HOURS DISPATCH (office backup record)
// ============================================================================

/**
 * Office email fired on every after-hours emergency dispatch. Added
 * 2026-05-28: the dispatch flow only texted + called the on-call tech, with
 * NO office record. With outbound SMS carrier-blocked until A2P 10DLC clears,
 * if the tech misses the voice call nobody at the office knows a dispatch even
 * happened. This guarantees a working-channel (email) record every time, and
 * flags whether the tech SMS leg is currently live.
 */
export async function sendAfterHoursDispatchEmail(args: {
  customerName: string | null
  customerPhone: string
  customerAddress: string | null
  issueDescription: string
  timeWindow: 'standard_after_hours' | 'overnight'
  onCallTechName: string | null
  onCallTechMatched: boolean
  smsEnabled: boolean
}): Promise<void> {
  const windowLabel = args.timeWindow === 'overnight' ? 'Overnight' : 'After-hours'
  const tech = args.onCallTechName || 'on-call (unassigned)'
  const subject = `[TZ AFTER-HOURS DISPATCH] ${args.customerName || 'Customer'} — ${args.issueDescription.slice(0, 60)}`

  const smsNote = args.smsEnabled
    ? ''
    : `<div style="background:#FEF3C7;border-left:4px solid #D97706;border-radius:8px;padding:12px 14px;margin-top:14px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#78350F;line-height:1.5;">
        Heads up: tech SMS alerts are currently OFF (A2P 10DLC registration pending), so ${escapeHtml(tech.split(' ')[0])} got voice calls only, not texts. Confirm by phone if this is urgent.
      </div>`

  const bodyHtml = `
    <div style="background:#FEE2E2;border-left:4px solid #DC2626;border-radius:8px;padding:16px 18px;margin-bottom:18px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#991B1B;font-weight:700;margin-bottom:6px;">${windowLabel} dispatch opened</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#7F1D1D;line-height:1.5;">
        Claire opened an emergency dispatch and paged ${escapeHtml(tech)}${args.onCallTechMatched ? '' : ' (no on-call match — supervisor chain only)'}.
      </div>
    </div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.7;color:#1E293B;">
      <strong>Customer:</strong> ${escapeHtml(args.customerName || '(no name captured)')}<br />
      <strong>Phone:</strong> <a href="tel:${escapeHtml(args.customerPhone)}" style="color:#DC2626;font-weight:700;text-decoration:none;">${escapeHtml(args.customerPhone)}</a><br />
      ${args.customerAddress ? `<strong>Address:</strong> ${escapeHtml(args.customerAddress)}<br />` : ''}
      <strong>Issue:</strong> ${escapeHtml(args.issueDescription)}<br />
      <strong>On-call paged:</strong> ${escapeHtml(tech)}<br />
      <strong>Window:</strong> ${escapeHtml(windowLabel)}
    </div>
    ${smsNote}`

  const html = renderEmailLayout({
    preheader: `${windowLabel} dispatch for ${args.customerName || 'a customer'} — ${args.customerPhone}.`,
    eyebrow: `${windowLabel} dispatch`,
    heading: 'After-hours emergency dispatch opened',
    intro: `Claire paged ${tech} for ${args.customerName || 'a customer'} (${args.customerPhone}). Office record below.`,
    bodyHtml,
    cta: { label: `Call ${args.customerPhone}`, href: `tel:${args.customerPhone}` },
  })

  const text = [
    `[TZ AFTER-HOURS DISPATCH] ${windowLabel}`,
    '',
    `Customer: ${args.customerName || '(no name)'}`,
    `Phone: ${args.customerPhone}`,
    args.customerAddress ? `Address: ${args.customerAddress}` : '',
    `Issue: ${args.issueDescription}`,
    `On-call paged: ${tech}`,
    `Window: ${windowLabel}`,
    args.smsEnabled ? '' : 'NOTE: tech SMS alerts OFF (A2P pending) — tech got voice calls only.',
    '',
    `Switchboard: ${SITE_URL}/switchboard/call-logs`,
  ]
    .filter(Boolean)
    .join('\n')

  await sendEmail({ subject, html, text })
}
