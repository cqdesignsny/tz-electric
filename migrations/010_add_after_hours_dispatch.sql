-- After-hours emergency dispatch infrastructure.
-- Implements Tyler's 2026-05-18 SOP (TZ_Electric_After_Hours_SOP.md).
--
-- tz_on_call_schedule       — who is on call (tech / supervisor) per date range.
--                              Seeded from the KB calendar in section 3 via
--                              scripts/seed-on-call-schedule.mjs. Tyler can
--                              swap rotation slots without redeploying code.
-- tz_emergency_dispatches   — every after-hours emergency Claire opens.
--                              The escalation cron walks status='open' rows
--                              and fires next-due attempts.
-- tz_dispatch_attempts      — per-attempt audit log (one row per text or call
--                              fired). Idempotent via (dispatch_id, attempt_no,
--                              target_role, channel).

CREATE TABLE IF NOT EXISTS tz_on_call_schedule (
  id              SERIAL PRIMARY KEY,
  role            TEXT NOT NULL CHECK (role IN (
                    'tech',
                    'supervisor',
                    'hvac_emergency',
                    'plumbing_emergency'
                  )),
  person_name     TEXT NOT NULL,
  phone           TEXT NOT NULL,
  starts_on       DATE NOT NULL,
  ends_on         DATE NOT NULL,
  notes           TEXT,
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_on_call_schedule_lookup
  ON tz_on_call_schedule (role, active, starts_on, ends_on);

CREATE TABLE IF NOT EXISTS tz_emergency_dispatches (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id       UUID REFERENCES tz_agent_conversations(id) ON DELETE SET NULL,
  customer_name         TEXT,
  customer_phone        TEXT NOT NULL,
  customer_address      TEXT,
  issue_description     TEXT NOT NULL,
  safety_flags          TEXT[],
  window                TEXT NOT NULL CHECK (window IN (
                          'standard_after_hours',
                          'overnight'
                        )),
  status                TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
                          'open',
                          'resolved_tech_responded',
                          'resolved_supervisor_responded',
                          'closed_no_response',
                          'cancelled'
                        )),
  next_attempt_at       TIMESTAMPTZ, -- when the cron should fire the next step
  next_attempt_no       INTEGER NOT NULL DEFAULT 0,
  opened_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at           TIMESTAMPTZ,
  resolution_notes      TEXT,
  customer_callback_sent_at TIMESTAMPTZ, -- T+60 "team tied up" callback
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_dispatches_status_next
  ON tz_emergency_dispatches (status, next_attempt_at)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_emergency_dispatches_opened
  ON tz_emergency_dispatches (opened_at DESC);

CREATE TABLE IF NOT EXISTS tz_dispatch_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id     UUID NOT NULL REFERENCES tz_emergency_dispatches(id) ON DELETE CASCADE,
  attempt_no      INTEGER NOT NULL,
  target_role     TEXT NOT NULL CHECK (target_role IN ('tech', 'supervisor', 'customer')),
  target_name     TEXT,
  target_phone    TEXT NOT NULL,
  channel         TEXT NOT NULL CHECK (channel IN ('sms', 'voice')),
  status          TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
                    'queued',
                    'sent',
                    'delivered',
                    'failed',
                    'skipped'
                  )),
  twilio_sid      TEXT, -- Twilio Message SID or Call SID for traceback
  error           TEXT,
  fired_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at    TIMESTAMPTZ
);

-- One attempt per (dispatch, attempt_no, target_role, channel) at most.
-- The cron worker uses this to stay idempotent if it retries a tick.
CREATE UNIQUE INDEX IF NOT EXISTS idx_dispatch_attempts_dedupe
  ON tz_dispatch_attempts (dispatch_id, attempt_no, target_role, channel);

CREATE INDEX IF NOT EXISTS idx_dispatch_attempts_by_dispatch
  ON tz_dispatch_attempts (dispatch_id, fired_at);
