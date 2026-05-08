/**
 * Daily digest email — internal-only summary of yesterday's lead + Claire
 * conversation activity. Sent to the office (Tyler/Terry/Cesar) at 8 AM ET
 * via Vercel Cron. Reuses the branded renderEmailLayout shell so it looks
 * like the rest of TZ's mail. Goal: glanceable inbox snapshot so the
 * office knows what came in overnight without logging into the Switchboard.
 */
import { renderEmailLayout } from './email-templates'
import type {
  HeadlineStats,
  ChannelBreakdownRow,
  ServiceMixRow,
  ConversationStats,
  NoContactConversation,
} from './reports-queries'

const SITE_URL = 'https://tzelectricinc.com'

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatCents(cents: number): string {
  if (!cents) return '$0'
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

function shortTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function truncate(s: string | null | undefined, n: number): string {
  if (!s) return ''
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…'
}

export type DailyDigestData = {
  /** Window covered by this digest (yesterday by default). */
  forDate: Date
  headline: HeadlineStats
  channels: ChannelBreakdownRow[]
  services: ServiceMixRow[]
  conversations: ConversationStats
  noContact: NoContactConversation[]
}

export type DailyDigestEmail = {
  subject: string
  html: string
  text: string
}

export function renderDailyDigestEmail(data: DailyDigestData): DailyDigestEmail {
  const dateLabel = data.forDate.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const subject = `TZ Daily Digest — ${data.headline.totalLeads} lead${data.headline.totalLeads === 1 ? '' : 's'} yesterday`

  const stats = [
    { label: 'Total leads', value: String(data.headline.totalLeads) },
    { label: 'Web form', value: String(data.headline.webFormLeads) },
    { label: 'Claire', value: String(data.headline.agentLeads) },
    { label: 'Pipeline value', value: formatCents(data.headline.totalValueCents) },
  ]

  // Channel block
  const channelRows = data.channels.length
    ? data.channels
        .slice(0, 6)
        .map(
          (c) =>
            `<tr>
              <td style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1E293B;">${escapeHtml(c.channel)}</td>
              <td align="right" style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#0F1C3F;font-weight:600;">${c.count} <span style="color:#6B7280;font-weight:400;">· ${(c.share * 100).toFixed(0)}%</span></td>
            </tr>`,
        )
        .join('')
    : `<tr><td style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#6B7280;font-style:italic;">No leads yesterday.</td></tr>`

  // Service block
  const serviceRows = data.services.length
    ? data.services
        .slice(0, 6)
        .map(
          (s) =>
            `<tr>
              <td style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1E293B;">${escapeHtml(s.serviceLabel)}</td>
              <td align="right" style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#0F1C3F;font-weight:600;">${s.count}</td>
            </tr>`,
        )
        .join('')
    : `<tr><td style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#6B7280;font-style:italic;">—</td></tr>`

  // Conversation block
  const convStatsHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">
      <tr>
        <td style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1E293B;">Total conversations</td>
        <td align="right" style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#0F1C3F;font-weight:600;">${data.conversations.total}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1E293B;">Captured contact</td>
        <td align="right" style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#0F1C3F;font-weight:600;">${data.conversations.withContact}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1E293B;">Booked a lead</td>
        <td align="right" style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#0F1C3F;font-weight:600;">${data.conversations.withLead}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#1E293B;">No contact captured</td>
        <td align="right" style="padding:6px 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:${data.conversations.withoutContact > 0 ? '#92400E' : '#0F1C3F'};font-weight:600;">${data.conversations.withoutContact}</td>
      </tr>
    </table>`

  // No-contact list (top 5 only in email)
  const noContactBlock = data.noContact.length
    ? `
      <div style="margin-top:24px;padding-top:24px;border-top:1px solid #E5E7EB;">
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#92400E;font-weight:700;margin-bottom:8px;">
          Conversations to review (${data.noContact.length})
        </div>
        <p style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#4B5563;line-height:1.5;margin:0 0 12px 0;">
          Visitors who started chatting but never shared their name or phone, and never booked. Open the Web Chat module in the Switchboard to read the full transcripts.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FEF3C7;border-radius:8px;">
          ${data.noContact
            .slice(0, 5)
            .map(
              (c) => `
            <tr>
              <td style="padding:10px 14px;border-bottom:1px solid #FDE68A;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#1E293B;line-height:1.5;">
                <div style="color:#92400E;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;margin-bottom:4px;">
                  ${escapeHtml(shortTime(c.createdAt))} · ${escapeHtml(c.channel === 'web_chat' ? 'Web chat' : c.channel === 'sms' ? 'SMS' : 'Voice')}${c.attributionChannel ? ' · ' + escapeHtml(c.attributionChannel) : ''} · ${c.messageCount} msg
                </div>
                <div style="color:#1E293B;">${escapeHtml(truncate(c.firstUserMessage, 160) || '(no first message)')}</div>
              </td>
            </tr>`,
            )
            .join('')}
        </table>
      </div>`
    : ''

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="vertical-align:top;width:50%;padding-right:8px;" class="stack">
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#1E40AF;font-weight:700;margin-bottom:8px;">By channel</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${channelRows}</table>
        </td>
        <td style="vertical-align:top;width:50%;padding-left:8px;" class="stack">
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#1E40AF;font-weight:700;margin-bottom:8px;">By service</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${serviceRows}</table>
        </td>
      </tr>
    </table>

    <div style="margin-top:24px;padding-top:24px;border-top:1px solid #E5E7EB;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#1E40AF;font-weight:700;margin-bottom:8px;">Claire conversations</div>
      ${convStatsHtml}
    </div>

    ${noContactBlock}
  `

  const html = renderEmailLayout({
    preheader: `${data.headline.totalLeads} lead${data.headline.totalLeads === 1 ? '' : 's'} yesterday across ${data.channels.length} channel${data.channels.length === 1 ? '' : 's'}.`,
    eyebrow: 'Daily Digest',
    heading: dateLabel,
    intro: `${data.headline.totalLeads} new lead${data.headline.totalLeads === 1 ? '' : 's'} and ${data.conversations.total} conversation${data.conversations.total === 1 ? '' : 's'} on ${dateLabel}. Here's the snapshot.`,
    stats,
    bodyHtml,
    cta: { label: 'Open Reports module', href: `${SITE_URL}/switchboard/reports?days=7` },
  })

  // Plain-text fallback for clients that strip HTML.
  const text = [
    `TZ Daily Digest — ${dateLabel}`,
    '',
    `Total leads: ${data.headline.totalLeads}`,
    `  Web form: ${data.headline.webFormLeads}`,
    `  Claire (agents): ${data.headline.agentLeads}`,
    `  Pipeline value: ${formatCents(data.headline.totalValueCents)}`,
    '',
    'By channel:',
    ...data.channels.slice(0, 6).map((c) => `  ${c.channel}: ${c.count} (${(c.share * 100).toFixed(0)}%)`),
    '',
    'By service:',
    ...data.services.slice(0, 6).map((s) => `  ${s.serviceLabel}: ${s.count}`),
    '',
    'Claire conversations:',
    `  Total: ${data.conversations.total}`,
    `  Captured contact: ${data.conversations.withContact}`,
    `  Booked a lead: ${data.conversations.withLead}`,
    `  No contact captured: ${data.conversations.withoutContact}`,
    '',
    data.noContact.length
      ? `Conversations to review (${data.noContact.length}):`
      : 'Nothing to review.',
    ...data.noContact.slice(0, 5).map(
      (c) =>
        `  ${shortTime(c.createdAt)} · ${c.channel} · ${c.messageCount} msg\n    "${truncate(c.firstUserMessage, 140)}"`,
    ),
    '',
    `Open Reports: ${SITE_URL}/switchboard/reports?days=7`,
  ].join('\n')

  return { subject, html, text }
}
