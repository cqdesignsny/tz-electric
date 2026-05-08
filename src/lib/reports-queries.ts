/**
 * Aggregation queries for the TZ Switchboard Reports module. Reads from
 * Neon (tz_leads + tz_agent_conversations + tz_agent_messages) and shapes
 * the data into the structures the Reports page renders directly. Keeps
 * SQL out of the page component and one obvious place to tune.
 *
 * Date range is always inclusive on both ends. Pass ISO strings or Date.
 */
import { db } from './db'

export type DateRange = {
  /** ISO timestamp at the start of the window (inclusive). */
  start: string
  /** ISO timestamp at the end of the window (inclusive). */
  end: string
}

export function rangeFromDays(days: number): DateRange {
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  start.setHours(0, 0, 0, 0)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function rangeForYesterday(): DateRange {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

// ============================================================================
// LEAD VOLUME OVER TIME
// ============================================================================

export type LeadVolumePoint = {
  /** YYYY-MM-DD bucket. */
  date: string
  /** Map of channel → count. */
  channels: Record<string, number>
  /** Total across channels for this day. */
  total: number
}

export async function getLeadVolumeByDay(range: DateRange): Promise<LeadVolumePoint[]> {
  const sql = db()
  type Row = { day: string; channel: string | null; n: number }
  const rows = (await sql`
    SELECT
      to_char(date_trunc('day', created_at AT TIME ZONE 'America/New_York'), 'YYYY-MM-DD') AS day,
      COALESCE(attribution_channel, 'Direct') AS channel,
      COUNT(*)::int AS n
    FROM tz_leads
    WHERE hidden = FALSE
      AND created_at >= ${range.start}
      AND created_at <= ${range.end}
    GROUP BY 1, 2
    ORDER BY 1
  `) as unknown as Row[]

  // Densify: ensure every day in range has an entry even if zero leads.
  const out = new Map<string, LeadVolumePoint>()
  const startD = new Date(range.start)
  const endD = new Date(range.end)
  for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10)
    out.set(key, { date: key, channels: {}, total: 0 })
  }
  for (const r of rows) {
    const point = out.get(r.day) || { date: r.day, channels: {}, total: 0 }
    point.channels[r.channel || 'Direct'] = r.n
    point.total += r.n
    out.set(r.day, point)
  }
  return Array.from(out.values()).sort((a, b) => a.date.localeCompare(b.date))
}

// ============================================================================
// CHANNEL BREAKDOWN
// ============================================================================

export type ChannelBreakdownRow = {
  channel: string
  count: number
  share: number // 0..1
  valueCents: number
}

export async function getChannelBreakdown(range: DateRange): Promise<ChannelBreakdownRow[]> {
  const sql = db()
  type Row = { channel: string; n: number; value_cents: number }
  const rows = (await sql`
    SELECT
      COALESCE(attribution_channel, 'Direct') AS channel,
      COUNT(*)::int AS n,
      COALESCE(SUM(attribution_value_cents), 0)::int AS value_cents
    FROM tz_leads
    WHERE hidden = FALSE
      AND created_at >= ${range.start}
      AND created_at <= ${range.end}
    GROUP BY 1
    ORDER BY n DESC
  `) as unknown as Row[]

  const total = rows.reduce((s, r) => s + r.n, 0) || 1
  return rows.map((r) => ({
    channel: r.channel,
    count: r.n,
    share: r.n / total,
    valueCents: r.value_cents,
  }))
}

// ============================================================================
// SERVICE MIX
// ============================================================================

export type ServiceMixRow = {
  serviceLabel: string
  count: number
  share: number
}

export async function getServiceMix(range: DateRange): Promise<ServiceMixRow[]> {
  const sql = db()
  type Row = { service_label: string; n: number }
  const rows = (await sql`
    SELECT
      COALESCE(NULLIF(service_label, ''), 'Unspecified') AS service_label,
      COUNT(*)::int AS n
    FROM tz_leads
    WHERE hidden = FALSE
      AND created_at >= ${range.start}
      AND created_at <= ${range.end}
    GROUP BY 1
    ORDER BY n DESC
  `) as unknown as Row[]

  const total = rows.reduce((s, r) => s + r.n, 0) || 1
  return rows.map((r) => ({
    serviceLabel: r.service_label,
    count: r.n,
    share: r.n / total,
  }))
}

// ============================================================================
// HEADLINE NUMBERS
// ============================================================================

export type HeadlineStats = {
  totalLeads: number
  totalLeadsPrev: number
  webFormLeads: number
  agentLeads: number
  totalValueCents: number
  hcpSyncErrors: number
}

export async function getHeadlineStats(range: DateRange): Promise<HeadlineStats> {
  const sql = db()
  // Window length, mirrored backwards for prev-period comparison.
  const ms = new Date(range.end).getTime() - new Date(range.start).getTime()
  const prevEnd = new Date(range.start)
  const prevStart = new Date(prevEnd.getTime() - ms)

  type Row = {
    total: number
    web_form: number
    agent: number
    value_cents: number
    sync_errors: number
  }
  const [cur] = (await sql`
    SELECT
      COUNT(*)::int                                                                AS total,
      COUNT(*) FILTER (WHERE source = 'web_form')::int                              AS web_form,
      COUNT(*) FILTER (WHERE source IN ('web_chat','sms_agent','voice_agent'))::int AS agent,
      COALESCE(SUM(attribution_value_cents), 0)::int                                AS value_cents,
      COUNT(*) FILTER (WHERE hcp_error IS NOT NULL)::int                            AS sync_errors
    FROM tz_leads
    WHERE hidden = FALSE
      AND created_at >= ${range.start}
      AND created_at <= ${range.end}
  `) as unknown as Row[]

  const [prev] = (await sql`
    SELECT COUNT(*)::int AS total
    FROM tz_leads
    WHERE hidden = FALSE
      AND created_at >= ${prevStart.toISOString()}
      AND created_at <  ${range.start}
  `) as unknown as { total: number }[]

  return {
    totalLeads: cur?.total ?? 0,
    totalLeadsPrev: prev?.total ?? 0,
    webFormLeads: cur?.web_form ?? 0,
    agentLeads: cur?.agent ?? 0,
    totalValueCents: cur?.value_cents ?? 0,
    hcpSyncErrors: cur?.sync_errors ?? 0,
  }
}

// ============================================================================
// CONVERSATION STATS (Claire)
// ============================================================================

export type ConversationStats = {
  total: number
  byChannel: Array<{ channel: string; count: number }>
  withContact: number
  withoutContact: number
  withLead: number
  escalated: number
}

export async function getConversationStats(range: DateRange): Promise<ConversationStats> {
  const sql = db()
  type Row = {
    total: number
    with_contact: number
    without_contact: number
    with_lead: number
    escalated: number
  }
  const [agg] = (await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (
        WHERE customer_phone IS NOT NULL OR customer_name IS NOT NULL
      )::int AS with_contact,
      COUNT(*) FILTER (
        WHERE customer_phone IS NULL AND customer_name IS NULL
      )::int AS without_contact,
      COUNT(*) FILTER (WHERE tz_lead_id IS NOT NULL)::int AS with_lead,
      COUNT(*) FILTER (WHERE status = 'escalated')::int   AS escalated
    FROM tz_agent_conversations
    WHERE created_at >= ${range.start}
      AND created_at <= ${range.end}
  `) as unknown as Row[]

  type ChannelRow = { channel: string; n: number }
  const channelRows = (await sql`
    SELECT channel, COUNT(*)::int AS n
    FROM tz_agent_conversations
    WHERE created_at >= ${range.start}
      AND created_at <= ${range.end}
    GROUP BY 1
    ORDER BY n DESC
  `) as unknown as ChannelRow[]

  return {
    total: agg?.total ?? 0,
    byChannel: channelRows.map((r) => ({ channel: r.channel, count: r.n })),
    withContact: agg?.with_contact ?? 0,
    withoutContact: agg?.without_contact ?? 0,
    withLead: agg?.with_lead ?? 0,
    escalated: agg?.escalated ?? 0,
  }
}

// ============================================================================
// CONVERSATIONS THAT NEVER CAPTURED CONTACT (Tyler's specific ask 2026-05-02)
// "I want to flag conversations where somebody doesn't share their info so
//  we can audit if it was the info that was relayed or if the AI didn't
//  handle it well."
// ============================================================================

export type NoContactConversation = {
  id: string
  channel: string
  createdAt: string
  status: string
  messageCount: number
  firstUserMessage: string | null
  lastAssistantMessage: string | null
  attributionChannel: string | null
}

export async function getNoContactConversations(range: DateRange, limit = 50): Promise<NoContactConversation[]> {
  const sql = db()
  type Row = {
    id: string
    channel: string
    created_at: string
    status: string
    attribution_channel: string | null
    message_count: number
    first_user: string | null
    last_assistant: string | null
  }
  const rows = (await sql`
    SELECT
      c.id,
      c.channel,
      c.created_at,
      c.status,
      c.attribution_channel,
      (SELECT COUNT(*)::int FROM tz_agent_messages m WHERE m.conversation_id = c.id) AS message_count,
      (
        SELECT m.content FROM tz_agent_messages m
        WHERE m.conversation_id = c.id AND m.role = 'user' AND m.content IS NOT NULL
        ORDER BY m.created_at ASC LIMIT 1
      ) AS first_user,
      (
        SELECT m.content FROM tz_agent_messages m
        WHERE m.conversation_id = c.id AND m.role = 'assistant' AND m.content IS NOT NULL
        ORDER BY m.created_at DESC LIMIT 1
      ) AS last_assistant
    FROM tz_agent_conversations c
    WHERE c.created_at >= ${range.start}
      AND c.created_at <= ${range.end}
      AND c.customer_phone IS NULL
      AND c.customer_name IS NULL
      AND c.tz_lead_id IS NULL
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `) as unknown as Row[]

  return rows.map((r) => ({
    id: r.id,
    channel: r.channel,
    createdAt: r.created_at,
    status: r.status,
    messageCount: r.message_count,
    firstUserMessage: r.first_user,
    lastAssistantMessage: r.last_assistant,
    attributionChannel: r.attribution_channel,
  }))
}
