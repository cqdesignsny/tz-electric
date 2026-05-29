/**
 * Canonical callback outcomes for the Follow-Ups hub. Pure constants (no server
 * imports) so BOTH the client component (chip labels + colors) and the server
 * (validation in the resolve API) can import it without bundling server code.
 *
 * - label: full label, used in the "Recently handled" badge
 * - chip:  short label, used on the outcome-picker chips
 * - tone:  color family, shared by chips + badges for consistency
 */
export type OutcomeTone = 'green' | 'red' | 'amber' | 'gray'

export const FOLLOWUP_OUTCOMES = [
  { value: 'booked', label: 'Reached — booked', chip: 'Booked', tone: 'green' },
  { value: 'declined', label: 'Reached — declined', chip: 'Declined', tone: 'red' },
  { value: 'no_answer', label: 'No answer', chip: 'No answer', tone: 'amber' },
  { value: 'left_message', label: 'Left message', chip: 'Left message', tone: 'amber' },
  { value: 'wrong_number', label: 'Wrong number', chip: 'Wrong #', tone: 'red' },
  { value: 'other', label: 'Other', chip: 'Other', tone: 'gray' },
] as const satisfies ReadonlyArray<{ value: string; label: string; chip: string; tone: OutcomeTone }>

export type FollowUpOutcome = (typeof FOLLOWUP_OUTCOMES)[number]['value']

export const FOLLOWUP_OUTCOME_VALUES: string[] = FOLLOWUP_OUTCOMES.map((o) => o.value)

export function outcomeLabel(value: string | null | undefined): string {
  if (!value) return 'Done'
  return FOLLOWUP_OUTCOMES.find((o) => o.value === value)?.label ?? value
}

export function outcomeTone(value: string | null | undefined): OutcomeTone {
  return FOLLOWUP_OUTCOMES.find((o) => o.value === value)?.tone ?? 'gray'
}
