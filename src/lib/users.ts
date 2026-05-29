/**
 * Per-user identity layer for the TZ Switchboard. Backed by `tz_users`
 * (migration 006). Wraps OAuth sign-in upserts, role lookups, role
 * changes, disable / re-enable, and listing for the user-management UI.
 *
 * Authoritative role for any session is read from this table on every
 * request; the JWT carries only the email. That way an owner can
 * disable a user mid-session and the next request reflects it.
 */

import { db } from './db'
import { ADMIN_EMAILS, OWNER_EMAILS } from './auth-config'
import { findModule, type ModuleSlug } from './modules'

export type UserRole = 'owner' | 'admin' | 'office' | 'viewer' | 'disabled'

export type TzUser = {
  id: string
  email: string
  name: string | null
  picture_url: string | null
  role: UserRole
  google_sub: string | null
  hd: string | null
  last_login_at: string | null
  login_count: number
  permissions: Record<string, boolean> | null
  invited_by: string | null
  disabled_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type UpsertUserInput = {
  email: string
  name: string | null
  pictureUrl: string | null
  googleSub: string | null
  hd: string | null
}

/**
 * Called from the NextAuth signIn callback on every successful Google
 * authentication. Idempotent — safe to call repeatedly. First sign-in
 * for an email creates the row with a sensible default role; later
 * sign-ins update profile fields + last_login_at without clobbering
 * the role (owners may have promoted/demoted the user manually).
 */
export async function upsertUserOnSignIn(input: UpsertUserInput): Promise<TzUser> {
  const sql = db()
  const email = input.email.toLowerCase()

  const defaultRole: UserRole = OWNER_EMAILS.includes(email)
    ? 'owner'
    : ADMIN_EMAILS.includes(email)
      ? 'admin'
      : 'office'

  // Upsert by email. On conflict, only refresh profile + last_login,
  // never role (so we don't undo an owner's manual promotion/demotion).
  const rows = (await sql`
    INSERT INTO tz_users (email, name, picture_url, google_sub, hd, role, last_login_at, login_count)
    VALUES (
      ${email},
      ${input.name},
      ${input.pictureUrl},
      ${input.googleSub},
      ${input.hd},
      ${defaultRole},
      NOW(),
      1
    )
    ON CONFLICT (email) DO UPDATE SET
      name          = COALESCE(EXCLUDED.name, tz_users.name),
      picture_url   = COALESCE(EXCLUDED.picture_url, tz_users.picture_url),
      google_sub    = COALESCE(EXCLUDED.google_sub, tz_users.google_sub),
      hd            = COALESCE(EXCLUDED.hd, tz_users.hd),
      last_login_at = NOW(),
      login_count   = tz_users.login_count + 1,
      updated_at    = NOW()
    RETURNING *
  `) as TzUser[]

  return rows[0]
}

/**
 * Fetch the authenticated user's tz_users row. Returns null if the
 * session is unauthenticated or the user has been disabled.
 */
export async function getUserByEmail(email: string): Promise<TzUser | null> {
  const sql = db()
  const rows = (await sql`
    SELECT * FROM tz_users WHERE email = ${email.toLowerCase()} LIMIT 1
  `) as TzUser[]
  return rows[0] || null
}

export async function listUsers(opts: { includeDisabled?: boolean } = {}): Promise<TzUser[]> {
  const sql = db()
  if (opts.includeDisabled) {
    return (await sql`
      SELECT * FROM tz_users
      ORDER BY (role = 'owner') DESC, (role = 'admin') DESC, last_login_at DESC NULLS LAST, email ASC
    `) as TzUser[]
  }
  return (await sql`
    SELECT * FROM tz_users
    WHERE disabled_at IS NULL AND role <> 'disabled'
    ORDER BY (role = 'owner') DESC, (role = 'admin') DESC, last_login_at DESC NULLS LAST, email ASC
  `) as TzUser[]
}

export async function setUserRole(
  email: string,
  role: UserRole,
  actor: { email: string; role: UserRole },
): Promise<TzUser> {
  if (actor.role !== 'owner') {
    throw new Error('Only owners can change user roles')
  }
  const target = email.toLowerCase()
  if (target === actor.email.toLowerCase() && role !== 'owner') {
    throw new Error('Owners cannot demote themselves; ask another owner to do it')
  }

  const sql = db()
  const rows = (await sql`
    UPDATE tz_users
    SET role = ${role},
        disabled_at = ${role === 'disabled' ? new Date().toISOString() : null}::timestamptz,
        updated_at = NOW()
    WHERE email = ${target}
    RETURNING *
  `) as TzUser[]
  if (rows.length === 0) throw new Error(`No user with email ${target}`)

  await sql`
    INSERT INTO tz_audit_log (actor_email, actor_role, action, target_type, target_id, metadata)
    VALUES (
      ${actor.email.toLowerCase()},
      ${actor.role},
      ${'user.role_changed'},
      ${'user'},
      ${target},
      ${JSON.stringify({ new_role: role })}::jsonb
    )
  `

  return rows[0]
}

/**
 * Update a user's display name. Owner-only. Used to fix names that came in
 * wrong/lowercased from the OAuth profile (e.g. "mike" -> "Mike Smith").
 * Does not touch role or access. Audit-logged.
 */
export async function setUserName(
  email: string,
  name: string,
  actor: { email: string; role: UserRole },
): Promise<TzUser> {
  if (actor.role !== 'owner') {
    throw new Error('Only owners can edit user names')
  }
  const target = email.toLowerCase()
  const clean = name.trim().slice(0, 80)
  if (!clean) {
    throw new Error('Name cannot be empty')
  }

  const sql = db()
  const rows = (await sql`
    UPDATE tz_users
    SET name = ${clean},
        updated_at = NOW()
    WHERE email = ${target}
    RETURNING *
  `) as TzUser[]
  if (rows.length === 0) throw new Error(`No user with email ${target}`)

  await sql`
    INSERT INTO tz_audit_log (actor_email, actor_role, action, target_type, target_id, metadata)
    VALUES (
      ${actor.email.toLowerCase()},
      ${actor.role},
      ${'user.name_changed'},
      ${'user'},
      ${target},
      ${JSON.stringify({ new_name: clean })}::jsonb
    )
  `

  return rows[0]
}

export async function inviteUser(
  email: string,
  role: UserRole,
  actor: { email: string; role: UserRole },
): Promise<TzUser> {
  if (actor.role !== 'owner') {
    throw new Error('Only owners can invite users')
  }
  const target = email.toLowerCase().trim()

  const sql = db()
  const rows = (await sql`
    INSERT INTO tz_users (email, role, invited_by)
    VALUES (${target}, ${role}, ${actor.email.toLowerCase()})
    ON CONFLICT (email) DO UPDATE SET
      role = EXCLUDED.role,
      invited_by = COALESCE(tz_users.invited_by, EXCLUDED.invited_by),
      disabled_at = NULL,
      updated_at = NOW()
    RETURNING *
  `) as TzUser[]

  await sql`
    INSERT INTO tz_audit_log (actor_email, actor_role, action, target_type, target_id, metadata)
    VALUES (
      ${actor.email.toLowerCase()},
      ${actor.role},
      ${'user.invited'},
      ${'user'},
      ${target},
      ${JSON.stringify({ role })}::jsonb
    )
  `

  return rows[0]
}

/**
 * Capability gates per role. Keeping these in one place so as we add new
 * modules to the Switchboard, the role grant/revoke story stays
 * legible. Tighten / loosen here rather than scattering checks.
 */
export function canAccessSwitchboard(role: UserRole | undefined | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'office' || role === 'viewer'
}

export function canManageUsers(role: UserRole | undefined | null): boolean {
  return role === 'owner'
}

export function canEditKnowledgeBase(role: UserRole | undefined | null): boolean {
  return role === 'owner' || role === 'admin'
}

export function canActOnLeads(role: UserRole | undefined | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'office'
}

export function canTakeOverConversation(role: UserRole | undefined | null): boolean {
  return role === 'owner' || role === 'admin' || role === 'office'
}

/**
 * Whether a user can access a specific Switchboard module. Resolution:
 *   1. Owners can access everything (including ownerOnly modules).
 *   2. ownerOnly modules: only owners. No override grants access.
 *   3. Per-user explicit override (true/false) wins over role default.
 *   4. Otherwise, role default from MODULES catalog.
 */
export function canAccessModule(
  user: { role?: UserRole | string | null; permissions?: Record<string, boolean> | null } | null | undefined,
  slug: ModuleSlug | string,
): boolean {
  if (!user || !user.role) return false
  const role = user.role as UserRole

  if (role === 'disabled') return false
  if (role === 'owner') return true

  const mod = findModule(slug)
  if (!mod) return false

  if (mod.ownerOnly) return false

  const explicit = user.permissions?.[slug]
  if (typeof explicit === 'boolean') return explicit

  return mod.defaultRoles.includes(role)
}

export type SetPermissionsInput = {
  email: string
  permissions: Record<string, boolean>
  actor: { email: string; role: UserRole }
}

export async function setUserPermissions(input: SetPermissionsInput): Promise<TzUser> {
  if (input.actor.role !== 'owner') {
    throw new Error('Only owners can change user permissions')
  }
  const target = input.email.toLowerCase()
  const sql = db()
  const rows = (await sql`
    UPDATE tz_users
    SET permissions = ${JSON.stringify(input.permissions)}::jsonb,
        updated_at = NOW()
    WHERE email = ${target}
    RETURNING *
  `) as TzUser[]
  if (rows.length === 0) throw new Error(`No user with email ${target}`)

  await sql`
    INSERT INTO tz_audit_log (actor_email, actor_role, action, target_type, target_id, metadata)
    VALUES (
      ${input.actor.email.toLowerCase()},
      ${input.actor.role},
      ${'user.permissions_changed'},
      ${'user'},
      ${target},
      ${JSON.stringify({ permissions: input.permissions })}::jsonb
    )
  `

  return rows[0]
}
