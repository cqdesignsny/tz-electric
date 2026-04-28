-- 005_add_agent_conversations.sql
-- Conversation persistence for SMS / voice / web-chat AI agents (Claire).
-- Each conversation is one customer ↔ one channel; messages append in
-- order. Takeover state lets the office staff respond as themselves
-- mid-thread without breaking the agent's reply pattern.

CREATE TABLE IF NOT EXISTS tz_agent_conversations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel              TEXT NOT NULL CHECK (channel IN ('sms', 'voice', 'web_chat')),
  customer_phone       TEXT,
  customer_email       TEXT,
  customer_name        TEXT,

  -- Optional links to TZ records once we know them.
  hcp_customer_id      TEXT,
  tz_lead_id           UUID REFERENCES tz_leads (id) ON DELETE SET NULL,

  -- Channel-derived attribution at the time the conversation started.
  attribution_channel  TEXT,
  attribution_first_touch JSONB,

  -- Lifecycle.
  status               TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'escalated')),
  takeover_by_user     TEXT,                 -- email or name of office staff who took over
  takeover_started_at  TIMESTAMPTZ,
  closed_at            TIMESTAMPTZ,
  closed_reason        TEXT,                 -- 'agent_handoff' / 'office_resolved' / 'customer_closed'

  -- Token / cost tracking for ROI reporting.
  total_input_tokens   INTEGER NOT NULL DEFAULT 0,
  total_output_tokens  INTEGER NOT NULL DEFAULT 0,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tz_agent_conv_channel ON tz_agent_conversations (channel);
CREATE INDEX IF NOT EXISTS idx_tz_agent_conv_status  ON tz_agent_conversations (status);
CREATE INDEX IF NOT EXISTS idx_tz_agent_conv_phone   ON tz_agent_conversations (customer_phone) WHERE customer_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tz_agent_conv_lead    ON tz_agent_conversations (tz_lead_id) WHERE tz_lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tz_agent_conv_created ON tz_agent_conversations (created_at DESC);

CREATE TABLE IF NOT EXISTS tz_agent_messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     UUID NOT NULL REFERENCES tz_agent_conversations (id) ON DELETE CASCADE,

  -- 'user' = inbound from the customer, 'assistant' = Claire's reply,
  -- 'system' = system prompt (rarely persisted, keep for replay debugging),
  -- 'tool_use' = Claire calling a tool, 'tool_result' = the tool output,
  -- 'office' = an office staff reply during takeover.
  role                TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool_use', 'tool_result', 'office')),
  content             TEXT,
  tool_name           TEXT,
  tool_input          JSONB,
  tool_use_id         TEXT,

  -- Vendor-side message id (Twilio SID / Vapi call segment / chat session).
  external_id         TEXT,

  -- Author attribution for office messages.
  authored_by         TEXT,

  -- Per-turn token cost (when known).
  input_tokens        INTEGER,
  output_tokens       INTEGER,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tz_agent_msg_conv    ON tz_agent_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tz_agent_msg_role    ON tz_agent_messages (role);
CREATE INDEX IF NOT EXISTS idx_tz_agent_msg_extid   ON tz_agent_messages (external_id) WHERE external_id IS NOT NULL;
