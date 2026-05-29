/**
 * End-of-day follow-up recap.
 *
 * Tyler's ask (2026-05-29): Claire fires flag emails throughout the day, but
 * field staff miss them. So at end of day we send a consolidated reminder:
 *
 *   1. PER-PERSON — each employee Claire paged that day (`notify_team_member`)
 *      gets their OWN email listing ONLY the callbacks flagged to them.
 *   2. SERVICE RECAP — the service inbox (default office recipients) gets a
 *      master list of EVERY flagged item that day: per-person pages grouped by
 *      employee, general office flags, and a separate emergencies section.
 *
 * Pure read-on-top: this only reads existing flag data already persisted by
 * Claire's tools (tz_agent_messages tool_use rows) + conversation context, and
 * sends email. No new table, no change to Claire's behavior, no change to the
 * existing throughout-the-day flag emails. Skip-if-empty so quiet days are
 * silent. Wired to a 5:30 PM ET cron in vercel.json.
 */
import { escapeHtml, sendEmail, SITE_URL } from './agent-notifications'
import { explicitNYRange } from './claire-self-improvement'
import { db } from './db'
import { lookupStaffMember } from './staff-directory'
import { listUsers } from './users'

type Channel = 'voice' | 'web_chat' | 'sms'

export type FlagItem = {
  kind: 'person' | 'general' | 'emergency'
  toolName: string
  conversationId: string
  channel: Channel | null
  customerName: string | null
  customerPhone: string | null
  summary: string
  priority?: 'low' | 'normal' | 'high'
  targetName?: string // notify_team_member only
  address?: string // emergencies only
  timeLabel: string // e.g. "1:51 PM"
}

type FlagRow = {
  tool_name: string
  tool_input: Record<string, unknown> | null
  created_at: string
  conversation_id: string
  channel: Channel | null
  customer_name: string | null
  customer_phone: string | null
}

const FLAG_TOOLS = [
  'notify_team_member',
  'flag_for_office_review',
  'escalate_emergency',
  'dispatch_after_hours_emergency',
]

/**
 * Recipients for the master recap (every flagged item). Defaults to the
 * service inbox per Tyler's spec; override with EOD_RECAP_TO (comma-separated)
 * to add owners/admins without a code change. Per-person emails still go to
 * each flagged employee individually, regardless of this.
 */
function serviceRecapRecipients(): string[] {
  return (process.env.EOD_RECAP_TO || 'service@tzelectricinc.com')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Today's NY calendar date as YYYY-MM-DD. */
function todayNYDateLabel(): string {
  const now = new Date()
  const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const yyyy = ny.getFullYear()
  const mm = String(ny.getMonth() + 1).padStart(2, '0')
  const dd = String(ny.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function fmtTimeET(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}

function fmtDateET(dateLabel: string): string {
  // dateLabel is YYYY-MM-DD; render "Thu, May 29" without TZ math.
  const d = new Date(`${dateLabel}T12:00:00Z`)
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

/**
 * Deep link to the SPECIFIC conversation card. All three Switchboard views
 * read `?id=<conversationId>` and open that exact record (getConversation(id)),
 * so this opens Bianca's call rather than the top of the list.
 */
function channelLink(channel: Channel | null, conversationId: string): string {
  const q = `?id=${encodeURIComponent(conversationId)}`
  switch (channel) {
    case 'web_chat':
      return `${SITE_URL}/switchboard/web-chat${q}`
    case 'sms':
      return `${SITE_URL}/switchboard/sms-conversations${q}`
    default:
      return `${SITE_URL}/switchboard/call-logs${q}`
  }
}

function channelLabel(channel: Channel | null): string {
  return channel === 'web_chat' ? 'Web chat' : channel === 'sms' ? 'SMS' : 'Voice'
}

/** Map a raw flag row into a normalized FlagItem. */
function toItem(row: FlagRow): FlagItem {
  const ti = row.tool_input || {}
  const base = {
    toolName: row.tool_name,
    conversationId: row.conversation_id,
    channel: row.channel,
    timeLabel: fmtTimeET(row.created_at),
  }
  if (row.tool_name === 'notify_team_member') {
    return {
      ...base,
      kind: 'person',
      targetName: str(ti.target_name) ?? 'Unassigned',
      customerName: str(ti.caller_name) ?? row.customer_name,
      customerPhone: str(ti.caller_phone) ?? row.customer_phone,
      summary: str(ti.brief_message) ?? 'Wants a callback.',
    }
  }
  if (row.tool_name === 'flag_for_office_review') {
    const p = str(ti.priority)
    return {
      ...base,
      kind: 'general',
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      summary: str(ti.reason) ?? 'Flagged for office review.',
      priority: p === 'low' || p === 'high' ? p : 'normal',
    }
  }
  // escalate_emergency | dispatch_after_hours_emergency
  return {
    ...base,
    kind: 'emergency',
    customerName: str(ti.customer_name) ?? row.customer_name,
    customerPhone: str(ti.customer_phone) ?? row.customer_phone,
    summary: str(ti.reason) ?? str(ti.issue_description) ?? 'Emergency.',
    address: str(ti.address) ?? str(ti.customer_address) ?? undefined,
  }
}

export type GroupedFlags = {
  dateLabel: string
  person: Map<string, FlagItem[]> // key = lowercased target name; value preserves display
  personDisplay: Map<string, string> // lowercased key -> display name
  general: FlagItem[]
  emergencies: FlagItem[]
  total: number
}

/** Pull and group all of a day's flagged items. */
export async function getFlagsForDay(dateLabel: string): Promise<GroupedFlags> {
  const { start, end } = explicitNYRange(dateLabel)
  const sql = db()
  const rows = (await sql`
    SELECT m.tool_name, m.tool_input, m.created_at,
           c.id AS conversation_id, c.channel,
           c.customer_name, c.customer_phone
    FROM tz_agent_messages m
    JOIN tz_agent_conversations c ON c.id = m.conversation_id
    WHERE m.role = 'tool_use'
      AND m.tool_name = ANY(${FLAG_TOOLS})
      AND m.created_at >= ${start}
      AND m.created_at <= ${end}
    ORDER BY m.created_at ASC
  `) as FlagRow[]

  const person = new Map<string, FlagItem[]>()
  const personDisplay = new Map<string, string>()
  const general: FlagItem[] = []
  const emergencies: FlagItem[] = []

  for (const row of rows) {
    const item = toItem(row)
    if (item.kind === 'person') {
      const display = item.targetName || 'Unassigned'
      const key = display.toLowerCase()
      personDisplay.set(key, display)
      const arr = person.get(key) ?? []
      arr.push(item)
      person.set(key, arr)
    } else if (item.kind === 'emergency') {
      emergencies.push(item)
    } else {
      general.push(item)
    }
  }

  return { dateLabel, person, personDisplay, general, emergencies, total: rows.length }
}

/**
 * Resolve a flagged name to an employee email. Reuses Claire's own staff-
 * directory matcher (handles first / full / initial-last / aliases) to get a
 * canonical name, then matches that against active Switchboard users by first
 * name. Returns null when there's no confident match — those items still land
 * in the service@ recap, so nothing is ever dropped.
 */
async function resolveEmailForName(
  rawName: string,
  users: Array<{ email: string; name: string | null }>,
): Promise<string | null> {
  const candidates = new Set<string>()
  candidates.add(rawName.trim().toLowerCase())
  const lookup = await lookupStaffMember(rawName)
  if (lookup.matched) {
    candidates.add(lookup.member.name.trim().toLowerCase())
    for (const a of lookup.member.aliases) candidates.add(a.trim().toLowerCase())
  }
  const firstTokens = new Set<string>()
  for (const c of candidates) firstTokens.add(c.split(/\s+/)[0])

  for (const u of users) {
    const uname = (u.name || '').trim().toLowerCase()
    if (!uname) continue
    const ufirst = uname.split(/\s+/)[0]
    if (firstTokens.has(ufirst) || candidates.has(uname)) return u.email
  }
  return null
}

// ---------------------------------------------------------------------------
// Email rendering
// ---------------------------------------------------------------------------

function renderItemRowHtml(item: FlagItem, opts: { showOwner?: boolean } = {}): string {
  const name = escapeHtml(item.customerName || 'Unknown caller')
  const phone = item.customerPhone
    ? `<a href="tel:${escapeHtml(item.customerPhone)}" style="color:#1E40AF;text-decoration:none;">${escapeHtml(item.customerPhone)}</a>`
    : 'no number'
  const owner = opts.showOwner && item.targetName ? ` <strong>[${escapeHtml(item.targetName)}]</strong>` : ''
  const addr = item.address ? `<br><span style="color:#6B7280;font-size:12px;">${escapeHtml(item.address)}</span>` : ''
  const pri =
    item.priority === 'high'
      ? ' <span style="color:#B91C1C;font-weight:600;">(HIGH)</span>'
      : ''
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#111827;vertical-align:top;">
        <span style="color:#9CA3AF;">&#9744;</span>&nbsp;
        <strong>${name}</strong> &middot; ${phone}${owner}${pri}<br>
        <span style="color:#374151;">${escapeHtml(item.summary)}</span>${addr}<br>
        <span style="color:#9CA3AF;font-size:12px;">${channelLabel(item.channel)} &middot; ${item.timeLabel} &middot; <a href="${channelLink(item.channel, item.conversationId)}" style="color:#6B7280;">open</a></span>
      </td>
    </tr>`
}

function renderItemRowText(item: FlagItem, opts: { showOwner?: boolean } = {}): string {
  const owner = opts.showOwner && item.targetName ? ` [${item.targetName}]` : ''
  const pri = item.priority === 'high' ? ' (HIGH)' : ''
  const addr = item.address ? ` | ${item.address}` : ''
  return `[ ] ${item.customerName || 'Unknown caller'} · ${item.customerPhone || 'no number'}${owner}${pri}\n    ${item.summary}${addr}\n    ${channelLabel(item.channel)} · ${item.timeLabel} · ${channelLink(item.channel, item.conversationId)}`
}

function shell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#F3F4F6;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">
      <tr><td style="background:#1B2A4A;padding:18px 20px;color:#FFFFFF;font-size:16px;font-weight:600;">${escapeHtml(title)}</td></tr>
      <tr><td style="padding:16px 20px;">${bodyHtml}</td></tr>
      <tr><td style="padding:12px 20px;border-top:1px solid #E5E7EB;color:#9CA3AF;font-size:11px;">Sent by Claire, TZ Switchboard. This is an end-of-day reminder of everything flagged today — reply or call each customer back, then you're done.</td></tr>
    </table></body></html>`
}

function buildPersonEmail(displayName: string, items: FlagItem[], dateLabel: string) {
  const dateStr = fmtDateET(dateLabel)
  const firstName = displayName.split(/\s+/)[0]
  const subject = `TZ — Your callbacks for ${dateStr} (${items.length})`
  const rows = items.map((i) => renderItemRowHtml(i)).join('')
  const html = shell(
    `Your end-of-day callbacks — ${dateStr}`,
    `<p style="margin:0 0 12px;font-size:14px;color:#374151;">Hi ${escapeHtml(firstName)}, here ${items.length === 1 ? 'is the inquiry' : `are the ${items.length} inquiries`} Claire flagged to you today. Make sure each one got a callback.</p>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`,
  )
  const text = `Hi ${firstName}, ${items.length} inquiry(ies) Claire flagged to you today (${dateStr}):\n\n${items.map((i) => renderItemRowText(i)).join('\n\n')}`
  return { subject, html, text }
}

function buildServiceEmail(grouped: GroupedFlags) {
  const dateStr = fmtDateET(grouped.dateLabel)
  const subject = `TZ — End-of-day follow-up recap, ${dateStr} (${grouped.total} flagged)`
  const sections: string[] = []
  const textSections: string[] = []

  if (grouped.person.size > 0) {
    const blocks: string[] = []
    const tblocks: string[] = []
    for (const [key, items] of grouped.person) {
      const name = grouped.personDisplay.get(key) || key
      blocks.push(
        `<p style="margin:14px 0 4px;font-size:13px;font-weight:700;color:#1B2A4A;text-transform:uppercase;letter-spacing:.04em;">${escapeHtml(name)} (${items.length})</p>
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items.map((i) => renderItemRowHtml(i)).join('')}</table>`,
      )
      tblocks.push(`${name.toUpperCase()} (${items.length})\n${items.map((i) => renderItemRowText(i)).join('\n\n')}`)
    }
    sections.push(`<h3 style="margin:18px 0 4px;font-size:15px;color:#111827;">Flagged to a specific person</h3>${blocks.join('')}`)
    textSections.push(`== FLAGGED TO A SPECIFIC PERSON ==\n${tblocks.join('\n\n')}`)
  }

  if (grouped.general.length > 0) {
    sections.push(
      `<h3 style="margin:22px 0 4px;font-size:15px;color:#111827;">General office (${grouped.general.length})</h3>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${grouped.general.map((i) => renderItemRowHtml(i)).join('')}</table>`,
    )
    textSections.push(`== GENERAL OFFICE (${grouped.general.length}) ==\n${grouped.general.map((i) => renderItemRowText(i)).join('\n\n')}`)
  }

  if (grouped.emergencies.length > 0) {
    sections.push(
      `<h3 style="margin:22px 0 4px;font-size:15px;color:#B91C1C;">Emergencies dispatched today (${grouped.emergencies.length})</h3>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${grouped.emergencies.map((i) => renderItemRowHtml(i)).join('')}</table>`,
    )
    textSections.push(`== EMERGENCIES DISPATCHED (${grouped.emergencies.length}) ==\n${grouped.emergencies.map((i) => renderItemRowText(i)).join('\n\n')}`)
  }

  const html = shell(
    `End-of-day follow-up recap — ${dateStr}`,
    `<p style="margin:0 0 4px;font-size:14px;color:#374151;">${grouped.total} item${grouped.total === 1 ? '' : 's'} Claire flagged today. Use this to confirm nobody slipped through the cracks.</p>${sections.join('')}`,
  )
  const text = `End-of-day follow-up recap — ${dateStr}\n${grouped.total} flagged item(s).\n\n${textSections.join('\n\n')}`
  return { subject, html, text }
}

export type EodRecapResult = {
  dateLabel: string
  totalFlags: number
  skipped: boolean
  personEmailsSent: number
  unresolvedNames: string[]
  serviceRecapSent: boolean
  dryRun?: boolean
  preview?: {
    person: Array<{ name: string; email: string | null; itemCount: number; subject: string }>
    service: { subject: string; htmlChars: number } | null
  }
}

/**
 * Orchestrator: pull the day's flags, send per-person emails + the service
 * recap. Skips entirely (no email) on a day with zero flags.
 *
 * `dryRun: true` builds everything and resolves recipients but sends NOTHING —
 * returns a preview so the cron/output can be inspected without emailing the
 * team. The cron exposes this via ?dryRun=1.
 */
export async function sendEndOfDayRecap(
  opts: { dateLabel?: string; dryRun?: boolean; overrideRecipient?: string } = {},
): Promise<EodRecapResult> {
  const dateLabel = opts.dateLabel ?? todayNYDateLabel()
  const dryRun = opts.dryRun ?? false
  const overrideRecipient = opts.overrideRecipient
  const grouped = await getFlagsForDay(dateLabel)

  if (grouped.total === 0) {
    return {
      dateLabel,
      totalFlags: 0,
      skipped: true,
      personEmailsSent: 0,
      unresolvedNames: [],
      serviceRecapSent: false,
      dryRun,
      preview: dryRun ? { person: [], service: null } : undefined,
    }
  }

  const users = (await listUsers()).filter((u) => !u.disabled_at)
  let personEmailsSent = 0
  const unresolvedNames: string[] = []
  const previewPerson: Array<{ name: string; email: string | null; itemCount: number; subject: string }> = []

  // Per-person emails.
  for (const [key, items] of grouped.person) {
    const display = grouped.personDisplay.get(key) || key
    const email = await resolveEmailForName(display, users)
    const { subject, html, text } = buildPersonEmail(display, items, dateLabel)
    if (dryRun) {
      previewPerson.push({ name: display, email, itemCount: items.length, subject })
    } else if (overrideRecipient) {
      await sendEmail({
        subject: `[SAMPLE for ${display} -> ${email ?? 'unresolved'}] ${subject}`,
        html,
        text,
        to: [overrideRecipient],
      })
      personEmailsSent++
    } else if (email) {
      await sendEmail({ subject, html, text, to: [email] })
      personEmailsSent++
    }
    if (!email) unresolvedNames.push(display)
  }

  // Service master recap — goes to the service inbox (or EOD_RECAP_TO).
  const svc = buildServiceEmail(grouped)
  if (!dryRun) {
    const to = overrideRecipient ? [overrideRecipient] : serviceRecapRecipients()
    const subject = overrideRecipient ? `[SAMPLE -> service@] ${svc.subject}` : svc.subject
    await sendEmail({ subject, html: svc.html, text: svc.text, to })
  }

  return {
    dateLabel,
    totalFlags: grouped.total,
    skipped: false,
    personEmailsSent,
    unresolvedNames,
    serviceRecapSent: !dryRun,
    dryRun,
    preview: dryRun
      ? { person: previewPerson, service: { subject: svc.subject, htmlChars: svc.html.length } }
      : undefined,
  }
}
