/**
 * Conversation persistence for the AI agent (Claire) across SMS, voice,
 * and web chat. One conversation = one customer ↔ one channel; messages
 * append in chronological order. Office staff can take over a thread
 * mid-flight; their replies are persisted with role='office' so the
 * transcript stays intact.
 */
import { db } from './db'

export type AgentChannel = 'sms' | 'voice' | 'web_chat'
export type AgentConversationStatus = 'open' | 'closed' | 'escalated'
export type AgentMessageRole =
  | 'user'
  | 'assistant'
  | 'system'
  | 'tool_use'
  | 'tool_result'
  | 'office'

export type AgentConversation = {
  id: string
  channel: AgentChannel
  customer_phone: string | null
  customer_email: string | null
  customer_name: string | null
  hcp_customer_id: string | null
  tz_lead_id: string | null
  attribution_channel: string | null
  attribution_first_touch: Record<string, unknown> | null
  status: AgentConversationStatus
  takeover_by_user: string | null
  takeover_started_at: string | null
  closed_at: string | null
  closed_reason: string | null
  total_input_tokens: number
  total_output_tokens: number
  external_call_id: string | null
  created_at: string
  updated_at: string
}

export type AgentMessage = {
  id: string
  conversation_id: string
  role: AgentMessageRole
  content: string | null
  tool_name: string | null
  tool_input: Record<string, unknown> | null
  tool_use_id: string | null
  external_id: string | null
  authored_by: string | null
  input_tokens: number | null
  output_tokens: number | null
  created_at: string
}

export type StartConversationInput = {
  channel: AgentChannel
  customerPhone?: string | null
  customerEmail?: string | null
  customerName?: string | null
  hcpCustomerId?: string | null
  tzLeadId?: string | null
  attributionChannel?: string | null
  attributionFirstTouch?: Record<string, unknown> | null
  /**
   * Upstream provider's call id (Vapi `call.id`, Twilio `MessagingSid`,
   * etc.). When supplied, the lookup also tries this id first so
   * multiple webhook events from the same vendor call stitch back to
   * the same conversation row. Voice (Vapi) relies on this because the
   * caller phone isn't always known at `assistant-request` time but
   * subsequent `tool-calls` events do carry the call id.
   */
  externalCallId?: string | null
}

/**
 * Find an open conversation for this channel + phone, or start a new
 * one. Lookup precedence: externalCallId (when given) → channel+phone
 * → fresh insert. SMS conversations are keyed by customer phone, voice
 * conversations are keyed by Vapi call id (since the caller phone is
 * captured asynchronously).
 */
export async function findOrStartConversation(
  input: StartConversationInput,
): Promise<AgentConversation> {
  const sql = db()

  if (input.externalCallId) {
    const existing = (await sql`
      SELECT * FROM tz_agent_conversations
      WHERE external_call_id = ${input.externalCallId}
      LIMIT 1
    `) as AgentConversation[]
    if (existing.length > 0) return existing[0]
  }

  if (input.customerPhone) {
    const existing = (await sql`
      SELECT * FROM tz_agent_conversations
      WHERE channel = ${input.channel}
        AND customer_phone = ${input.customerPhone}
        AND status = 'open'
      ORDER BY created_at DESC
      LIMIT 1
    `) as AgentConversation[]
    if (existing.length > 0) return existing[0]
  }

  const rows = (await sql`
    INSERT INTO tz_agent_conversations (
      channel, customer_phone, customer_email, customer_name,
      hcp_customer_id, tz_lead_id,
      attribution_channel, attribution_first_touch,
      external_call_id
    ) VALUES (
      ${input.channel},
      ${input.customerPhone ?? null},
      ${input.customerEmail ?? null},
      ${input.customerName ?? null},
      ${input.hcpCustomerId ?? null},
      ${input.tzLeadId ?? null},
      ${input.attributionChannel ?? null},
      ${input.attributionFirstTouch ? JSON.stringify(input.attributionFirstTouch) : null}::jsonb,
      ${input.externalCallId ?? null}
    )
    RETURNING *
  `) as AgentConversation[]
  return rows[0]
}

/**
 * Lookup-only variant for follow-up webhooks (Vapi `tool-calls`,
 * `end-of-call-report`, `status-update`) where we only have the call id
 * and need the existing conversation. Returns null if not found.
 */
export async function findConversationByExternalCallId(
  externalCallId: string,
): Promise<AgentConversation | null> {
  const sql = db()
  const rows = (await sql`
    SELECT * FROM tz_agent_conversations
    WHERE external_call_id = ${externalCallId}
    LIMIT 1
  `) as AgentConversation[]
  return rows[0] || null
}

export type AppendMessageInput = {
  conversationId: string
  role: AgentMessageRole
  content?: string | null
  toolName?: string | null
  toolInput?: Record<string, unknown> | null
  toolUseId?: string | null
  externalId?: string | null
  authoredBy?: string | null
  inputTokens?: number | null
  outputTokens?: number | null
}

export async function appendMessage(input: AppendMessageInput): Promise<AgentMessage> {
  const sql = db()
  const rows = (await sql`
    INSERT INTO tz_agent_messages (
      conversation_id, role, content,
      tool_name, tool_input, tool_use_id,
      external_id, authored_by,
      input_tokens, output_tokens
    ) VALUES (
      ${input.conversationId},
      ${input.role},
      ${input.content ?? null},
      ${input.toolName ?? null},
      ${input.toolInput ? JSON.stringify(input.toolInput) : null}::jsonb,
      ${input.toolUseId ?? null},
      ${input.externalId ?? null},
      ${input.authoredBy ?? null},
      ${input.inputTokens ?? null},
      ${input.outputTokens ?? null}
    )
    RETURNING *
  `) as AgentMessage[]

  // Roll up token totals for cost reporting.
  if (input.inputTokens || input.outputTokens) {
    await sql`
      UPDATE tz_agent_conversations
      SET total_input_tokens  = total_input_tokens  + ${input.inputTokens ?? 0},
          total_output_tokens = total_output_tokens + ${input.outputTokens ?? 0},
          updated_at = NOW()
      WHERE id = ${input.conversationId}
    `
  } else {
    await sql`
      UPDATE tz_agent_conversations
      SET updated_at = NOW()
      WHERE id = ${input.conversationId}
    `
  }

  return rows[0]
}

export async function listMessages(
  conversationId: string,
  limit = 200,
): Promise<AgentMessage[]> {
  const sql = db()
  return (await sql`
    SELECT * FROM tz_agent_messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
    LIMIT ${limit}
  `) as AgentMessage[]
}

export type ListConversationsOptions = {
  channel?: AgentChannel
  status?: AgentConversationStatus
  limit?: number
  offset?: number
}

export async function listConversations(
  opts: ListConversationsOptions = {},
): Promise<AgentConversation[]> {
  const sql = db()
  const limit = Math.min(opts.limit ?? 50, 200)
  const offset = opts.offset ?? 0

  if (opts.channel && opts.status) {
    return (await sql`
      SELECT * FROM tz_agent_conversations
      WHERE channel = ${opts.channel} AND status = ${opts.status}
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as AgentConversation[]
  }
  if (opts.channel) {
    return (await sql`
      SELECT * FROM tz_agent_conversations
      WHERE channel = ${opts.channel}
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as AgentConversation[]
  }
  if (opts.status) {
    return (await sql`
      SELECT * FROM tz_agent_conversations
      WHERE status = ${opts.status}
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as AgentConversation[]
  }
  return (await sql`
    SELECT * FROM tz_agent_conversations
    ORDER BY updated_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `) as AgentConversation[]
}

export async function getConversation(id: string): Promise<AgentConversation | null> {
  const sql = db()
  const rows = (await sql`
    SELECT * FROM tz_agent_conversations WHERE id = ${id}
  `) as AgentConversation[]
  return rows[0] || null
}

export type TakeoverInput = {
  conversationId: string
  user: string
}

export async function takeOverConversation(input: TakeoverInput): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_agent_conversations
    SET takeover_by_user = ${input.user},
        takeover_started_at = NOW(),
        updated_at = NOW()
    WHERE id = ${input.conversationId}
  `
}

export async function releaseTakeover(conversationId: string): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_agent_conversations
    SET takeover_by_user = NULL,
        takeover_started_at = NULL,
        updated_at = NOW()
    WHERE id = ${conversationId}
  `
}

export async function closeConversation(
  conversationId: string,
  reason: string,
): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_agent_conversations
    SET status = 'closed',
        closed_at = NOW(),
        closed_reason = ${reason},
        updated_at = NOW()
    WHERE id = ${conversationId}
  `
}

export async function escalateConversation(
  conversationId: string,
  reason: string,
): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_agent_conversations
    SET status = 'escalated',
        closed_reason = ${reason},
        updated_at = NOW()
    WHERE id = ${conversationId}
  `
}

export async function attachLeadToConversation(
  conversationId: string,
  tzLeadId: string,
  hcpCustomerId?: string | null,
): Promise<void> {
  const sql = db()
  await sql`
    UPDATE tz_agent_conversations
    SET tz_lead_id = ${tzLeadId},
        hcp_customer_id = COALESCE(${hcpCustomerId ?? null}, hcp_customer_id),
        updated_at = NOW()
    WHERE id = ${conversationId}
  `
}
