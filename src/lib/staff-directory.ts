/**
 * Staff directory lookup. Reads the "Office Staff Directory" markdown
 * table from the agent KB (section 3) and parses it into a lookup map
 * Claire's `notify_team_member` tool uses to route SMS callbacks to the
 * right cell.
 *
 * Editable in two places, override-first:
 *   1. tz_kb_overrides row at path `3/office-staff-directory-sms-routed-callbacks`
 *      (Tyler / admin chat / KB editor write here).
 *   2. The base file at docs/agent-training-answers.md (git, deploy gate).
 *
 * Lookup tries exact first name, then full name, then "first-initial +
 * last name" — all case-insensitive. Entries with no real phone (cell
 * column reads "TBD" or is blank) are returned as `phone: null` so the
 * caller can decide whether to SMS or fall back to office email.
 */
import { loadMergedKnowledgeBase } from './agent-knowledge-base'

export type StaffMember = {
  /** Canonical display name (full name when known, otherwise first). */
  name: string
  /** E.164 cell, or null when the row has no real phone yet. */
  phone: string | null
  role: string | null
  notes: string | null
  /** All names this entry should match against (first, full, aliases). */
  aliases: string[]
}

export type StaffLookupResult =
  | { matched: true; member: StaffMember; matchedBy: 'first' | 'full' | 'initial-last' | 'alias' }
  | { matched: false; reason: 'no-directory' | 'no-match'; queriedName: string }

const SECTION_PATH = '3/office-staff-directory-sms-routed-callbacks'
const SECTION_HEADING_NEEDLE = 'office staff directory'

function normalizeName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizePhone(raw: string): string | null {
  const cleaned = raw.trim()
  if (!cleaned || cleaned.toUpperCase() === 'TBD' || cleaned === '-' || cleaned === '—') {
    return null
  }
  const digits = cleaned.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  // Anything else is unparseable. Treat as missing rather than throwing.
  return null
}

function expandAliases(nameCell: string): { aliases: string[]; canonical: string } {
  // Cell looks like "Tyler / Tyler Zitz" or just "Molly".
  const parts = nameCell.split('/').map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return { aliases: [], canonical: nameCell.trim() }
  const canonical = parts[parts.length - 1] // longest / most specific
  const aliasSet = new Set<string>()
  for (const part of parts) {
    aliasSet.add(normalizeName(part))
    const tokens = part.split(/\s+/)
    if (tokens.length > 0) aliasSet.add(normalizeName(tokens[0]))
    if (tokens.length >= 2) {
      const initial = tokens[0][0]
      if (initial) aliasSet.add(normalizeName(`${initial} ${tokens[tokens.length - 1]}`))
    }
  }
  return { aliases: [...aliasSet], canonical }
}

function parseTable(content: string): StaffMember[] {
  // Find the first markdown table block in the section. Table rows start
  // with `|` and the separator row uses dashes. Skip header + separator,
  // parse data rows. Tolerant of trailing pipes and whitespace.
  const lines = content.split('\n')
  const rows: string[][] = []
  let inTable = false
  let sawSeparator = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|')) {
      if (inTable && sawSeparator) break // table ended
      continue
    }
    const cells = trimmed
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((c) => c.trim())
    if (!inTable) {
      inTable = true
      continue // header row, skip
    }
    if (!sawSeparator) {
      // Separator row: cells are all dashes/colons. Skip.
      const isSeparator = cells.every((c) => /^:?-+:?$/.test(c))
      if (isSeparator) {
        sawSeparator = true
        continue
      }
      // Some markdowns omit the separator. Treat first row as data.
      sawSeparator = true
      rows.push(cells)
      continue
    }
    rows.push(cells)
  }
  const members: StaffMember[] = []
  for (const cells of rows) {
    if (cells.length < 2) continue
    const [nameCell, phoneCell, roleCell, notesCell] = [
      cells[0] ?? '',
      cells[1] ?? '',
      cells[2] ?? '',
      cells[3] ?? '',
    ]
    if (!nameCell) continue
    const { aliases, canonical } = expandAliases(nameCell)
    if (aliases.length === 0) continue
    members.push({
      name: canonical,
      phone: normalizePhone(phoneCell),
      role: roleCell.trim() || null,
      notes: notesCell.trim() || null,
      aliases,
    })
  }
  return members
}

async function loadDirectory(): Promise<StaffMember[]> {
  const kb = await loadMergedKnowledgeBase()
  // Prefer exact path match (stable under heading edits). Fall back to
  // heading-needle match so a renamed section still resolves.
  let section = kb.sections.find((s) => s.path === SECTION_PATH)
  if (!section) {
    section = kb.sections.find(
      (s) => s.heading.toLowerCase().includes(SECTION_HEADING_NEEDLE),
    )
  }
  if (!section) return []
  const body = section.override?.content || section.baseContent || ''
  return parseTable(body)
}

export async function lookupStaffMember(rawName: string): Promise<StaffLookupResult> {
  const query = normalizeName(rawName)
  if (!query) return { matched: false, reason: 'no-match', queriedName: rawName }
  const directory = await loadDirectory()
  if (directory.length === 0) {
    return { matched: false, reason: 'no-directory', queriedName: rawName }
  }
  // Pass 1: exact alias match (first name, full name, initial-last).
  for (const member of directory) {
    for (const alias of member.aliases) {
      if (alias === query) {
        const tokens = query.split(' ')
        const matchedBy: 'first' | 'full' | 'initial-last' =
          tokens.length === 1
            ? 'first'
            : tokens.length === 2 && tokens[0].length === 1
              ? 'initial-last'
              : 'full'
        return { matched: true, member, matchedBy }
      }
    }
  }
  // Pass 2: query is a prefix of any alias (handles "Ty" → "Ty Stein" if
  // not already aliased explicitly).
  for (const member of directory) {
    for (const alias of member.aliases) {
      if (alias.startsWith(`${query} `) || alias === query) {
        return { matched: true, member, matchedBy: 'first' }
      }
    }
  }
  return { matched: false, reason: 'no-match', queriedName: rawName }
}

export async function listStaffDirectory(): Promise<StaffMember[]> {
  return loadDirectory()
}
