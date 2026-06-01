-- Call-review marks: flag a call (conversation) as needing review so Claire can
-- be improved from its mistakes. While manually reading call logs, office staff
-- mark any call where Claire slipped up; the flagged set is what a focused
-- review pass pulls later.
--
-- A "mark" is the presence of a row here, keyed on the conversation id. The
-- optional note captures what went wrong (helps the reviewer know what to look
-- for). Additive only; conversation-keyed so it works for any channel, with the
-- call-logs viewer as the first surface. Deleting the conversation cascades the
-- mark away.

CREATE TABLE IF NOT EXISTS tz_call_review_marks (
  conversation_id  UUID PRIMARY KEY REFERENCES tz_agent_conversations(id) ON DELETE CASCADE,
  marked_by_email  TEXT,
  note             TEXT,
  marked_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tz_call_review_marks_at ON tz_call_review_marks (marked_at DESC);
