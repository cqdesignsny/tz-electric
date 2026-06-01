import { NextRequest, NextResponse } from 'next/server'

import { markCallForReview, unmarkCall } from '@/lib/call-review'
import { requireGoogleUser } from '@/lib/current-user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_ROLES = ['owner', 'admin', 'office']

/**
 * Toggle a call's "needs review" mark. Body:
 *   { conversationId: string, marked?: boolean, note?: string }
 * marked === false → clear the mark; otherwise (default) set/refresh it.
 */
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

  const body = (await req.json().catch(() => ({}))) as {
    conversationId?: string
    marked?: boolean
    note?: string
  }
  const conversationId =
    typeof body.conversationId === 'string' ? body.conversationId.trim() : ''
  if (!conversationId) {
    return NextResponse.json({ ok: false, error: 'conversationId required' }, { status: 400 })
  }
  const note =
    typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 1000) : null

  try {
    if (body.marked === false) {
      await unmarkCall(conversationId)
    } else {
      await markCallForReview(conversationId, actor.email, note)
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Failed' },
      { status: 400 },
    )
  }
}
