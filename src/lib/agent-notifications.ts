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
