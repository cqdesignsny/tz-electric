-- Migration 009: track the upstream provider's call id on each
-- conversation so voice (Vapi) and SMS (Twilio MessagingServiceSid) can
-- look up the conversation by the vendor's own id across multiple
-- webhook deliveries. Required for the Vapi server-URL pattern, where
-- `tool-calls`, `status-update`, and `end-of-call-report` events all
-- arrive separately and must be stitched back to the conversation row
-- created at `assistant-request`.
--
-- Index is partial (only where the column is not null) to keep it
-- small; the vast majority of voice rows will populate it but web-chat
-- rows never will.
ALTER TABLE tz_agent_conversations
  ADD COLUMN IF NOT EXISTS external_call_id TEXT;

CREATE INDEX IF NOT EXISTS idx_tz_agent_conv_external_call_id
  ON tz_agent_conversations (external_call_id)
  WHERE external_call_id IS NOT NULL;
