-- Follow-Ups / Callbacks hub: track which of Claire's flagged callbacks have
-- been handled, so the live Switchboard board can clear them as staff call
-- people back.
--
-- A "follow-up" is an existing flag Claire already created (a tz_agent_messages
-- tool_use row for notify_team_member or flag_for_office_review). We do NOT
-- duplicate that data — we just record a resolution against the flag's message
-- id. Presence of a row here = handled/done. Open = no row.
--
-- Additive only: a new table keyed on the flag message id. Nothing existing is
-- touched; deleting the underlying message cascades the resolution away.

CREATE TABLE IF NOT EXISTS tz_followup_resolutions (
  flag_message_id   UUID PRIMARY KEY REFERENCES tz_agent_messages(id) ON DELETE CASCADE,
  resolved_by_email TEXT,
  resolved_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note              TEXT
);
