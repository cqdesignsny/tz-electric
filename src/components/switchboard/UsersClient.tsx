'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
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
              <th className="text-left px-4 py-3">Last sign-in</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-light/40">
            {users.map((u) => {
              const isSelf = u.email === actorEmail.toLowerCase()
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-navy dark:text-white">
                      {u.name || u.email.split('@')[0]}
                      {isSelf && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-blue dark:text-blue-light/80">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {u.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={isPending || (isSelf && u.role === 'owner')}
                      onChange={(e) => changeRole(u.email, e.target.value as UserRole)}
                      className="rounded-lg border border-gray-300 dark:border-navy-light/60 bg-white dark:bg-[#0A1128] px-3 py-1.5 text-xs text-navy dark:text-white focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30 disabled:opacity-60"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {u.last_login_at
                      ? new Date(u.last_login_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    {u.disabled_at || u.role === 'disabled' ? (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-red-700 dark:text-red-300">
                        Disabled
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-300">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl">
        Roles are checked on every request — promoting / demoting takes effect immediately on the user&apos;s next page load. Disabling sets the role to <code className="font-mono">disabled</code>; the user keeps a sign-in record but middleware will block them on the next request.
      </p>
    </div>
  )
}
