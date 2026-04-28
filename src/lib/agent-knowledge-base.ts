/**
 * Knowledge base loader with two-layer provenance:
 *
 *   - Base layer (git): docs/agent-training-answers.md. Cesar / CQ
 *     Studio edits via PR + deploy. Default content for every section.
 *   - Override layer (Neon tz_kb_overrides): per-section live edits
 *     authored by TZ team users via /switchboard/knowledge-base.
 *
 * Render = base parsed by section, with any matching overrides applied
 * on top. **Tyler's overrides always win** — even after CQ pushes a new
 * base, the override stays sticky until Tyler revisits it.
 *
 * Sections are keyed by `section_path = "{H2 slug}/{H3 slug}"` for H3
 * sections, or `"{H2 slug}/_intro"` for the prelude under an H2 before
 * any H3 starts. The H2-level slug uses the heading number when present
 * (e.g. "1") so the path stays stable when section titles get tweaked.
 *
 * Agents (SMS / voice / web chat) load the merged content via
 * `loadMergedKnowledgeBase()` on every prompt build. Cache invalidates
 * when an override is upserted.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

import { db } from './db'

const KB_PATH = path.join(process.cwd(), 'docs', 'agent-training-answers.md')

export type KbSection = {
  /** Stable identifier used as the override key. */
  path: string
  /** 2 = H2, 3 = H3. */
  level: number
  /** Heading text as it appears in the source (without the leading ##). */
  heading: string
  /** Markdown body of this section, NOT including the heading line. */
  baseContent: string
  /** When an override is present, the override body replaces baseContent. */
  override: KbOverride | null
}

export type KbOverride = {
  id: string
  section_path: string
  heading_level: number
  heading_text: string
  content: string
  base_snapshot: string | null
  edited_by_email: string
  edited_by_role: string
  edit_note: string | null
  version: number
  created_at: string
  updated_at: string
}

let baseCache: { mtimeMs: number; sections: KbSection[]; preamble: string } | null = null

function slugifyHeading(heading: string): string {
  // Prefer leading number/dot identifier when present (e.g. "1.", "10.5") —
  // those are stable. Otherwise fall back to a kebab-cased slug of the
  // heading text.
  const numMatch = heading.match(/^(\d+(?:\.\d+)*)\b\s*/)
  if (numMatch) return numMatch[1]
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function parseBase(markdown: string): { preamble: string; sections: KbSection[] } {
  const lines = markdown.split('\n')
  const sections: KbSection[] = []
  let currentH2Slug: string | null = null
  let currentH2Heading: string | null = null
  let currentH3Slug: string | null = null
  let currentH3Heading: string | null = null
  let currentLevel: 2 | 3 | null = null
  let currentBuffer: string[] = []
  let preambleBuffer: string[] = []
  let inPreamble = true

  function flush() {
    if (currentLevel === null) return
    const content = currentBuffer.join('\n').trim()
    if (currentLevel === 2 && currentH2Slug && currentH2Heading) {
      sections.push({
        path: `${currentH2Slug}/_intro`,
        level: 2,
        heading: currentH2Heading,
        baseContent: content,
        override: null,
      })
    } else if (currentLevel === 3 && currentH2Slug && currentH3Slug && currentH3Heading) {
      sections.push({
        path: `${currentH2Slug}/${currentH3Slug}`,
        level: 3,
        heading: currentH3Heading,
        baseContent: content,
        override: null,
      })
    }
    currentBuffer = []
  }

  for (const line of lines) {
    const h2 = line.match(/^##\s+(?!#)(.+)$/)
    const h3 = line.match(/^###\s+(.+)$/)

    if (h2) {
      flush()
      inPreamble = false
      currentH2Heading = h2[1].trim()
      currentH2Slug = slugifyHeading(currentH2Heading)
      currentH3Slug = null
      currentH3Heading = null
      currentLevel = 2
      continue
    }
    if (h3) {
      flush()
      currentH3Heading = h3[1].trim()
      currentH3Slug = slugifyHeading(currentH3Heading)
      currentLevel = 3
      continue
    }

    if (inPreamble) {
      preambleBuffer.push(line)
    } else {
      currentBuffer.push(line)
    }
  }
  flush()

  return {
    preamble: preambleBuffer.join('\n').trim(),
    sections,
  }
}

async function readBase(): Promise<{ preamble: string; sections: KbSection[] }> {
  const stat = await fs.stat(KB_PATH)
  if (baseCache && baseCache.mtimeMs === stat.mtimeMs) {
    return { preamble: baseCache.preamble, sections: baseCache.sections }
  }
  const md = await fs.readFile(KB_PATH, 'utf-8')
  const parsed = parseBase(md)
  baseCache = { mtimeMs: stat.mtimeMs, sections: parsed.sections, preamble: parsed.preamble }
  return parsed
}

export function clearKnowledgeBaseCache(): void {
  baseCache = null
}

async function readOverrides(): Promise<Map<string, KbOverride>> {
  const sql = db()
  const rows = (await sql`SELECT * FROM tz_kb_overrides`) as KbOverride[]
  const map = new Map<string, KbOverride>()
  for (const row of rows) map.set(row.section_path, row)
  return map
}

export type LoadedKnowledgeBase = {
  preamble: string
  sections: KbSection[]
}

export async function loadMergedKnowledgeBase(): Promise<LoadedKnowledgeBase> {
  const [{ preamble, sections }, overrides] = await Promise.all([
    readBase(),
    readOverrides(),
  ])
  const merged = sections.map((s) => ({
    ...s,
    override: overrides.get(s.path) || null,
  }))
  return { preamble, sections: merged }
}

/**
 * Render the merged KB back to markdown for agent system prompts. Uses
 * the override body when present and falls back to base content
 * otherwise.
 */
export function renderMergedKbToMarkdown(kb: LoadedKnowledgeBase): string {
  const out: string[] = []
  if (kb.preamble) {
    out.push(kb.preamble)
    out.push('')
  }
  let lastH2Slug: string | null = null
  for (const section of kb.sections) {
    const h2Slug = section.path.split('/')[0]
    if (section.level === 2) {
      out.push(`## ${section.heading}`)
      out.push('')
      const body = section.override?.content || section.baseContent
      if (body) {
        out.push(body)
        out.push('')
      }
      lastH2Slug = h2Slug
    } else if (section.level === 3) {
      // If an H3 appears under a different H2 than we last emitted, emit
      // the H2 first (this can happen if the base had only H3s under an
      // H2 with no intro text — flush() never produced a 2-level section
      // because the buffer was empty).
      if (h2Slug !== lastH2Slug) {
        // Walk back to find the H2 heading.
        const h2Section = kb.sections.find(
          (s) => s.level === 2 && s.path === `${h2Slug}/_intro`,
        )
        if (h2Section) {
          out.push(`## ${h2Section.heading}`)
          out.push('')
        }
        lastH2Slug = h2Slug
      }
      out.push(`### ${section.heading}`)
      out.push('')
      const body = section.override?.content || section.baseContent
      if (body) {
        out.push(body)
        out.push('')
      }
    }
  }
  return out.join('\n').trimEnd()
}

export type UpsertOverrideInput = {
  sectionPath: string
  headingLevel: number
  headingText: string
  content: string
  baseSnapshot: string
  editedByEmail: string
  editedByRole: string
  editNote?: string | null
}

export async function upsertOverride(input: UpsertOverrideInput): Promise<KbOverride> {
  const sql = db()
  const rows = (await sql`
    INSERT INTO tz_kb_overrides (
      section_path, heading_level, heading_text,
      content, base_snapshot,
      edited_by_email, edited_by_role, edit_note,
      version
    ) VALUES (
      ${input.sectionPath}, ${input.headingLevel}, ${input.headingText},
      ${input.content}, ${input.baseSnapshot},
      ${input.editedByEmail}, ${input.editedByRole}, ${input.editNote ?? null},
      1
    )
    ON CONFLICT (section_path) DO UPDATE SET
      heading_level   = EXCLUDED.heading_level,
      heading_text    = EXCLUDED.heading_text,
      content         = EXCLUDED.content,
      base_snapshot   = EXCLUDED.base_snapshot,
      edited_by_email = EXCLUDED.edited_by_email,
      edited_by_role  = EXCLUDED.edited_by_role,
      edit_note       = EXCLUDED.edit_note,
      version         = tz_kb_overrides.version + 1,
      updated_at      = NOW()
    RETURNING *
  `) as KbOverride[]

  const row = rows[0]

  await sql`
    INSERT INTO tz_kb_override_history (
      override_id, section_path, content, edited_by_email, edit_note
    ) VALUES (
      ${row.id}, ${row.section_path}, ${row.content}, ${row.edited_by_email}, ${row.edit_note}
    )
  `

  await sql`
    INSERT INTO tz_audit_log (actor_email, actor_role, action, target_type, target_id, metadata)
    VALUES (
      ${input.editedByEmail}, ${input.editedByRole}, ${'kb.section_overridden'},
      ${'kb_section'}, ${input.sectionPath},
      ${JSON.stringify({ heading: input.headingText, version: row.version })}::jsonb
    )
  `

  clearKnowledgeBaseCache()
  return row
}

export async function clearOverride(
  sectionPath: string,
  actor: { email: string; role: string },
): Promise<void> {
  const sql = db()
  await sql`DELETE FROM tz_kb_overrides WHERE section_path = ${sectionPath}`
  await sql`
    INSERT INTO tz_audit_log (actor_email, actor_role, action, target_type, target_id)
    VALUES (
      ${actor.email}, ${actor.role}, ${'kb.section_reverted'},
      ${'kb_section'}, ${sectionPath}
    )
  `
  clearKnowledgeBaseCache()
}
