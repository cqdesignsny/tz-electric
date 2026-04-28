-- 003_add_estimate_status.sql
-- Two-way HCP estimate status sync. The office team flips estimates
-- Won/Lost in HCP; we periodically read those statuses back into tz_leads
-- so the TZ Switchboard Lead Pipeline can show the same state and filter
-- by it without a roundtrip to HCP on every page load.

ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS estimate_status TEXT;
ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS estimate_status_synced_at TIMESTAMPTZ;
ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS hcp_match_via TEXT;

CREATE INDEX IF NOT EXISTS idx_tz_leads_estimate_status ON tz_leads (estimate_status) WHERE estimate_status IS NOT NULL;
