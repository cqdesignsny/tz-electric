/**
 * Call-review marks — flag a conversation (call) as needing review so Claire
 * can be improved from its mistakes. Presence of a tz_call_review_marks row =
 * flagged. Office staff toggle these in /switchboard/call-logs while reading
 * through calls; `listMarkedCalls()` is what a focused review pass pulls so it
 * only looks at the calls a human already flagged.
 *
 * Reads are resilient: a missing table or a query hiccup yields "nothing
 * marked" rather than breaking the call-logs page. Writes surface their error.
 */
import { db } from './db'

export type ReviewMark = {
  conversationId: string
  note: string | null
  markedByEmail: string | null
  markedAt: string
}

type Row = {
  conversation_id: string
  note: string | null
  marked_by_email: string | null
  marked_at: string
}

function toMark(r: Row): ReviewMark {
  return {
    conversationId: r.conversation_id,
    note: r.note,
    markedByEmail: r.marked_by_email,
    markedAt: r.marked_at,
  }
}

/** Marks for a set of conversation ids, keyed by id. Never throws. */
export async function getReviewMarksFor(
  conversationIds: string[],
): Promise<Record<string, ReviewMark>> {
  const out: Record<string, ReviewMark> = {}
  if (conversationIds.length === 0) return out
  try {
    const sql = db()
    const rows = (await sql`
      SELECT conversation_id, note, marked_by_email, marked_at
      FROM tz_call_review_marks
      WHERE conversation_id = ANY(${conversationIds})
    `) as Row[]
    for (const r of rows) out[r.conversation_id] = toMark(r)
  } catch (e) {
    console.error('[call-review] getReviewMarksFor failed (non-fatal):', e)
  }
  return out
}

/** Flag a call for review (upsert; the note provided replaces any prior note). */
export async function markCallForReview(
  conversationId: string,
  email: string | null,
  note: string | null,
): Promise<void> {
  const sql = db()
  await sql`
    INSERT INTO tz_call_review_marks (conversation_id, marked_by_email, note)
    VALUES (${conversationId}, ${email}, ${note})
    ON CONFLICT (conversation_id) DO UPDATE SET
      marked_by_email = EXCLUDED.marked_by_email,
      note = EXCLUDED.note,
      marked_at = NOW()
  `
}

/** Clear a call's review flag. */
export async function unmarkCall(conversationId: string): Promise<void> {
  const sql = db()
  await sql`DELETE FROM tz_call_review_marks WHERE conversation_id = ${conversationId}`
}

/** All flagged calls, newest first — what a focused review pass pulls. */
export async function listMarkedCalls(limit = 100): Promise<ReviewMark[]> {
  try {
    const sql = db()
    const rows = (await sql`
      SELECT conversation_id, note, marked_by_email, marked_at
      FROM tz_call_review_marks
      ORDER BY marked_at DESC
      LIMIT ${limit}
    `) as Row[]
    return rows.map(toMark)
  } catch (e) {
    console.error('[call-review] listMarkedCalls failed (non-fatal):', e)
    return []
  }
}
