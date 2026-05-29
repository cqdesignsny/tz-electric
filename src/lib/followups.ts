/**
 * Follow-Ups / Callbacks hub — the live, always-on version of the end-of-day
 * recap email. Lists the callbacks Claire flagged (notify_team_member +
 * flag_for_office_review) that nobody has marked handled yet, so anyone with
 * Switchboard access can see who still needs a call back — no email required.
 *
 * A follow-up IS an existing flag (a tz_agent_messages tool_use row); we never
 * duplicate it. "Handled" is recorded in tz_followup_resolutions keyed on the
 * flag's message id (presence = done). Open = no resolution row.
 *
 * Read-only against existing data + one tiny resolution table. Does not touch
 * Claire, the flag tools, or the EOD recap.
 */
import { db } from './db'
import { SITE_URL } from './agent-notifications'

type Channel = 'voice' | 'web_chat' | 'sms'

export type FollowUpItem = {
  flagMessageId: string
  kind: 'person' | 'general'
  targetName: string | null
  conversationId: string
  channel: Channel | null
  customerName: string | null
  customerPhone: string | null
  summary: string
  priority: 'low' | 'normal' | 'high' | null
  createdAt: string
  link: string
}

export type OpenFollowUps = {
  person: Map<string, FollowUpItem[]> // key = lowercased assignee
  personDisplay: Map<string, string>
  general: FollowUpItem[]
  total: number
}

const FLAG_TOOLS = ['notify_team_member', 'flag_for_office_review']

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null
}

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

type Row = {
  flag_message_id: string
  tool_name: string
  tool_input: Record<string, unknown> | null
  created_at: string
  conversation_id: string
  channel: Channel | null
  customer_name: string | null
  customer_phone: string | null
}

function toItem(row: Row): FollowUpItem {
  const ti = row.tool_input || {}
  const base = {
    flagMessageId: row.flag_message_id,
    conversationId: row.conversation_id,
    channel: row.channel,
    createdAt: row.created_at,
    link: channelLink(row.channel, row.conversation_id),
  }
  if (row.tool_name === 'notify_team_member') {
    return {
      ...base,
      kind: 'person',
      targetName: str(ti.target_name) ?? 'Unassigned',
      customerName: str(ti.caller_name) ?? row.customer_name,
      customerPhone: str(ti.caller_phone) ?? row.customer_phone,
      summary: str(ti.brief_message) ?? 'Wants a callback.',
      priority: null,
    }
  }
  const p = str(ti.priority)
  return {
    ...base,
    kind: 'general',
    targetName: null,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    summary: str(ti.reason) ?? 'Flagged for office review.',
    priority: p === 'low' || p === 'high' ? p : 'normal',
  }
}

/** All open (unresolved) callbacks from the last `daysBack` days, grouped. */
export async function getOpenFollowUps(daysBack = 14): Promise<OpenFollowUps> {
  const sql = db()
  const cutoff = new Date(Date.now() - daysBack * 86_400_000).toISOString()
  const rows = (await sql`
    SELECT m.id AS flag_message_id, m.tool_name, m.tool_input, m.created_at,
           c.id AS conversation_id, c.channel, c.customer_name, c.customer_phone
    FROM tz_agent_messages m
    JOIN tz_agent_conversations c ON c.id = m.conversation_id
    LEFT JOIN tz_followup_resolutions r ON r.flag_message_id = m.id
    WHERE m.role = 'tool_use'
      AND m.tool_name = ANY(${FLAG_TOOLS})
      AND m.created_at >= ${cutoff}
      AND r.flag_message_id IS NULL
    ORDER BY m.created_at DESC
  `) as Row[]

  const person = new Map<string, FollowUpItem[]>()
  const personDisplay = new Map<string, string>()
  const general: FollowUpItem[] = []

  for (const row of rows) {
    const item = toItem(row)
    if (item.kind === 'person') {
      const display = item.targetName || 'Unassigned'
      const key = display.toLowerCase()
      personDisplay.set(key, display)
      const arr = person.get(key) ?? []
      arr.push(item)
      person.set(key, arr)
    } else {
      general.push(item)
    }
  }

  return { person, personDisplay, general, total: rows.length }
}

/** Mark a callback handled with an outcome (presence of a row = done). Idempotent. */
export async function resolveFollowUp(
  flagMessageId: string,
  email: string | null,
  outcome: string | null = null,
  note: string | null = null,
): Promise<void> {
  const sql = db()
  await sql`
    INSERT INTO tz_followup_resolutions (flag_message_id, resolved_by_email, outcome, note)
    VALUES (${flagMessageId}, ${email}, ${outcome}, ${note})
    ON CONFLICT (flag_message_id) DO UPDATE SET
      resolved_by_email = EXCLUDED.resolved_by_email,
      outcome = EXCLUDED.outcome,
      note = EXCLUDED.note,
      resolved_at = NOW()
  `
}

export type ResolvedFollowUp = FollowUpItem & {
  outcome: string | null
  note: string | null
  resolvedByEmail: string | null
  resolvedAt: string
}

/** Recently-handled callbacks (last `daysBack` days) with their outcome, so the
 *  board shows that the call was actually made and what came of it. */
export async function getRecentlyHandled(daysBack = 7): Promise<ResolvedFollowUp[]> {
  const sql = db()
  const cutoff = new Date(Date.now() - daysBack * 86_400_000).toISOString()
  const rows = (await sql`
    SELECT m.id AS flag_message_id, m.tool_name, m.tool_input, m.created_at,
           c.id AS conversation_id, c.channel, c.customer_name, c.customer_phone,
           r.outcome, r.note, r.resolved_by_email, r.resolved_at
    FROM tz_followup_resolutions r
    JOIN tz_agent_messages m ON m.id = r.flag_message_id
    JOIN tz_agent_conversations c ON c.id = m.conversation_id
    WHERE r.resolved_at >= ${cutoff}
    ORDER BY r.resolved_at DESC
    LIMIT 100
  `) as Array<Row & { outcome: string | null; note: string | null; resolved_by_email: string | null; resolved_at: string }>

  return rows.map((row) => ({
    ...toItem(row),
    outcome: row.outcome,
    note: row.note,
    resolvedByEmail: row.resolved_by_email,
    resolvedAt: row.resolved_at,
  }))
}

/** Reopen a callback (remove the resolution). */
export async function reopenFollowUp(flagMessageId: string): Promise<void> {
  const sql = db()
  await sql`DELETE FROM tz_followup_resolutions WHERE flag_message_id = ${flagMessageId}`
}
