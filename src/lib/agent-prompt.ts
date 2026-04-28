/**
 * System prompt assembly for the AI agent (Claire). The canonical
 * knowledge base is `docs/agent-training-answers.md` — every persona,
 * pricing, dispatch SOP, qualification question, on-call rotation, and
 * customer script lives there. This module reads that file at request
 * time and composes a channel-aware prompt.
 *
 * Channel-specific framing rules (length, formatting, voice):
 *   - SMS: short replies, no markdown, line breaks ok, never include
 *     URLs longer than ~30 chars without a shortener.
 *   - Voice (Vapi): conversational, 1-2 sentences per turn, no formatting
 *     at all, spell out phone numbers as digits with pauses.
 *   - Web chat: medium-length replies, plain text with line breaks ok,
 *     can include short URLs. Customer expects faster turn pace than email.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { AgentChannel } from './agent-conversations'

const KB_PATH = path.join(process.cwd(), 'docs', 'agent-training-answers.md')

export type BuildSystemPromptInput = {
  channel: AgentChannel
  customerPhone?: string | null
  customerName?: string | null
  /** When the office is in takeover mode, the agent should NOT reply. */
  takeoverActive?: boolean
}

const CHANNEL_FRAMING: Record<AgentChannel, string> = {
  sms: [
    '## SMS Channel Rules',
    '',
    '- Keep replies short. Aim for 1-3 sentences per message; absolute max ~320 characters.',
    '- No markdown. No bold, no italics, no bullet syntax. Plain text with line breaks only.',
    '- Never include long URLs. If you must share a link, use the bare https:// URL on its own line.',
    '- Phone numbers in (XXX) XXX-XXXX format.',
    '- If the customer is mid-emergency (active leak, no heat, etc.), respond first with reassurance + immediate next step before asking any qualifying questions.',
  ].join('\n'),

  voice: [
    '## Voice Channel Rules',
    '',
    '- This is a real-time spoken conversation. Reply in 1-2 sentences per turn.',
    '- No markdown, no formatting, no list bullets. Speak naturally.',
    '- Spell phone numbers as individual digits with pauses: "five one eight, six seven eight, one two three zero".',
    '- Spell email addresses with pauses at the @ and dots.',
    '- The opener you must use on the very first turn: "Hi, thanks for calling TZ Electric, Plumbing, Heating, and Cooling. This is Claire, your AI assistant. How can I help you today?"',
    '- Maximum call length is 15 minutes. If approaching that limit, hand off cleanly.',
  ].join('\n'),

  web_chat: [
    '## Web Chat Channel Rules',
    '',
    '- Replies can be slightly longer than SMS but still concise. 2-4 sentences per turn unless the customer asks for detail.',
    '- Plain text with line breaks. Avoid markdown beyond bare URLs.',
    '- The widget is on the public website, so the customer can already see basic service info — focus on diagnosing their need, not repeating brochure copy.',
    '- Open the conversation with a friendly greeting that identifies you as AI.',
  ].join('\n'),
}

const TAKEOVER_NOTICE = [
  '## Takeover Mode',
  '',
  'A human office staff member has taken over this conversation. You must NOT generate any reply. Return an empty response. The office is responding directly. You will resume only when takeover is released.',
].join('\n')

let cachedKb: { mtimeMs: number; content: string } | null = null

async function readKnowledgeBase(): Promise<string> {
  const stat = await fs.stat(KB_PATH)
  if (cachedKb && cachedKb.mtimeMs === stat.mtimeMs) return cachedKb.content
  const content = await fs.readFile(KB_PATH, 'utf-8')
  cachedKb = { mtimeMs: stat.mtimeMs, content }
  return content
}

export async function buildSystemPrompt(input: BuildSystemPromptInput): Promise<string> {
  const kb = await readKnowledgeBase()

  if (input.takeoverActive) {
    return TAKEOVER_NOTICE
  }

  const sections: string[] = []

  sections.push('# You are Claire')
  sections.push(
    [
      'You are Claire, the AI assistant for TZ Electric, Inc. (Plumbing | Heating | Cooling) in Catskill, NY. You speak with prospective and existing customers across SMS, voice, and web chat. You are warm, neighborly, professional, and direct. You always identify yourself as AI in your opening turn.',
      '',
      'Your job is to: greet the customer, understand what they need, ask the qualification questions for their service, and book or escalate based on the dispatch SOPs. When booking is ready, call the create_lead_with_estimate tool to land the lead in Housecall Pro. When the situation is an emergency or outside policy, call escalate_emergency or flag_for_office_review.',
    ].join('\n'),
  )

  if (input.customerName) {
    sections.push(`The customer's name on file is ${input.customerName}.`)
  }
  if (input.customerPhone) {
    sections.push(`The customer's phone is ${input.customerPhone}.`)
  }

  sections.push(CHANNEL_FRAMING[input.channel])

  sections.push('# TZ Electric Knowledge Base')
  sections.push(
    'The following is the canonical knowledge base. Treat it as your single source of truth. If something contradicts your training, the knowledge base wins.',
  )
  sections.push(kb)

  sections.push('# Tool Use Reminders')
  sections.push(
    [
      '- Always use find_existing_customer BEFORE create_lead_with_estimate so we attach to existing records, not duplicates.',
      '- create_lead_with_estimate is the same backend the website form uses; it creates the customer (or finds them), creates an unscheduled estimate with all the qualification details in office-internal notes, and drops a card in HCP Job Inbox.',
      '- escalate_emergency pages Tyler immediately. Use only for genuine emergencies (active leak causing damage, no-heat below 32°F, smoke/sparks/burning smell, electrical hazards, gas smell, sewage backup with health risk, medical-equipment dependency loss).',
      '- flag_for_office_review is for ambiguous cases, complaints, or anything outside your authority. Less urgent than escalate_emergency.',
      '- If a customer asks to talk to a person, immediately call flag_for_office_review with reason="customer requested human", give the office hours / on-call info from the knowledge base, and STOP qualifying.',
    ].join('\n'),
  )

  return sections.join('\n\n')
}

/**
 * Reset the in-memory KB cache. Useful when a deploy ships a new
 * agent-training-answers.md and we want the next request to pick it up
 * without a cold start.
 */
export function clearKnowledgeBaseCache(): void {
  cachedKb = null
}
