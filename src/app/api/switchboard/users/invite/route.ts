import { NextRequest, NextResponse } from 'next/server'
import { requireGoogleUser } from '@/lib/current-user'
import { ALLOWED_EMAIL_DOMAINS } from '@/lib/auth-config'
import { canManageUsers, inviteUser, type UserRole } from '@/lib/users'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const INVITABLE_ROLES: UserRole[] = ['owner', 'admin', 'office', 'viewer']

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

  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'Valid email required' }, { status: 400 })
  }
  const domain = email.slice(email.lastIndexOf('@') + 1)
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Email domain "${domain}" is not on the allowlist (tzelectricinc.com / creativequalitymarketing.com).`,
      },
      { status: 400 },
    )
  }
  if (!role || !INVITABLE_ROLES.includes(role)) {
    return NextResponse.json({ ok: false, error: 'Valid role required' }, { status: 400 })
  }

  try {
    const user = await inviteUser(email, role, { email: actor.email, role: actor.role })
    return NextResponse.json({ ok: true, user })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Failed' },
      { status: 400 },
    )
  }
}
