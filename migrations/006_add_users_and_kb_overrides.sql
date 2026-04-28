-- 006_add_users_and_kb_overrides.sql
-- Per-user identity (Google OAuth) + Tyler-editable KB with provenance
-- tracking + audit log for material actions across the Switchboard.

CREATE TABLE IF NOT EXISTS tz_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  picture_url     TEXT,
  role            TEXT NOT NULL DEFAULT 'office'
                    CHECK (role IN ('owner', 'admin', 'office', 'viewer', 'disabled')),
  google_sub      TEXT UNIQUE,                 -- Google OAuth subject id
  hd              TEXT,                        -- Google Workspace hosted domain
  last_login_at   TIMESTAMPTZ,
  invited_by      TEXT,                        -- email of user who provisioned this account
  disabled_at     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tz_users_role          ON tz_users (role);
CREATE INDEX IF NOT EXISTS idx_tz_users_disabled      ON tz_users (disabled_at) WHERE disabled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tz_users_last_login    ON tz_users (last_login_at DESC);

-- KB overrides: per-section live edits Tyler / TZ users author via the
-- Switchboard. Render = base markdown + applied overrides. Tyler's
-- overrides always win over future code-side base updates.
CREATE TABLE IF NOT EXISTS tz_kb_overrides (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_path    TEXT NOT NULL UNIQUE,        -- canonical heading path, e.g. "1/Field Assessment vs Diagnostic Service"
  heading_level   INTEGER NOT NULL,            -- 2 for H2, 3 for H3
  heading_text    TEXT NOT NULL,
  content         TEXT NOT NULL,               -- override markdown body (without the heading line)
  base_snapshot   TEXT,                        -- snapshot of the base content at the time of edit, for diff display
  edited_by_email TEXT NOT NULL,
  edited_by_role  TEXT NOT NULL,               -- snapshotted from tz_users at edit time
  edit_note       TEXT,                        -- optional editor commentary
  version         INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tz_kb_overrides_path   ON tz_kb_overrides (section_path);
CREATE INDEX IF NOT EXISTS idx_tz_kb_overrides_editor ON tz_kb_overrides (edited_by_email);

-- Append-only history for KB edits so we can show "edited by X 3 days ago"
-- with a hover diff and let owners revert specific revisions.
CREATE TABLE IF NOT EXISTS tz_kb_override_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  override_id     UUID NOT NULL REFERENCES tz_kb_overrides (id) ON DELETE CASCADE,
  section_path    TEXT NOT NULL,
  content         TEXT NOT NULL,
  edited_by_email TEXT NOT NULL,
  edit_note       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tz_kb_history_path     ON tz_kb_override_history (section_path, created_at DESC);

-- Audit log for material actions across the Switchboard. Used by user
-- management (role changes, disable / enable), KB edits (via cross-table
-- write from tz_kb_override_history), and any future irreversible
-- operations. One generic table keeps the surface small.
CREATE TABLE IF NOT EXISTS tz_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email     TEXT NOT NULL,
  actor_role      TEXT,
  action          TEXT NOT NULL,               -- e.g. 'user.role_changed', 'kb.section_overridden'
  target_type     TEXT,                        -- 'user', 'kb_section', 'conversation', 'lead', etc.
  target_id       TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tz_audit_actor    ON tz_audit_log (actor_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tz_audit_action   ON tz_audit_log (action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tz_audit_target   ON tz_audit_log (target_type, target_id) WHERE target_id IS NOT NULL;
