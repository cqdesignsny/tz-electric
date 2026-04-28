-- 004_add_attribution.sql
-- Multi-channel attribution: derived channel label, first-touch snapshot,
-- and the entry referrer. Powers the channel filter on the Lead Pipeline,
-- the channel breakdown report on the TZ Switchboard, and conversion
-- value mapping for Google Ads / Meta Pixel reporting.

ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS attribution_channel TEXT;
ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS attribution_first_touch JSONB;
ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS attribution_referrer TEXT;
ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS attribution_value_cents INTEGER;

CREATE INDEX IF NOT EXISTS idx_tz_leads_channel ON tz_leads (attribution_channel) WHERE attribution_channel IS NOT NULL;
