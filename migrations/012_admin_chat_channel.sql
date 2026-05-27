-- Migration 012: Allow 'admin_chat' as a channel on tz_agent_conversations.
--
-- The locked architecture (HANDOFF "Claire as TZ AI", 2026-05-18) puts
-- Claire on the admin side of the Switchboard so Tyler/Terry/Cesar can
-- talk to her conversationally to edit the KB, browse daily reports,
-- and ask about recent activity. Admin chat sessions live in the same
-- tz_agent_conversations table as customer-facing channels (voice, web
-- chat, SMS) so the audit + persistence story stays uniform; only the
-- channel value differs.

ALTER TABLE tz_agent_conversations
  DROP CONSTRAINT IF EXISTS tz_agent_conversations_channel_check;

ALTER TABLE tz_agent_conversations
  ADD CONSTRAINT tz_agent_conversations_channel_check
  CHECK (channel = ANY (ARRAY['sms', 'voice', 'web_chat', 'admin_chat']));
