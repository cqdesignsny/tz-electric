/**
 * Admin Claire tool surface — used inside the TZ Switchboard
 * (/switchboard/agent-training). Tyler / Terry / Cesar talk to Claire
 * conversationally; she reads + edits the knowledge base, browses her
 * own daily self-improvement reports, and looks up recent activity.
 *
 * Role gating happens at the API route boundary (only `owner` and
 * `admin` can hit /api/agents/admin-chat/stream). Destructive ops use
 * the confirm-before-write pattern: `propose_kb_edit` returns a diff
 * the user explicitly approves, then `apply_kb_edit` writes it.
 *
 * Same shared KB as customer-facing Claire (via agent-knowledge-base)
 * — edits land in tz_kb_overrides and propagate to web chat / voice /
 * SMS Claire on the next prompt build (cache invalidates on upsert).
 */
import { tool } from 'ai'
import { z } from 'zod'

import {
  clearOverride,
  loadMergedKnowledgeBase,
  upsertOverride,
  type KbSection,
} from './agent-knowledge-base'
import { db } from './db'

export type AdminActor = {
  email: string
  role: 'owner' | 'admin'
  name: string | null
}

export type AdminToolContext = {
  conversationId: string
  actor: AdminActor
  /**
   * Pending edits Tyler proposed but hasn't approved yet. Keyed by
   * section_path so the model can reference back ("apply the change to
   * 1.estimates"). In-memory per request — Phase 2 will move to a
   * tz_pending_kb_edits table so multi-turn confirmations survive page
   * reloads. For V1 we lean on the per-turn message history Claire
   * has in context.
   */
  pendingEdits: Map<string, { sectionPath: string; newContent: string; rationale: string }>
}

export function buildAdminTools(ctx: AdminToolContext) {
  return {
    list_kb_sections: tool({
      description:
        "List every section path in the TZ Electric knowledge base. Use this when the user asks 'what sections are there', when you're not sure which section to look at, or when you want to suggest related sections. Returns an array of { path, heading, level, has_override } so you can tell Tyler which sections have already been customized vs. which are still on the base markdown.",
      inputSchema: z.object({}),
      execute: async () => {
        const kb = await loadMergedKnowledgeBase()
        return {
          count: kb.sections.length,
          sections: kb.sections.map((s) => ({
            path: s.path,
            heading: s.heading,
            level: s.level,
            has_override: !!s.override,
            override_edited_by: s.override?.edited_by_email ?? null,
            override_updated_at: s.override?.updated_at ?? null,
          })),
        }
      },
    }),

    lookup_kb_section: tool({
      description:
        "Read the current rendered content of a single knowledge-base section. The content reflects the live merged view that customer-facing Claire uses on every call. Always look up a section before proposing an edit — the user will trust your edit more if you've verified the current text. Use list_kb_sections first if you don't know the exact path.",
      inputSchema: z.object({
        section_path: z
          .string()
          .describe(
            "Section path like '1/_intro' or '6/canonical-lead-intake-question-set'. Exact match required — get the path from list_kb_sections.",
          ),
      }),
      execute: async ({ section_path }) => {
        const kb = await loadMergedKnowledgeBase()
        const section = kb.sections.find((s) => s.path === section_path)
        if (!section) {
          const close = kb.sections
            .filter((s) =>
              s.path.toLowerCase().includes(section_path.toLowerCase()) ||
              s.heading.toLowerCase().includes(section_path.toLowerCase()),
            )
            .slice(0, 5)
            .map((s) => s.path)
          return {
            found: false,
            error: `No section at "${section_path}".`,
            close_matches: close,
          }
        }
        const content = section.override?.content ?? section.baseContent
        return {
          found: true,
          path: section.path,
          heading: section.heading,
          level: section.level,
          has_override: !!section.override,
          override_edited_by: section.override?.edited_by_email ?? null,
          override_updated_at: section.override?.updated_at ?? null,
          content,
        }
      },
    }),

    propose_kb_edit: tool({
      description:
        "Propose a knowledge-base section edit WITHOUT writing it yet. Use this whenever Tyler asks you to change, update, fix, add to, or remove from a KB section. Returns a diff preview the user must explicitly approve. After they say yes (or equivalent — 'do it', 'apply', 'looks good', 'ship it'), call apply_kb_edit with the same section_path. If they reject or want changes, call propose_kb_edit again with the revised content.",
      inputSchema: z.object({
        section_path: z.string().describe('Exact section path.'),
        new_content: z
          .string()
          .describe(
            'The full new section body (markdown). This REPLACES the current content — provide the complete section, not a diff. Preserve existing formatting conventions you see in the KB.',
          ),
        rationale: z
          .string()
          .describe('One-sentence explanation of why this edit. Shown back to Tyler as part of the diff preview.'),
      }),
      execute: async ({ section_path, new_content, rationale }) => {
        const kb = await loadMergedKnowledgeBase()
        const section = kb.sections.find((s) => s.path === section_path)
        if (!section) {
          return {
            ok: false,
            error: `No section at "${section_path}". Cannot propose edit to a section that doesn't exist.`,
          }
        }
        const current = section.override?.content ?? section.baseContent
        ctx.pendingEdits.set(section_path, {
          sectionPath: section_path,
          newContent: new_content,
          rationale,
        })
        return {
          ok: true,
          section_path,
          heading: section.heading,
          rationale,
          current_content: current,
          proposed_content: new_content,
          chars_before: current.length,
          chars_after: new_content.length,
          message:
            'Proposal queued. Show the diff to the user and wait for explicit approval before calling apply_kb_edit.',
        }
      },
    }),

    apply_kb_edit: tool({
      description:
        'Write a previously proposed KB edit to the live override layer. The edit takes effect immediately for customer-facing Claire (web chat + voice + SMS) on the next prompt build. ONLY call this AFTER the user has explicitly approved a proposal from propose_kb_edit. Never apply without confirmation — destructive operations require explicit consent.',
      inputSchema: z.object({
        section_path: z.string().describe('Must match a section_path you previously proposed via propose_kb_edit.'),
        edit_note: z
          .string()
          .optional()
          .describe('Optional short note explaining the edit for the audit log (e.g., "Add elderly + utility outage to emergency dispatch criteria, per Bianca call 2026-05-27").'),
      }),
      execute: async ({ section_path, edit_note }) => {
        const pending = ctx.pendingEdits.get(section_path)
        if (!pending) {
          return {
            ok: false,
            error: `No pending proposal for "${section_path}". Call propose_kb_edit first.`,
          }
        }
        const kb = await loadMergedKnowledgeBase()
        const section = kb.sections.find((s) => s.path === section_path)
        if (!section) {
          return { ok: false, error: `Section "${section_path}" no longer exists.` }
        }
        await upsertOverride({
          sectionPath: section_path,
          headingLevel: section.level,
          headingText: section.heading,
          content: pending.newContent,
          baseSnapshot: section.baseContent,
          editedByEmail: ctx.actor.email,
          editedByRole: ctx.actor.role,
          editNote: edit_note || pending.rationale,
        })
        ctx.pendingEdits.delete(section_path)
        return {
          ok: true,
          section_path,
          heading: section.heading,
          applied_by: ctx.actor.email,
          message: `Live. Customer-facing Claire will use the new content on her next call. View at /switchboard/knowledge-base.`,
        }
      },
    }),

    revert_kb_section: tool({
      description:
        "Remove the override on a section so it falls back to the base markdown in git (docs/agent-training-answers.md). Use when Tyler says he wants to undo a previous edit, restore the default, or revert. Like apply_kb_edit, this is destructive — confirm before calling.",
      inputSchema: z.object({
        section_path: z.string(),
      }),
      execute: async ({ section_path }) => {
        const kb = await loadMergedKnowledgeBase()
        const section = kb.sections.find((s) => s.path === section_path)
        if (!section) return { ok: false, error: `No section "${section_path}".` }
        if (!section.override) {
          return {
            ok: false,
            error: `No override to revert — this section is already on the base content.`,
          }
        }
        await clearOverride(section_path, { email: ctx.actor.email, role: ctx.actor.role })
        return {
          ok: true,
          section_path,
          message: `Reverted to base content. The previous override is preserved in tz_kb_override_history.`,
        }
      },
    }),

    view_recent_daily_reports: tool({
      description:
        "Pull the most recent Claire daily self-improvement reports. Each report is the structured output of the nightly analyzer (runs at 2 AM ET): summary, wins, failure patterns, KB gaps with proposed additions, proposed prompt rules, calls worth listening to, and questions for Tyler. Use when the user asks what Claire learned recently, what's been going wrong, what patterns showed up this week, or any 'how is Claire doing' type question.",
      inputSchema: z.object({
        days: z
          .number()
          .int()
          .min(1)
          .max(30)
          .default(7)
          .describe('How many recent days of reports to return. Default 7.'),
      }),
      execute: async ({ days }) => {
        const sql = db()
        type Row = {
          analysis_date: string
          voice_count: number
          web_chat_count: number
          sms_count: number
          lead_form_count: number
          total_leads: number
          escalation_count: number
          emergency_dispatch_count: number
          silence_timeout_count: number
          proposals: {
            summary: string
            wins: unknown[]
            failure_patterns: unknown[]
            kb_gaps: unknown[]
            proposed_prompt_rules: unknown[]
            calls_worth_listening_to: unknown[]
            questions_for_tyler: unknown[]
          }
          llm_model: string
        }
        const rows = (await sql`
          SELECT
            analysis_date::text AS analysis_date,
            voice_count, web_chat_count, sms_count, lead_form_count,
            total_leads, escalation_count, emergency_dispatch_count,
            silence_timeout_count,
            proposals,
            llm_model
          FROM tz_claire_daily_analysis
          WHERE analysis_date >= (CURRENT_DATE - ${days}::int)
          ORDER BY analysis_date DESC
        `) as unknown as Row[]
        return {
          count: rows.length,
          reports: rows.map((r) => ({
            date: r.analysis_date,
            volume: {
              voice: r.voice_count,
              web_chat: r.web_chat_count,
              sms: r.sms_count,
              lead_form: r.lead_form_count,
              total_leads: r.total_leads,
            },
            signals: {
              escalations: r.escalation_count,
              emergency_dispatches: r.emergency_dispatch_count,
              silence_timeouts: r.silence_timeout_count,
            },
            summary: r.proposals?.summary ?? '(no summary)',
            counts: {
              wins: (r.proposals?.wins ?? []).length,
              failure_patterns: (r.proposals?.failure_patterns ?? []).length,
              kb_gaps: (r.proposals?.kb_gaps ?? []).length,
              proposed_prompt_rules: (r.proposals?.proposed_prompt_rules ?? []).length,
            },
            // Full proposal lists are present for deep dives.
            proposals: r.proposals,
            model: r.llm_model,
          })),
        }
      },
    }),

    search_recent_conversations: tool({
      description:
        "Search recent Claire conversations (voice + web chat + SMS) by keyword in the transcript. Use when Tyler asks about a specific call, customer, or topic ('what did Lewis say', 'show me the Bianca conversation', 'any calls about pool heaters this week'). Returns conversation metadata + a snippet of the matching turn.",
      inputSchema: z.object({
        query: z
          .string()
          .describe('Keyword or phrase to search for in user + assistant messages. Case-insensitive substring match.'),
        days: z.number().int().min(1).max(30).default(7),
        limit: z.number().int().min(1).max(20).default(8),
      }),
      execute: async ({ query, days, limit }) => {
        const sql = db()
        const pattern = `%${query}%`
        type Row = {
          id: string
          channel: string
          customer_name: string | null
          customer_phone: string | null
          status: string
          tz_lead_id: string | null
          created_at: string
          excerpt: string
          excerpt_role: string
        }
        const rows = (await sql`
          SELECT DISTINCT ON (c.id)
            c.id,
            c.channel,
            c.customer_name,
            c.customer_phone,
            c.status,
            c.tz_lead_id,
            c.created_at::text AS created_at,
            substring(m.content for 240) AS excerpt,
            m.role AS excerpt_role
          FROM tz_agent_conversations c
          JOIN tz_agent_messages m ON m.conversation_id = c.id
          WHERE c.created_at >= (NOW() - (${days} || ' days')::interval)
            AND c.channel IN ('voice','web_chat','sms')
            AND m.role IN ('user','assistant')
            AND m.content ILIKE ${pattern}
          ORDER BY c.id, m.created_at ASC
          LIMIT ${limit}
        `) as unknown as Row[]
        return {
          count: rows.length,
          query,
          results: rows.map((r) => ({
            conversation_id: r.id,
            short_id: r.id.slice(0, 8),
            channel: r.channel,
            customer: r.customer_name || r.customer_phone || '(no contact yet)',
            status: r.status,
            lead_captured: !!r.tz_lead_id,
            when: r.created_at,
            excerpt_role: r.excerpt_role,
            excerpt: r.excerpt,
            call_logs_link: r.channel === 'voice' ? `/switchboard/call-logs?id=${r.id}` : null,
            web_chat_link: r.channel === 'web_chat' ? `/switchboard/web-chat?id=${r.id}` : null,
          })),
        }
      },
    }),
  }
}
