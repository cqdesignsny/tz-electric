import { NextRequest, NextResponse } from 'next/server'

import { requireGoogleUser } from '@/lib/current-user'
import { reopenFollowUp, resolveFollowUp } from '@/lib/followups'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_ROLES = ['owner', 'admin', 'office']

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
  if (!ALLOWED_ROLES.includes(actor.role)) {
    return NextResponse.json({ ok: false, error: 'Not permitted' }, { status: 403 })
  }

  const body = (await req.json().catch(() => ({}))) as { flagMessageId?: string; action?: string }
  const flagMessageId = typeof body.flagMessageId === 'string' ? body.flagMessageId.trim() : ''
  const action = body.action === 'reopen' ? 'reopen' : 'resolve'
  if (!flagMessageId) {
    return NextResponse.json({ ok: false, error: 'flagMessageId required' }, { status: 400 })
  }

  try {
    if (action === 'reopen') {
      await reopenFollowUp(flagMessageId)
    } else {
      await resolveFollowUp(flagMessageId, actor.email)
    }
    return NextResponse.json({ ok: true, action })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Failed' },
      { status: 400 },
    )
  }
}
