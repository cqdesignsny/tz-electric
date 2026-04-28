import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import {
  appendMessage,
  closeConversation,
  getConversation,
  releaseTakeover,
  takeOverConversation,
} from '@/lib/agent-conversations'
import { SWITCHBOARD_COOKIE, verifySessionToken } from '@/lib/switchboard-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Office-side actions on an agent conversation:
 *
 *   POST { action: 'takeover',     conversationId }
 *   POST { action: 'release',      conversationId }
 *   POST { action: 'close',        conversationId, reason }
 *   POST { action: 'office_reply', conversationId, content }
 *
 * For office_reply we persist the reply to the conversation. When Twilio
 * is wired, we'll also push it back through the Twilio Messages API so
 * it actually delivers as SMS — for now we only persist (the customer
 * doesn't see anything until that wire-up). Reuse the same endpoint for
 * voice / web-chat by extending the action vocabulary.
 */
export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SWITCHBOARD_COOKIE)?.value
  let authed = false
  try {
    authed = await verifySessionToken(token)
  } catch {
    authed = false
  }
  if (!authed) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    action?: string
    conversationId?: string
    reason?: string
    content?: string
  }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const action = body.action
  const conversationId = body.conversationId
  if (!action || !conversationId) {
    return NextResponse.json(
      { ok: false, error: 'Missing action or conversationId' },
      { status: 400 },
    )
  }

  const conv = await getConversation(conversationId)
  if (!conv) {
    return NextResponse.json({ ok: false, error: 'Conversation not found' }, { status: 404 })
  }

  const officeUser = 'office' // Replace with the signed-in user once Clerk lands.

  switch (action) {
    case 'takeover': {
      await takeOverConversation({ conversationId, user: officeUser })
      return NextResponse.json({ ok: true })
    }
    case 'release': {
      await releaseTakeover(conversationId)
      return NextResponse.json({ ok: true })
    }
    case 'close': {
      const reason = typeof body.reason === 'string' ? body.reason : 'office_resolved'
      await closeConversation(conversationId, reason)
      return NextResponse.json({ ok: true })
    }
    case 'office_reply': {
      const content = typeof body.content === 'string' ? body.content.trim() : ''
      if (!content) {
        return NextResponse.json(
          { ok: false, error: 'Empty message' },
          { status: 400 },
        )
      }
      await appendMessage({
        conversationId,
        role: 'office',
        content,
        authoredBy: officeUser,
      })
      // TODO: when Twilio is configured, push this through the Twilio
      // Messages API so it actually delivers to the customer's phone.
      // Until then it persists in the transcript only; office can text
      // the customer directly via their own phone in the meantime.
      return NextResponse.json({ ok: true })
    }
    default:
      return NextResponse.json(
        { ok: false, error: `Unknown action: ${action}` },
        { status: 400 },
      )
  }
}
