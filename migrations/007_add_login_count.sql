-- 007_add_login_count.sql
-- Track total sign-ins per user so owners can see who is actually using
-- the Switchboard. last_login_at already exists from migration 006.

ALTER TABLE tz_users ADD COLUMN IF NOT EXISTS login_count INTEGER NOT NULL DEFAULT 0;
