import { NextRequest, NextResponse } from 'next/server'
import { requireGoogleUser } from '@/lib/current-user'
import { canManageUsers, setUserRole, type UserRole } from '@/lib/users'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ROLES: UserRole[] = ['owner', 'admin', 'office', 'viewer', 'disabled']

export async function POST(req: NextRequest) {
  let actor
  try {
    actor = await requireGoogleUser()
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Unauthorized' },
      { status: 401 },
    )
  }
  if (!canManageUsers(actor.role)) {
    return NextResponse.json({ ok: false, error: 'Owner role required' }, { status: 403 })
  }

  const body = (await req.json().catch(() => ({}))) as { email?: string; role?: string }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const role = body.role as UserRole | undefined
  if (!email || !role || !ROLES.includes(role)) {
    return NextResponse.json({ ok: false, error: 'email + valid role required' }, { status: 400 })
  }

  try {
    const updated = await setUserRole(email, role, { email: actor.email, role: actor.role })
    return NextResponse.json({ ok: true, user: updated })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Failed' },
      { status: 400 },
    )
  }
}
