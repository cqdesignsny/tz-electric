/**
 * Claire's nightly self-improvement analyzer.
 *
 * Phase 1 (locked 2026-05-27): observation only. Pulls every voice +
 * web chat + SMS conversation + lead-form submission from the prior NY
 * day, computes baseline metrics, runs an LLM pattern pass via Claude
 * Sonnet, and produces structured proposals (KB additions, prompt-rule
 * tweaks, coaching wins, questions for Tyler). Output is persisted to
 * `tz_claire_daily_analysis` and emailed to Tyler + Cesar. NO auto-
 * application of changes — Phase 2 (approval UI) and Phase 3 (selective
 * auto-apply) come later.
 *
 * Triggered by `/api/cron/claire-daily-analysis` at 2 AM ET via Vercel
 * Cron. Idempotent on analysis_date so manual re-runs upsert.
 */
import { gateway, generateObject } from 'ai'
import { z } from 'zod'

import { db } from './db'

// =============================================================================
// Date math (NY local day)
// =============================================================================

/**
 * Return the analysis window for "yesterday in NY". Both ends are ISO
 * timestamps. `start` is 00:00:00 ET on the target date, `end` is
 * 23:59:59.999 ET on the same date. `dateLabel` is the YYYY-MM-DD string.
 *
 * Implementation note: building these in UTC is fragile around DST
 * boundaries, so we derive from a known ET timestamp and reverse-shift.
 */
export function yesterdayNYRange(): { start: string; end: string; dateLabel: string } {
  const now = new Date()
  // What day is it in NY right now?
  const nyDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  // Yesterday in NY = today's NY date minus one day.
  nyDate.setDate(nyDate.getDate() - 1)
  const yyyy = nyDate.getFullYear()
  const mm = String(nyDate.getMonth() + 1).padStart(2, '0')
  const dd = String(nyDate.getDate()).padStart(2, '0')
  const dateLabel = `${yyyy}-${mm}-${dd}`
  // 00:00 ET on dateLabel through 23:59:59.999 ET on dateLabel.
  // Use the IANA timezone to find the corresponding UTC instant.
  const startStr = `${dateLabel}T00:00:00`
  const endStr = `${dateLabel}T23:59:59.999`
  const start = nyLocalToUtc(startStr)
  const end = nyLocalToUtc(endStr)
  return { start, end, dateLabel }
}

export function explicitNYRange(dateLabel: string): {
  start: string
  end: string
  dateLabel: string
} {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateLabel)) {
    throw new Error(`Invalid date label: ${dateLabel}. Expected YYYY-MM-DD.`)
  }
  const start = nyLocalToUtc(`${dateLabel}T00:00:00`)
  const end = nyLocalToUtc(`${dateLabel}T23:59:59.999`)
  return { start, end, dateLabel }
}

/**
 * Convert a wall-clock ET timestamp ("2026-05-27T00:00:00") to its UTC
 * instant. Handles DST by walking the offset until the round-trip matches.
 */
function nyLocalToUtc(localStr: string): string {
  // Naive parse: treat the string as UTC, then shift by the NY offset for
  // that instant. We iterate twice to handle the DST edge case where the
  // naive guess lands in a different offset than the real one.
  const naive = new Date(localStr + 'Z')
  for (let i = 0; i < 2; i++) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    const parts = fmt.formatToParts(naive)
    const get = (t: string) => Number.parseInt(parts.find((p) => p.type === t)?.value || '0', 10)
    const nyAsUtc = Date.UTC(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour'),
      get('minute'),
      get('second'),
    )
    const diff = nyAsUtc - naive.getTime()
    if (diff === 0) break
    naive.setTime(naive.getTime() - diff)
  }
  return naive.toISOString()
}

// =============================================================================
// Data pull
// =============================================================================

type ConversationRow = {
  id: string
  channel: 'voice' | 'web_chat' | 'sms'
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  status: 'open' | 'closed' | 'escalated'
  closed_reason: string | null
  tz_lead_id: string | null
  attribution_channel: string | null
  external_call_id: string | null
  created_at: string
  closed_at: string | null
  total_input_tokens: number
  total_output_tokens: number
}

type MessageRow = {
  conversation_id: string
  role: 'user' | 'assistant' | 'tool_use' | 'tool_result'
  content: string | null
  tool_name: string | null
  tool_input: Record<string, unknown> | null
  created_at: string
}

type LeadFormRow = {
  id: string
  source: string
  service_label: string
  first_name: string | null
  last_name: string | null
  ownership: string | null
  attribution_channel: string | null
  qualification: Record<string, unknown> | null
  hcp_estimate_id: string | null
  hcp_lead_id: string | null
  hcp_error: string | null
  created_at: string
}

type EmergencyDispatchRow = {
  id: string
  conversation_id: string | null
  customer_phone: string
  time_window: string
  status: string
  issue_description: string
  next_attempt_no: number
  opened_at: string
}

export type DailyDataset = {
  range: { start: string; end: string; dateLabel: string }
  conversations: ConversationRow[]
  messagesByConversation: Map<string, MessageRow[]>
  leadFormSubmissions: LeadFormRow[]
  emergencyDispatches: EmergencyDispatchRow[]
}

export async function pullDailyData(
  range: { start: string; end: string; dateLabel: string },
): Promise<DailyDataset> {
  const sql = db()

  const conversations = (await sql`
    SELECT id, channel, customer_name, customer_phone, customer_email,
           status, closed_reason, tz_lead_id, attribution_channel,
           external_call_id, created_at, closed_at,
           total_input_tokens, total_output_tokens
    FROM tz_agent_conversations
    WHERE created_at >= ${range.start} AND created_at <= ${range.end}
    ORDER BY created_at ASC
  `) as unknown as ConversationRow[]

  const conversationIds = conversations.map((c) => c.id)
  let messages: MessageRow[] = []
  if (conversationIds.length > 0) {
    messages = (await sql`
      SELECT conversation_id, role, content, tool_name, tool_input, created_at
      FROM tz_agent_messages
      WHERE conversation_id = ANY(${conversationIds}::uuid[])
      ORDER BY created_at ASC
    `) as unknown as MessageRow[]
  }
  const messagesByConversation = new Map<string, MessageRow[]>()
  for (const m of messages) {
    const arr = messagesByConversation.get(m.conversation_id) || []
    arr.push(m)
    messagesByConversation.set(m.conversation_id, arr)
  }

  // Lead-form submissions = tz_leads rows where source is the web form
  // OR a partner integration (anything NOT routed through Claire). We
  // include them so the analyzer sees the lead pipeline as a whole.
  const leadFormSubmissions = (await sql`
    SELECT id, source, service_label, first_name, last_name, ownership,
           attribution_channel, qualification, hcp_estimate_id, hcp_lead_id,
           hcp_error, created_at
    FROM tz_leads
    WHERE created_at >= ${range.start} AND created_at <= ${range.end}
      AND hidden = FALSE
    ORDER BY created_at ASC
  `) as unknown as LeadFormRow[]

  const emergencyDispatches = (await sql`
    SELECT id, conversation_id, customer_phone, time_window, status,
           issue_description, next_attempt_no, opened_at
    FROM tz_emergency_dispatches
    WHERE opened_at >= ${range.start} AND opened_at <= ${range.end}
    ORDER BY opened_at ASC
  `) as unknown as EmergencyDispatchRow[]

  return {
    range,
    conversations,
    messagesByConversation,
    leadFormSubmissions,
    emergencyDispatches,
  }
}

// =============================================================================
// Baseline metrics (no LLM)
// =============================================================================

export type BaselineMetrics = {
  voice_count: number
  web_chat_count: number
  sms_count: number
  lead_form_count: number
  total_leads: number
  escalation_count: number
  emergency_dispatch_count: number
  silence_timeout_count: number
  // Extras for the JSON metrics column (anything we want without a migration).
  extras: {
    closed_reasons: Record<string, number>
    leads_by_source: Record<string, number>
    leads_with_hcp_errors: number
    avg_conversation_messages: number
    longest_conversation_messages: number
    repeated_phrase_calls: number
    /** Number of conversations where Claire said "one moment" / "hold tight"
     *  / similar more than twice. */
    stall_phrase_calls: number
  }
}

const STALL_PHRASES = [
  'one moment',
  'hold tight',
  'hold on a sec',
  'hold on a second',
  'let me get someone',
  'i\'ll connect you',
  'stay on the line',
]

export function computeBaselineMetrics(data: DailyDataset): BaselineMetrics {
  const conv = data.conversations
  const voice_count = conv.filter((c) => c.channel === 'voice').length
  const web_chat_count = conv.filter((c) => c.channel === 'web_chat').length
  const sms_count = conv.filter((c) => c.channel === 'sms').length
  const lead_form_count = data.leadFormSubmissions.filter(
    (l) => l.source !== 'voice_agent' && l.source !== 'sms_agent' && l.source !== 'web_chat',
  ).length

  const total_leads = conv.filter((c) => !!c.tz_lead_id).length + lead_form_count
  const escalation_count = conv.filter((c) => c.status === 'escalated').length
  const emergency_dispatch_count = data.emergencyDispatches.length

  // closed_reason looks like "voice_ended:silence-timed-out|recording:..."
  const closed_reasons: Record<string, number> = {}
  let silence_timeout_count = 0
  for (const c of conv) {
    if (!c.closed_reason) continue
    const reasonHead = c.closed_reason.split('|')[0]?.replace(/^voice_ended:/, '') || c.closed_reason
    closed_reasons[reasonHead] = (closed_reasons[reasonHead] || 0) + 1
    if (/silence-timed-out|silence-timeout/i.test(reasonHead)) silence_timeout_count++
  }

  const leads_by_source: Record<string, number> = {}
  let leads_with_hcp_errors = 0
  for (const l of data.leadFormSubmissions) {
    leads_by_source[l.source] = (leads_by_source[l.source] || 0) + 1
    if (l.hcp_error) leads_with_hcp_errors++
  }

  // Conversation length metrics
  let totalMessages = 0
  let longest = 0
  let stallCalls = 0
  let repeatCalls = 0
  for (const c of conv) {
    const msgs = data.messagesByConversation.get(c.id) || []
    const turns = msgs.filter((m) => m.role === 'user' || m.role === 'assistant')
    totalMessages += turns.length
    if (turns.length > longest) longest = turns.length

    // Count Claire's stall phrases
    const claireTurns = turns.filter((m) => m.role === 'assistant')
    const stallHits = claireTurns.reduce((acc, t) => {
      const text = (t.content || '').toLowerCase()
      const hits = STALL_PHRASES.reduce((n, p) => n + (text.includes(p) ? 1 : 0), 0)
      return acc + hits
    }, 0)
    if (stallHits >= 2) stallCalls++

    // Count exact-repeat assistant turns (Claire saying the same thing twice)
    const seen = new Map<string, number>()
    for (const t of claireTurns) {
      const text = (t.content || '').trim().toLowerCase()
      if (text.length < 10) continue
      seen.set(text, (seen.get(text) || 0) + 1)
    }
    if ([...seen.values()].some((n) => n >= 2)) repeatCalls++
  }

  const avg_conversation_messages = conv.length === 0 ? 0 : Math.round(totalMessages / conv.length)

  return {
    voice_count,
    web_chat_count,
    sms_count,
    lead_form_count,
    total_leads,
    escalation_count,
    emergency_dispatch_count,
    silence_timeout_count,
    extras: {
      closed_reasons,
      leads_by_source,
      leads_with_hcp_errors,
      avg_conversation_messages,
      longest_conversation_messages: longest,
      repeated_phrase_calls: repeatCalls,
      stall_phrase_calls: stallCalls,
    },
  }
}

// =============================================================================
// LLM input shaping (compress transcripts for context budget)
// =============================================================================

const MAX_CONVERSATIONS_FOR_LLM = 60
const MAX_CHARS_PER_TURN = 600
const MAX_TURNS_PER_CONVERSATION = 40

export function shapeConversationsForLLM(data: DailyDataset): string {
  const blocks: string[] = []
  // Prioritize: escalations + emergencies first, then long conversations,
  // then everything else. So the LLM sees the most signal-rich convos
  // even if we hit MAX_CONVERSATIONS_FOR_LLM.
  const score = (c: ConversationRow): number => {
    let s = 0
    if (c.status === 'escalated') s += 100
    if ((c.closed_reason || '').includes('silence-timed-out')) s += 50
    if (c.tz_lead_id) s += 30
    const msgs = data.messagesByConversation.get(c.id) || []
    s += Math.min(msgs.length, 40)
    return s
  }
  const ranked = [...data.conversations].sort((a, b) => score(b) - score(a))
  const chosen = ranked.slice(0, MAX_CONVERSATIONS_FOR_LLM)

  for (const c of chosen) {
    const localTime = new Date(c.created_at).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    const lead = c.tz_lead_id ? 'LEAD' : 'no-lead'
    const closedHead = (c.closed_reason || '').split('|')[0]?.replace(/^voice_ended:/, '') || ''
    const header = `[conv ${c.id.slice(0, 8)} · ${c.channel} · ${localTime} ET · status=${c.status} · ${lead}${closedHead ? ` · ended:${closedHead}` : ''}]`

    const msgs = data.messagesByConversation.get(c.id) || []
    const lines: string[] = [header]
    const turns = msgs
      .filter((m) => m.role !== 'tool_result') // we'll show tool_use as a short marker
      .slice(0, MAX_TURNS_PER_CONVERSATION)

    for (const m of turns) {
      if (m.role === 'tool_use') {
        lines.push(`  [tool: ${m.tool_name}]`)
        continue
      }
      const speaker = m.role === 'user' ? 'caller' : 'Claire'
      const text = (m.content || '').replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS_PER_TURN)
      if (text) lines.push(`  ${speaker}: ${text}`)
    }
    blocks.push(lines.join('\n'))
  }
  return blocks.join('\n\n')
}

// =============================================================================
// LLM analysis (structured output via Zod)
// =============================================================================

export const proposalsSchema = z.object({
  summary: z
    .string()
    .describe(
      'One-paragraph plain-English overview of how Claire performed yesterday. Plain prose, no bullet points.',
    ),
  wins: z
    .array(
      z.object({
        description: z
          .string()
          .describe('What Claire did well in this conversation. Specific moment, not generic praise.'),
        evidence_conversation_ids: z
          .array(z.string())
          .describe('Short conversation ids (first 8 chars) backing this observation.'),
      }),
    )
    .describe(
      'Specific transcript moments where Claire handled the call well. Skip generic praise — only include if backed by an actual conversation.',
    ),
  failure_patterns: z
    .array(
      z.object({
        pattern: z
          .string()
          .describe('What went wrong, in one sentence. Be specific about the behavior.'),
        severity: z.enum(['low', 'medium', 'high']),
        n_calls_affected: z
          .number()
          .int()
          .describe(
            'How many of yesterday\'s calls showed this pattern. Be conservative — N=1 is not a pattern.',
          ),
        evidence_conversation_ids: z.array(z.string()),
      }),
    )
    .describe(
      'Recurring failure modes worth addressing. Only flag patterns with N >= 2 calls unless severity=high. Do NOT propose rules for one-off events.',
    ),
  kb_gaps: z
    .array(
      z.object({
        question_asked: z
          .string()
          .describe('The customer question Claire couldn\'t answer well, verbatim if possible.'),
        claire_response: z
          .string()
          .describe('How Claire responded — was it a hedge, an "I\'m not sure", a misleading answer?'),
        proposed_addition: z
          .string()
          .describe(
            'Concrete KB content to add. Phrasing-ready: the actual sentence or two we\'d drop into docs/agent-training-answers.md.',
          ),
        evidence_conversation_ids: z.array(z.string()),
      }),
    )
    .describe(
      'Questions customers asked that revealed a knowledge-base gap. Each gap must include a concrete proposed addition Tyler could approve as-is.',
    ),
  proposed_prompt_rules: z
    .array(
      z.object({
        rule: z
          .string()
          .describe(
            'The exact new rule to add to the system prompt. Write it in the same imperative style as the existing rules in agent-prompt.ts.',
          ),
        rationale: z
          .string()
          .describe(
            'Why this rule is worth adding. Tie it to specific transcript evidence.',
          ),
        evidence_conversation_ids: z.array(z.string()),
      }),
    )
    .describe(
      'New prompt rules worth proposing to Tyler. Be conservative — rules accumulate fast and the prompt is already long. Only propose when a clear pattern with concrete fix exists.',
    ),
  calls_worth_listening_to: z
    .array(
      z.object({
        conversation_id: z.string().describe('Short id (first 8 chars).'),
        why: z.string().describe('One sentence on why this call is worth Tyler\'s ear.'),
      }),
    )
    .describe(
      'Specific calls Tyler should pull up in /switchboard/call-logs and listen to or read in full.',
    ),
  questions_for_tyler: z
    .array(
      z.object({
        question: z.string().describe('The ambiguous case where you need Tyler\'s judgment.'),
        context: z.string().describe('Short context — which call(s), what happened.'),
      }),
    )
    .describe(
      'Ambiguous situations the analyzer cannot resolve and that need a human call. Examples: brand-voice questions, scope questions, "do we offer X" questions.',
    ),
})

export type ClaireProposals = z.infer<typeof proposalsSchema>

const ANALYZER_SYSTEM_PROMPT = `You are the nightly performance reviewer for Claire, the AI smart-assistant for TZ Electric, Inc. (a residential and commercial electrical / plumbing / HVAC company in the Hudson Valley, NY). Claire handles inbound voice calls, /claire web chat, and SMS, and the goal of each conversation is either to book a free estimate into Housecall Pro or to dispatch an emergency tech.

You are NOT Claire. You are her coach. Your job: read yesterday's conversations, find what worked, find what didn't, and propose concrete improvements Tyler (TZ owner) can review and approve.

Rules of engagement:

1. **Be specific, not generic.** "She handled the call professionally" is useless. "On conv abc12345 she correctly redirected a hiring inquiry to /careers without trying to book a service lead" is useful.

2. **Be conservative.** A pattern is N >= 2 conversations unless severity is high. One bad call ≠ a rule change. If you'd bet 80 cents you're right, propose it. If you'd bet 30 cents, put it in questions_for_tyler instead.

3. **Propose paste-able fixes.** kb_gaps must include the actual sentence to add to the KB. proposed_prompt_rules must include the actual imperative-mood rule to drop into the system prompt — same style as existing rules ("Claire MUST never say X. Use Y instead. Why: <reason>.").

4. **Cite evidence.** Every observation includes evidence_conversation_ids using the short id (first 8 characters) from the conversation headers shown to you.

5. **Brand voice is the rules.** Claire's voice: friendly, neighborly, direct, never AI-sounding. NEVER em dashes, NEVER emojis, NEVER "Great question" / "I'd be happy to" / "Hold tight" / "1 moment" repeated / "Let me get someone for you". For estimate flow she uses "estimator / specialist / office" never "technician". For the after-hours $475 dispatch fee she must frame it as conditional opt-in, not a charge. She never volunteers pricing unless asked. These rules are already in the prompt — flag VIOLATIONS, don't propose them as new.

6. **Watch for these specific failure modes:**
   - Claire promising transfers ("Hold tight", "Let me get someone")
   - Claire repeating the same sentence twice in a row
   - Claire offering pricing when nobody asked
   - Claire saying "technician" during an estimate flow
   - Claire reading phone numbers as a fast blur instead of paced digits
   - Claire stating the $475 fee as a charge instead of a conditional
   - Customer asking a question Claire fell back on "the office will help" instead of answering

7. **Skip the noise.** If nothing in a category is worth flagging, return an empty array. Don't pad.

Output the structured JSON exactly as the schema specifies. No prose outside the schema.`

const ANALYZER_USER_TEMPLATE = (data: {
  dateLabel: string
  metrics: BaselineMetrics
  conversationsText: string
  leadFormBlock: string
  emergencyBlock: string
}) =>
  `Date analyzed: ${data.dateLabel} (America/New_York day)

## Baseline metrics
Voice calls: ${data.metrics.voice_count}
Web chat sessions: ${data.metrics.web_chat_count}
SMS conversations: ${data.metrics.sms_count}
Web-form lead submissions: ${data.metrics.lead_form_count}
Total leads (Claire-booked + form): ${data.metrics.total_leads}
Escalations: ${data.metrics.escalation_count}
Emergency dispatches fired: ${data.metrics.emergency_dispatch_count}
Silence timeouts: ${data.metrics.silence_timeout_count}
Stall-phrase calls (Claire said "hold tight" / "one moment" / etc. 2+ times): ${data.metrics.extras.stall_phrase_calls}
Calls where Claire repeated herself verbatim: ${data.metrics.extras.repeated_phrase_calls}
Closed-reason breakdown: ${JSON.stringify(data.metrics.extras.closed_reasons)}
Lead sources: ${JSON.stringify(data.metrics.extras.leads_by_source)}
Leads with HCP sync errors: ${data.metrics.extras.leads_with_hcp_errors}
Average conversation turns: ${data.metrics.extras.avg_conversation_messages}
Longest conversation (turns): ${data.metrics.extras.longest_conversation_messages}

## Web-form lead submissions
${data.leadFormBlock || '(none)'}

## Emergency dispatches
${data.emergencyBlock || '(none)'}

## Conversation transcripts (signal-ranked, top ${MAX_CONVERSATIONS_FOR_LLM})
${data.conversationsText || '(no conversations yesterday)'}

Produce the structured analysis now.`

export type LLMAnalysisResult = {
  proposals: ClaireProposals
  usage: { inputTokens: number; outputTokens: number }
  model: string
}

export async function runLLMAnalysis(
  data: DailyDataset,
  metrics: BaselineMetrics,
): Promise<LLMAnalysisResult> {
  const conversationsText = shapeConversationsForLLM(data)
  const leadFormBlock = data.leadFormSubmissions
    .slice(0, 40)
    .map((l) => {
      const localTime = new Date(l.created_at).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      const name = `${l.first_name || ''} ${l.last_name || ''}`.trim() || '(no name)'
      return `- ${localTime} · ${l.service_label} · ${name} · source=${l.source}${l.hcp_error ? ' · HCP-ERROR' : ''}`
    })
    .join('\n')

  const emergencyBlock = data.emergencyDispatches
    .map((e) => {
      const localTime = new Date(e.opened_at).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      return `- ${localTime} · ${e.time_window} · status=${e.status} · ${e.issue_description.slice(0, 120)}`
    })
    .join('\n')

  // Opus 4.7 is the right intelligence tier for this work — the
  // analyzer reasons across the full day of transcripts and produces
  // judgment calls about what's a real pattern vs noise. Cesar
  // specifically asked for this on 2026-05-27 evening: "use a higher
  // intelligence than Sonnet." Standard Opus 4.7 context (200k) is more
  // than enough — our typical input is 15-30k tokens; we don't need the
  // 1M variant unless a single day ever exceeds 50+ long voice calls.
  // Cost moves from ~$0.10/day (Sonnet) to ~$0.50/day (Opus). Still
  // trivial relative to the failure modes the analyzer catches.
  const model = 'anthropic/claude-opus-4.7'
  const userPrompt = ANALYZER_USER_TEMPLATE({
    dateLabel: data.range.dateLabel,
    metrics,
    conversationsText,
    leadFormBlock,
    emergencyBlock,
  })

  // Anthropic's generateObject path can produce prose alongside the JSON
  // tool-call payload. Help the SDK and Anthropic both:
  //  - schemaName + schemaDescription become the tool name + description
  //    Anthropic sees, so the model has clearer intent.
  //  - experimental_repairText pulls JSON out of any surrounding prose if
  //    the initial parse fails (e.g. ```json fences, "Here is the analysis"
  //    preamble, etc.). One free retry before we give up.
  const result = await generateObject({
    model: gateway(model),
    schema: proposalsSchema,
    schemaName: 'claire_daily_analysis',
    schemaDescription:
      "Structured daily learning report for TZ Electric's voice/chat/SMS AI agent Claire. Fields: summary (paragraph), wins (specific transcript moments), failure_patterns (N>=2 recurring issues), kb_gaps (with paste-ready additions), proposed_prompt_rules (new rules with rationale), calls_worth_listening_to, questions_for_tyler.",
    system: {
      role: 'system',
      content: ANALYZER_SYSTEM_PROMPT,
      providerOptions: {
        anthropic: { cacheControl: { type: 'ephemeral' } },
      },
    },
    prompt: userPrompt,
    maxOutputTokens: 8000,
    experimental_repairText: async ({ text }) => {
      // Strip common preambles / code fences before re-parse.
      const cleaned = text
        .replace(/^[^{]*?```(?:json)?\s*/i, '')
        .replace(/\s*```[^}]*$/i, '')
        .trim()
      // If we have a `{ ... }` body buried inside prose, find it.
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        return cleaned.slice(firstBrace, lastBrace + 1)
      }
      return cleaned
    },
    providerOptions: {
      gateway: {
        tags: ['feature:claire-self-improvement', `env:${process.env.VERCEL_ENV || 'dev'}`],
      },
    },
  })

  return {
    proposals: result.object,
    usage: {
      inputTokens: result.usage?.inputTokens ?? 0,
      outputTokens: result.usage?.outputTokens ?? 0,
    },
    model,
  }
}

// =============================================================================
// Persistence (idempotent upsert on analysis_date)
// =============================================================================

export type PersistAnalysisInput = {
  dateLabel: string
  metrics: BaselineMetrics
  proposals: ClaireProposals
  reportHtml: string
  reportText: string
  emailSentAt: Date | null
  emailRecipients: string[] | null
  emailError: string | null
  llmInputTokens: number
  llmOutputTokens: number
  llmModel: string
  llmError: string | null
}

export async function persistAnalysis(input: PersistAnalysisInput): Promise<{ id: string }> {
  const sql = db()
  const rows = (await sql`
    INSERT INTO tz_claire_daily_analysis (
      analysis_date,
      voice_count, web_chat_count, sms_count, lead_form_count, total_leads,
      escalation_count, emergency_dispatch_count, silence_timeout_count,
      metrics, proposals, report_html, report_text,
      email_sent_at, email_recipients, email_error,
      llm_input_tokens, llm_output_tokens, llm_model, llm_error
    ) VALUES (
      ${input.dateLabel}::date,
      ${input.metrics.voice_count}, ${input.metrics.web_chat_count},
      ${input.metrics.sms_count}, ${input.metrics.lead_form_count},
      ${input.metrics.total_leads}, ${input.metrics.escalation_count},
      ${input.metrics.emergency_dispatch_count}, ${input.metrics.silence_timeout_count},
      ${JSON.stringify(input.metrics.extras)}::jsonb,
      ${JSON.stringify(input.proposals)}::jsonb,
      ${input.reportHtml}, ${input.reportText},
      ${input.emailSentAt ? input.emailSentAt.toISOString() : null},
      ${input.emailRecipients as string[] | null},
      ${input.emailError},
      ${input.llmInputTokens}, ${input.llmOutputTokens},
      ${input.llmModel}, ${input.llmError}
    )
    ON CONFLICT (analysis_date) DO UPDATE SET
      voice_count = EXCLUDED.voice_count,
      web_chat_count = EXCLUDED.web_chat_count,
      sms_count = EXCLUDED.sms_count,
      lead_form_count = EXCLUDED.lead_form_count,
      total_leads = EXCLUDED.total_leads,
      escalation_count = EXCLUDED.escalation_count,
      emergency_dispatch_count = EXCLUDED.emergency_dispatch_count,
      silence_timeout_count = EXCLUDED.silence_timeout_count,
      metrics = EXCLUDED.metrics,
      proposals = EXCLUDED.proposals,
      report_html = EXCLUDED.report_html,
      report_text = EXCLUDED.report_text,
      email_sent_at = EXCLUDED.email_sent_at,
      email_recipients = EXCLUDED.email_recipients,
      email_error = EXCLUDED.email_error,
      llm_input_tokens = EXCLUDED.llm_input_tokens,
      llm_output_tokens = EXCLUDED.llm_output_tokens,
      llm_model = EXCLUDED.llm_model,
      llm_error = EXCLUDED.llm_error,
      updated_at = NOW()
    RETURNING id
  `) as unknown as { id: string }[]
  return { id: rows[0].id }
}
