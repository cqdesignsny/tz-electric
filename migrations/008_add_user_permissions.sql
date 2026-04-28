-- 008_add_user_permissions.sql
-- Per-user module access overrides. Defaults still come from role
-- (see lib/modules.ts), but owners can grant or revoke specific
-- modules per-user via /switchboard/users.
--
-- Shape: { "lead-pipeline": true, "reports": false, ... }
-- Missing key = use role default. true = explicit grant. false = explicit revoke.

ALTER TABLE tz_users ADD COLUMN IF NOT EXISTS permissions JSONB;
