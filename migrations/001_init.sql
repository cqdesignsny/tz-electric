-- 001_init.sql
-- Initial TZ Switchboard schema. Tables are prefixed `tz_` so this Neon DB
-- can host other things alongside without naming collisions if Cesar / Tyler
-- ever reuse it for adjacent projects.

-- Lead persistence: every form submission, AI agent intake, and (eventually)
-- transcript-derived lead lands here. HCP stays as the source of truth for
-- the office; this table is the source of truth for analytics, history, and
-- anything HCP can't surface (full GCLID/UTM, qualification answers as
-- structured JSON, hidden state, agent attribution).
CREATE TABLE IF NOT EXISTS tz_leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hcp_lead_id     TEXT,
  source          TEXT NOT NULL,
  service_key     TEXT,
  service_label   TEXT,
  first_name      TEXT,
  last_name       TEXT,
  phone           TEXT,
  email           TEXT,
  street          TEXT,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  ownership       TEXT,
  landlord_name   TEXT,
  landlord_phone  TEXT,
  landlord_email  TEXT,
  qualification   JSONB,
  customer_notes  TEXT,
  referral_source TEXT,
  tracking        JSONB,
  hidden          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tz_leads_created_at ON tz_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tz_leads_source     ON tz_leads (source);
CREATE INDEX IF NOT EXISTS idx_tz_leads_email      ON tz_leads (email)       WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tz_leads_phone      ON tz_leads (phone)       WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tz_leads_hcp_id     ON tz_leads (hcp_lead_id) WHERE hcp_lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tz_leads_hidden     ON tz_leads (hidden)      WHERE hidden = TRUE;
