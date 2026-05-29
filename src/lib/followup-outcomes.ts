/**
 * Canonical callback outcomes for the Follow-Ups hub. Pure constants (no server
 * imports) so BOTH the client component (labels in the dropdown) and the server
 * (validation in the resolve API) can import it without bundling server code.
 */
export const FOLLOWUP_OUTCOMES = [
  { value: 'booked', label: 'Reached — booked' },
  { value: 'declined', label: 'Reached — declined' },
  { value: 'no_answer', label: 'No answer' },
  { value: 'left_message', label: 'Left message' },
  { value: 'wrong_number', label: 'Wrong number' },
  { value: 'other', label: 'Other' },
] as const

export type FollowUpOutcome = (typeof FOLLOWUP_OUTCOMES)[number]['value']

export const FOLLOWUP_OUTCOME_VALUES: string[] = FOLLOWUP_OUTCOMES.map((o) => o.value)

export function outcomeLabel(value: string | null | undefined): string {
  if (!value) return 'Done'
  return FOLLOWUP_OUTCOMES.find((o) => o.value === value)?.label ?? value
}
