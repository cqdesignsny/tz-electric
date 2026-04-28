'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { MODULES, type ModuleEntry, type ModuleSlug } from '@/lib/modules'
import type { TzUser, UserRole } from '@/lib/users'

const ROLE_OPTIONS: UserRole[] = ['owner', 'admin', 'office', 'viewer', 'disabled']

type Props = {
  users: TzUser[]
  actorEmail: string
}

export default function UsersClient({ users, actorEmail }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('office')
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function call(action: () => Promise<Response>) {
    setError(null)
    startTransition(async () => {
      try {
        const res = await action()
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(body.error || `Action failed (${res.status})`)
        }
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    })
  }

  function changeRole(email: string, role: UserRole) {
    call(() =>
      fetch('/api/switchboard/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      }),
    )
  }

  function setPermissions(email: string, permissions: Record<string, boolean>) {
    call(() =>
      fetch('/api/switchboard/users/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, permissions }),
      }),
    )
  }

  function invite(e: React.FormEvent) {
    e.preventDefault()
    const email = inviteEmail.trim().toLowerCase()
    if (!email) return
    call(() =>
      fetch('/api/switchboard/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role: inviteRole }),
      }),
    )
    setInviteEmail('')
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={invite}
        className="rounded-2xl border border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0F1C3F] p-5 flex flex-col sm:flex-row sm:items-end gap-3"
      >
        <div className="flex-1">
          <label className="block text-[10px] uppercase tracking-wider font-bold text-blue dark:text-blue-light/80 mb-1">
            Invite by email
          </label>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="someone@tzelectricinc.com"
            className="w-full rounded-xl border border-gray-300 dark:border-navy-light/60 bg-white dark:bg-[#0A1128] px-3 py-2 text-sm text-navy dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-blue dark:text-blue-light/80 mb-1">
            Role
          </label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            className="rounded-xl border border-gray-300 dark:border-navy-light/60 bg-white dark:bg-[#0A1128] px-3 py-2 text-sm text-navy dark:text-white focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
          >
            {ROLE_OPTIONS.filter((r) => r !== 'disabled').map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending || !inviteEmail.trim()}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent-dark disabled:opacity-50"
        >
          {isPending ? 'Working…' : 'Invite'}
        </button>
      </form>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-danger dark:text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-navy-light/40 bg-white dark:bg-[#0F1C3F] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#0A1128]">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Sign-ins</th>
              <th className="text-left px-4 py-3">Last sign-in</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-light/40">
            {users.map((u) => {
              const isSelf = u.email === actorEmail.toLowerCase()
              const isExpanded = expandedEmail === u.email
              return (
                <UserRow
                  key={u.id}
                  user={u}
                  isSelf={isSelf}
                  isExpanded={isExpanded}
                  isPending={isPending}
                  onToggleExpand={() =>
                    setExpandedEmail((cur) => (cur === u.email ? null : u.email))
                  }
                  onRoleChange={(role) => changeRole(u.email, role)}
                  onSavePermissions={(perms) => setPermissions(u.email, perms)}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl">
        Roles are checked on every request — promoting / demoting takes effect immediately on the user&apos;s next page load. Module-level access uses role defaults; click <strong>Customize access</strong> on a row to grant or revoke specific modules per-user.
      </p>
    </div>
  )
}

function UserRow({
  user,
  isSelf,
  isExpanded,
  isPending,
  onToggleExpand,
  onRoleChange,
  onSavePermissions,
}: {
  user: TzUser
  isSelf: boolean
  isExpanded: boolean
  isPending: boolean
  onToggleExpand: () => void
  onRoleChange: (role: UserRole) => void
  onSavePermissions: (perms: Record<string, boolean>) => void
}) {
  const isOwnerLocked = user.role === 'owner'
  return (
    <>
      <tr>
        <td className="px-4 py-3">
          <div className="font-semibold text-navy dark:text-white">
            {user.name || user.email.split('@')[0]}
            {isSelf && (
              <span className="ml-2 text-[10px] uppercase tracking-wider text-blue dark:text-blue-light/80">
                You
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {user.email}
          </div>
        </td>
        <td className="px-4 py-3">
          <select
            value={user.role}
            disabled={isPending || (isSelf && user.role === 'owner')}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="rounded-lg border border-gray-300 dark:border-navy-light/60 bg-white dark:bg-[#0A1128] px-3 py-1.5 text-xs text-navy dark:text-white focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30 disabled:opacity-60"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          {user.login_count > 0 ? (
            <span className="text-sm font-semibold text-navy dark:text-white">
              {user.login_count}
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Pending
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-xs">
          {user.last_login_at ? (
            <>
              <div className="text-navy dark:text-white">
                {relativeTime(user.last_login_at)}
              </div>
              <div className="text-[10px] text-gray-400 dark:text-gray-500">
                {new Date(user.last_login_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">Never</span>
          )}
        </td>
        <td className="px-4 py-3">
          {user.disabled_at || user.role === 'disabled' ? (
            <span className="text-[10px] uppercase tracking-wider font-bold text-red-700 dark:text-red-300">
              Disabled
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300">
              Active
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          {isOwnerLocked ? (
            <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Full access
            </span>
          ) : (
            <button
              type="button"
              onClick={onToggleExpand}
              disabled={isPending}
              className="text-xs font-semibold rounded-full border border-gray-300 dark:border-navy-light/60 px-3 py-1 text-navy dark:text-white hover:border-blue hover:text-blue disabled:opacity-50"
            >
              {isExpanded ? 'Close' : 'Customize access'}
            </button>
          )}
        </td>
      </tr>
      {isExpanded && !isOwnerLocked && (
        <tr>
          <td colSpan={6} className="bg-gray-50 dark:bg-[#0A1128] px-4 py-5 border-t border-gray-100 dark:border-navy-light/40">
            <PermissionEditor
              user={user}
              isPending={isPending}
              onSave={onSavePermissions}
            />
          </td>
        </tr>
      )}
    </>
  )
}

function PermissionEditor({
  user,
  isPending,
  onSave,
}: {
  user: TzUser
  isPending: boolean
  onSave: (perms: Record<string, boolean>) => void
}) {
  const editable = MODULES.filter((m) => !m.ownerOnly)
  const role = user.role as UserRole
  const stored = user.permissions || {}

  // Resolve effective access for each editable module given role + overrides.
  const initial = useMemo<Record<ModuleSlug, boolean>>(() => {
    const out = {} as Record<ModuleSlug, boolean>
    for (const m of editable) {
      const explicit = stored[m.slug]
      out[m.slug] =
        typeof explicit === 'boolean'
          ? explicit
          : m.defaultRoles.includes(role)
    }
    return out
  }, [editable, stored, role])

  const [pending, setPending] = useState<Record<ModuleSlug, boolean>>(initial)
  const dirty = editable.some((m) => pending[m.slug] !== initial[m.slug])

  const grouped = {
    operations: editable.filter((m) => m.category === 'operations'),
    agents: editable.filter((m) => m.category === 'agents'),
  }

  function toggle(slug: ModuleSlug) {
    setPending((p) => ({ ...p, [slug]: !p[slug] }))
  }

  function save() {
    // Only persist explicit overrides (i.e. values that differ from role default)
    // so role changes still affect modules the owner hasn't customized.
    const out: Record<string, boolean> = {}
    for (const m of editable) {
      const def = m.defaultRoles.includes(role)
      if (pending[m.slug] !== def) out[m.slug] = pending[m.slug]
    }
    onSave(out)
  }

  function reset() {
    const cleared = {} as Record<ModuleSlug, boolean>
    for (const m of editable) cleared[m.slug] = m.defaultRoles.includes(role)
    setPending(cleared)
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider font-bold text-blue dark:text-blue-light/80">
            Module access for {user.name || user.email}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Defaults come from the <span className="capitalize font-semibold">{role}</span> role. Tick a box to grant, untick to revoke. Anything you change overrides the role default.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={isPending}
            className="text-xs font-semibold rounded-full border border-gray-300 dark:border-navy-light/60 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:border-gray-400 hover:text-navy dark:hover:text-white disabled:opacity-50"
          >
            Reset to role defaults
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isPending || !dirty}
            className="text-xs font-bold rounded-full bg-blue px-4 py-1.5 text-white hover:bg-blue-dark disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Save access'}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
        <ModuleGroup
          title="Operations"
          items={grouped.operations}
          role={role}
          pending={pending}
          stored={stored}
          onToggle={toggle}
        />
        <ModuleGroup
          title="AI Agents"
          items={grouped.agents}
          role={role}
          pending={pending}
          stored={stored}
          onToggle={toggle}
        />
      </div>
    </div>
  )
}

function ModuleGroup({
  title,
  items,
  role,
  pending,
  stored,
  onToggle,
}: {
  title: string
  items: ModuleEntry[]
  role: UserRole
  pending: Record<ModuleSlug, boolean>
  stored: Record<string, boolean>
  onToggle: (slug: ModuleSlug) => void
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-500 dark:text-gray-400 mb-2">
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((m) => {
          const def = m.defaultRoles.includes(role)
          const checked = pending[m.slug]
          const isOverride = typeof stored[m.slug] === 'boolean'
          return (
            <li key={m.slug}>
              <label className="flex items-start gap-3 px-2 py-1.5 rounded-lg hover:bg-white dark:hover:bg-navy-light/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(m.slug)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-navy-light/60 text-blue focus:ring-blue"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-navy dark:text-white truncate">
                    {m.label}
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    Role default:{' '}
                    <span className={def ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-400 dark:text-gray-500'}>
                      {def ? 'allowed' : 'not allowed'}
                    </span>
                    {isOverride && (
                      <span className="ml-2 text-amber-600 dark:text-amber-400">
                        · custom override
                      </span>
                    )}
                  </div>
                </div>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.round((now - then) / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.round(diffHr / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  return `${Math.round(diffDay / 30)}mo ago`
}
