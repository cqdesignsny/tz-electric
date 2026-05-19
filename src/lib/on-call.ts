/**
 * On-call schedule lookup. Reads tz_on_call_schedule which is seeded
 * from the KB calendar (`docs/agent-training-answers.md` section 3) and
 * editable through the Switchboard. Used by the after-hours dispatch
 * flow to figure out who to text + call when an emergency comes in.
 */

import { db } from './db'

export type OnCallPerson = {
  id: number
  role: 'tech' | 'supervisor' | 'hvac_emergency' | 'plumbing_emergency'
  personName: string
  phone: string
  startsOn: Date
  endsOn: Date
  notes: string | null
}

type Row = {
  id: number
  role: OnCallPerson['role']
  person_name: string
  phone: string
  starts_on: string
  ends_on: string
  notes: string | null
}

function fromRow(row: Row): OnCallPerson {
  return {
    id: row.id,
    role: row.role,
    personName: row.person_name,
    phone: row.phone,
    startsOn: new Date(row.starts_on),
    endsOn: new Date(row.ends_on),
    notes: row.notes,
  }
}

/**
 * Return the active on-call person for a given role at a given moment.
 * If the rotation has not been seeded for this date yet, returns null —
 * the dispatch flow then falls back to the supervisor escalation chain.
 */
export async function getOnCall(
  role: OnCallPerson['role'],
  at: Date = new Date(),
): Promise<OnCallPerson | null> {
  const sql = db()
  const iso = at.toISOString().slice(0, 10) // YYYY-MM-DD
  const rows = (await sql`
    SELECT id, role, person_name, phone, starts_on, ends_on, notes
    FROM tz_on_call_schedule
    WHERE role = ${role}
      AND active = TRUE
      AND starts_on <= ${iso}::date
      AND ends_on >= ${iso}::date
    ORDER BY starts_on DESC
    LIMIT 1
  `) as unknown as Row[]
  if (rows.length === 0) return null
  return fromRow(rows[0])
}

/**
 * Convenience: pull the standard supervisor escalation chain (always
 * available, not date-bound). Per the SOP, supervisors are Ty / Sam /
 * Tyler. Stored with very long date ranges so they always match.
 */
export async function getSupervisorChain(): Promise<OnCallPerson[]> {
  const sql = db()
  const rows = (await sql`
    SELECT id, role, person_name, phone, starts_on, ends_on, notes
    FROM tz_on_call_schedule
    WHERE role = 'supervisor' AND active = TRUE
    ORDER BY id ASC
  `) as unknown as Row[]
  return rows.map(fromRow)
}
