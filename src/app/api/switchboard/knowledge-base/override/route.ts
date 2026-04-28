import { NextRequest, NextResponse } from 'next/server'

import {
  clearOverride,
  upsertOverride,
} from '@/lib/agent-knowledge-base'
import { requireGoogleUser } from '@/lib/current-user'
import { canEditKnowledgeBase } from '@/lib/users'

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
  if (!canEditKnowledgeBase(actor.role)) {
    return NextResponse.json(
      { ok: false, error: 'Owner or admin role required to edit the knowledge base' },
      { status: 403 },
    )
  }

  const body = (await req.json().catch(() => ({}))) as {
    sectionPath?: string
    headingLevel?: number
    headingText?: string
    content?: string
    baseSnapshot?: string
    editNote?: string
  }

  if (
    !body.sectionPath ||
    typeof body.headingLevel !== 'number' ||
    !body.headingText ||
    typeof body.content !== 'string'
  ) {
    return NextResponse.json(
      { ok: false, error: 'Missing required fields' },
      { status: 400 },
    )
  }

  try {
    const override = await upsertOverride({
      sectionPath: body.sectionPath,
      headingLevel: body.headingLevel,
      headingText: body.headingText,
      content: body.content,
      baseSnapshot: body.baseSnapshot || '',
      editedByEmail: actor.email,
      editedByRole: actor.role,
      editNote: body.editNote || null,
    })
    return NextResponse.json({ ok: true, override })
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest) {
  let actor
  try {
    actor = await requireGoogleUser()
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Unauthorized' },
      { status: 401 },
    )
  }
  if (!canEditKnowledgeBase(actor.role)) {
    return NextResponse.json(
      { ok: false, error: 'Owner or admin role required to revert overrides' },
      { status: 403 },
    )
  }

  const body = (await req.json().catch(() => ({}))) as { sectionPath?: string }
  if (!body.sectionPath) {
    return NextResponse.json({ ok: false, error: 'sectionPath required' }, { status: 400 })
  }

  await clearOverride(body.sectionPath, { email: actor.email, role: actor.role })
  return NextResponse.json({ ok: true })
}
