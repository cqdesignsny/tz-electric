-- 002_add_hcp_estimate_links.sql
-- Adds HCP customer + estimate linkage so tz_leads can mirror the new
-- "find-or-create customer + create estimate" routing into Housecall Pro.
-- Replaces the prior /leads-only flow where we only stored hcp_lead_id.

ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS hcp_customer_id TEXT;
ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS hcp_estimate_id TEXT;
ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS hcp_customer_existing BOOLEAN;
ALTER TABLE tz_leads ADD COLUMN IF NOT EXISTS hcp_error TEXT;

CREATE INDEX IF NOT EXISTS idx_tz_leads_hcp_customer ON tz_leads (hcp_customer_id) WHERE hcp_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tz_leads_hcp_estimate ON tz_leads (hcp_estimate_id) WHERE hcp_estimate_id IS NOT NULL;
