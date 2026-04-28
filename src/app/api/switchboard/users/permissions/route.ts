import { NextRequest, NextResponse } from 'next/server'
import { requireGoogleUser } from '@/lib/current-user'
import { MODULES } from '@/lib/modules'
import { canManageUsers, setUserPermissions } from '@/lib/users'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

  const body = (await req.json().catch(() => ({}))) as {
    email?: string
    permissions?: Record<string, unknown>
  }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || !body.permissions || typeof body.permissions !== 'object') {
    return NextResponse.json(
      { ok: false, error: 'email + permissions object required' },
      { status: 400 },
    )
  }

  // Filter to known module slugs and coerce values to boolean. Drop any
  // ownerOnly module — owners can't grant those via overrides anyway.
  const allowedSlugs = new Set(
    MODULES.filter((m) => !m.ownerOnly).map((m) => m.slug),
  )
  const cleaned: Record<string, boolean> = {}
  for (const [k, v] of Object.entries(body.permissions)) {
    if (!allowedSlugs.has(k as never)) continue
    cleaned[k] = !!v
  }

  try {
    const updated = await setUserPermissions({
      email,
      permissions: cleaned,
      actor: { email: actor.email, role: actor.role },
    })
    return NextResponse.json({ ok: true, user: updated })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Failed' },
      { status: 400 },
    )
  }
}
