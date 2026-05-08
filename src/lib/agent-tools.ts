/**
 * Tool definitions Claire can call during a conversation. Built on the
 * Vercel AI SDK v6 `tool()` helper with Zod input schemas so types stay
 * tight and the SDK's `generateText` / `streamText` auto-runs them
 * inside the tool-use loop. The same tool surface is shared by SMS,
 * voice, and web-chat agents — only the channel framing in the system
 * prompt changes.
 *
 * Implementations wrap our existing logic: HCP customer lookup, the
 * same /api/leads/submit pipeline the website form uses, lead status
 * reads, escalation paging.
 */

import { tool } from 'ai'
import { z } from 'zod'

import {
  attachLeadToConversation,
  escalateConversation,
} from './agent-conversations'
import { leadValueCents } from './attribution'
import { db } from './db'
import { businessUnitUuidForService } from './constants'
import {
  createCustomerForLead,
  createEstimateForLead,
  createInboxLeadForEstimate,
  findExistingCustomer,
  type HCPCustomer,
} from './housecall-pro'
import { attachHcpEstimate, attachHcpLeadId, insertLead } from './leads-store'

export type AgentChannelLabel = 'sms' | 'voice' | 'web_chat'

export type AgentToolContext = {
  conversationId: string
  channel: AgentChannelLabel
}

const SERVICE_KEYS = [
  'hvac',
  'electrical',
  'generator',
  'plumbing',
  'ev-charger',
  'surge',
  'other',
] as const

/**
 * Build the tool surface for a given conversation. Returning a function
 * (instead of a static export) lets us close over the conversation id /
 * channel inside `execute` without leaking them onto the input schema —
 * the model only sees the args it's supposed to provide.
 */
export function buildAgentTools(ctx: AgentToolContext) {
  return {
    update_visitor_contact: tool({
      description:
        "Save the visitor's first name and best phone number to this conversation as soon as they share them. Call this on the FIRST turn after the visitor tells you who they are, BEFORE any qualification questions. The office sees the name and phone in the TZ Switchboard immediately, so even if the visitor leaves mid-conversation we can still follow up. Email is optional. Phone is required (10-digit US). Safe to call again if the visitor corrects their info.",
      inputSchema: z.object({
        first_name: z
          .string()
          .describe("Visitor's first name. Use full name if they shared both."),
        phone: z
          .string()
          .describe('10-digit US phone, any format. Required. Strip non-digits server-side.'),
        last_name: z
          .string()
          .optional()
          .describe('Last name if they shared one.'),
        email: z
          .string()
          .optional()
          .describe('Email if they shared it. Phone is the priority.'),
      }),
      execute: async ({ first_name, last_name, phone, email }) => {
        const fullName = [first_name?.trim(), last_name?.trim()]
          .filter(Boolean)
          .join(' ')
          .trim()
        const digitsOnly = phone.replace(/\D/g, '')
        const normalizedPhone =
          digitsOnly.length === 11 && digitsOnly.startsWith('1')
            ? digitsOnly.slice(1)
            : digitsOnly
        if (normalizedPhone.length !== 10) {
          return {
            ok: false,
            error: 'Phone number must be 10 digits. Ask the visitor to clarify.',
          }
        }
        try {
          const sql = db()
          await sql`
            UPDATE tz_agent_conversations
            SET customer_name  = ${fullName || null},
                customer_phone = ${normalizedPhone},
                customer_email = COALESCE(${email?.trim() || null}, customer_email),
                updated_at     = NOW()
            WHERE id = ${ctx.conversationId}
          `
          return {
            ok: true,
            saved: {
              name: fullName,
              phone: normalizedPhone,
              email: email?.trim() || null,
            },
            message: `Saved ${fullName || 'contact'} / ${normalizedPhone} on this conversation. Office now sees them in the Switchboard.`,
          }
        } catch (e) {
          console.error('[agent-tools] update_visitor_contact failed:', e)
          return {
            ok: false,
            error: 'Failed to save contact info. Continue the conversation; the office can still see the transcript.',
          }
        }
      },
    }),

    find_existing_customer: tool({
      description:
        'Look up an existing customer in Housecall Pro by phone, email, or full name. Always call this BEFORE creating a lead so we attach to the existing record instead of duplicating. Returns the matched HCP customer id (or null) and which signal matched.',
      inputSchema: z.object({
        phone: z.string().optional().describe('10-digit US phone, any format.'),
        email: z.string().optional(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
      }),
      execute: async ({ phone, email, first_name, last_name }) => {
        if (!phone && !email && !first_name && !last_name) {
          return { match: null, matched_by: null }
        }
        const result = await findExistingCustomer({
          phone,
          email,
          firstName: first_name,
          lastName: last_name,
        })
        if (!result) return { match: null, matched_by: null }
        return {
          match: {
            id: result.customer.id,
            first_name: result.customer.first_name,
            last_name: result.customer.last_name,
            email: result.customer.email,
            mobile_number: result.customer.mobile_number,
          },
          matched_by: result.matchedBy,
        }
      },
    }),

    create_lead_with_estimate: tool({
      description:
        'BOOK THE LEAD INTO HOUSECALL PRO. This is the same backend the website /quote form uses, called via the same pipeline. Calling this tool: (1) persists the lead to the TZ DB, (2) finds-or-creates the HCP customer (by phone, email, or name), (3) creates an unscheduled estimate with all qualification answers in office-internal private notes, (4) drops a card in HCP Job Inbox so the office sees the new lead immediately, (5) mirrors to the TZ Switchboard Lead Pipeline, and (6) attaches the resulting tz_lead_id to this conversation. There is no other way to land a lead in HCP from this conversation; this tool IS the booking step. Call when: the visitor has agreed to a free estimate AND you have first name + last name + phone + ownership at minimum. Use the qualification keys from section 6 of the knowledge base ("Canonical Lead Intake Question Set") so the office reads consistent fields across the website form and every agent.',
      inputSchema: z.object({
        first_name: z.string(),
        last_name: z.string(),
        phone: z.string().describe('10-digit US phone, any format.'),
        email: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional().describe('2-letter state code, default NY.'),
        zip: z.string().optional(),
        service_key: z.enum(SERVICE_KEYS),
        service_label: z.string().describe('Human-readable service name like "HVAC / Mini-Split".'),
        qualification: z
          .record(z.string(), z.string())
          .optional()
          .describe(
            'Map of qualification question id → customer answer. Use the keys from section 6 of the knowledge base (heatingOrCooling, scope, urgency, etc.).',
          ),
        ownership: z.enum(['homeowner', 'renter']),
        landlord_name: z.string().optional(),
        landlord_phone: z.string().optional(),
        landlord_email: z.string().optional(),
        landlord_permission: z.boolean().optional(),
        customer_notes: z.string().optional(),
        referral_source: z.string().optional(),
      }),
      execute: async (input) => createLeadWithEstimateImpl(input, ctx),
    }),

    lookup_business_hours: tool({
      description:
        "Return TZ Electric's current business hours and whether the office is open right now. Use to decide between business-hours and after-hours dispatch routing.",
      inputSchema: z.object({}),
      execute: async () => lookupBusinessHoursImpl(),
    }),

    flag_for_office_review: tool({
      description:
        'Mark this conversation as needing office attention without paging anyone. Use for ambiguous situations, complaints, customer asks for a person, anything outside your authority.',
      inputSchema: z.object({
        reason: z.string().describe('Brief description of why office should review.'),
        priority: z.enum(['low', 'normal', 'high']).default('normal'),
      }),
      execute: async ({ reason, priority }) => {
        await escalateConversation(ctx.conversationId, `flagged: ${reason}`)
        console.log(`[agent-tools] flag_for_office_review (${priority}): ${reason}`)
        return {
          flagged: true,
          reason,
          priority,
          message: 'Office has been notified and will review this conversation.',
        }
      },
    }),

    escalate_emergency: tool({
      description:
        "Page Tyler and the on-call team immediately. Use ONLY for genuine emergencies: active leak causing damage, no heat below 32°F, smoke/sparks/burning smell, electrical hazard with shock risk, gas smell, sewage backup with health risk, medical-equipment dependency loss. Always include the customer's phone.",
      inputSchema: z.object({
        reason: z.string(),
        customer_phone: z.string(),
        customer_name: z.string().optional(),
        address: z.string().optional(),
      }),
      execute: async ({ reason, customer_phone, customer_name, address }) => {
        await escalateConversation(ctx.conversationId, `emergency: ${reason}`)
        console.log(
          `[agent-tools] EMERGENCY ESCALATION: ${reason} | ${customer_name || ''} | ${customer_phone} | ${address || ''}`,
        )
        // TODO: when Tyler ships Twilio, page him + on-call rotation here.
        return {
          escalated: true,
          reason,
          message:
            'Emergency dispatch has been alerted. Tyler and the on-call team are being paged now. Stay on the line, keep your phone close, someone will reach back within minutes.',
        }
      },
    }),
  }
}

type LeadInput = {
  first_name: string
  last_name: string
  phone: string
  email?: string
  street?: string
  city?: string
  state?: string
  zip?: string
  service_key: (typeof SERVICE_KEYS)[number]
  service_label: string
  qualification?: Record<string, string>
  ownership: 'homeowner' | 'renter'
  landlord_name?: string
  landlord_phone?: string
  landlord_email?: string
  landlord_permission?: boolean
  customer_notes?: string
  referral_source?: string
}

async function createLeadWithEstimateImpl(input: LeadInput, ctx: AgentToolContext) {
  if (input.ownership === 'renter' && (!input.landlord_name || !input.landlord_phone || !input.landlord_permission)) {
    return {
      ok: false,
      error: 'Renter inquiries require landlord_name, landlord_phone, and landlord_permission=true',
    }
  }

  const sourceMap: Record<AgentChannelLabel, 'sms_agent' | 'voice_agent' | 'web_chat'> = {
    sms: 'sms_agent',
    voice: 'voice_agent',
    web_chat: 'web_chat',
  }
  const source = sourceMap[ctx.channel]
  const valueCents = leadValueCents(input.service_key)
  const cleanQualification = input.qualification || {}
  const channelLabel =
    ctx.channel === 'sms'
      ? 'Agent: SMS Claire'
      : ctx.channel === 'voice'
        ? 'Agent: Voice Claire'
        : 'Agent: Chat Claire'

  let storedLeadId: string | null = null
  try {
    storedLeadId = await insertLead({
      source,
      serviceKey: input.service_key,
      serviceLabel: input.service_label,
      firstName: input.first_name.trim(),
      lastName: input.last_name.trim(),
      phone: input.phone,
      email: input.email,
      street: input.street,
      city: input.city,
      state: input.state || 'NY',
      zip: input.zip,
      ownership: input.ownership,
      landlordName: input.landlord_name,
      landlordPhone: input.landlord_phone,
      landlordEmail: input.landlord_email,
      qualification: cleanQualification,
      customerNotes: input.customer_notes,
      referralSource: input.referral_source,
      attributionChannel: channelLabel,
      attributionValueCents: valueCents,
    })
  } catch (e) {
    console.error('[agent-tools] tz_leads insert failed:', e)
    return { ok: false, error: 'Failed to persist lead. Please try again.' }
  }

  let hcpCustomer: HCPCustomer | null = null
  let hcpCustomerExisting = false
  let hcpMatchedBy: 'phone' | 'email' | 'name' | null = null
  let hcpEstimateId: string | undefined
  let hcpInboxLeadId: string | undefined
  let hcpError: string | undefined

  try {
    const match = await findExistingCustomer({
      firstName: input.first_name,
      lastName: input.last_name,
      phone: input.phone,
      email: input.email,
    })
    if (match) {
      hcpCustomer = match.customer
      hcpCustomerExisting = true
      hcpMatchedBy = match.matchedBy
    } else {
      hcpCustomer = await createCustomerForLead({
        firstName: input.first_name.trim(),
        lastName: input.last_name.trim(),
        phone: input.phone,
        email: input.email,
        street: input.street,
        city: input.city,
        state: input.state,
        zip: input.zip,
      })
    }
  } catch (e) {
    hcpError = e instanceof Error ? e.message : String(e)
  }

  if (hcpCustomer && !hcpError) {
    try {
      // Lead the tag list with a single condensed summary so the HCP Job
      // Inbox card answers "what is this?" at a glance. Same convention
      // as the web-form path.
      const cityState = [input.city, input.state].filter((v): v is string => !!v).join(', ').trim()
      const summary = cityState ? `${input.service_label} · ${cityState}` : input.service_label
      const tags: string[] = [
        summary,
        `Channel: Agent ${ctx.channel.toUpperCase()}`,
        'TZ AI AGENT',
        `Service: ${input.service_label}`,
      ]
      if (cleanQualification.urgency)
        tags.push(`Urgency: ${cleanQualification.urgency.slice(0, 39)}`)
      if (cleanQualification.scope) tags.push(cleanQualification.scope.slice(0, 49))
      if (hcpCustomerExisting) tags.push('Existing customer')
      if (input.ownership === 'renter') tags.push('Renter - Verify with Landlord')
      if (cleanQualification.medical === 'Yes') tags.push('Medical Equipment in Home')
      if (cleanQualification.urgentNow === 'Yes — active leak') tags.push('ACTIVE LEAK')

      const privateNotes = buildAgentEstimateNotes(input, ctx, hcpCustomerExisting, hcpMatchedBy)
      const description = `${input.service_label} — ${ctx.channel === 'sms' ? 'SMS' : ctx.channel === 'voice' ? 'Voice' : 'Chat'} Claire`
      const address =
        input.street && input.city && input.state && input.zip
          ? { street: input.street, city: input.city, state: input.state, zip: input.zip }
          : undefined

      const { estimate, noteAttachError } = await createEstimateForLead({
        customerId: hcpCustomer.id,
        privateNotes,
        description,
        tags,
        address,
        businessUnitUuid: businessUnitUuidForService(input.service_key),
        // Lead source on the estimate makes Claire's leads appear in HCP's
        // Inbox card with the same UX as Google's "Reserve with Google"
        // integration — option.notes show as "Additional notes" on the
        // card. "Website" is HCP's whitelisted preset value. If Tyler
        // adds a custom "Claire AI" lead source in HCP settings, we can
        // switch to that.
        leadSource: 'Website',
      })
      if (typeof estimate?.id === 'string') hcpEstimateId = estimate.id
      if (noteAttachError) hcpError = `Estimate created but note attach failed: ${noteAttachError}`

      // Also drop a Job Inbox entry so the office reliably sees Claire's
      // leads in the Inbox UI alongside web-form leads. The estimate
      // already carries rich notes via lead_source + option.notes;
      // the /leads POST is the belt-and-suspenders inbox visibility.
      try {
        const inbox = await createInboxLeadForEstimate({
          customerId: hcpCustomer.id,
          tags,
          address,
        })
        if (typeof inbox?.id === 'string') hcpInboxLeadId = inbox.id
      } catch (e) {
        console.error('[agent-tools] inbox lead failed (non-fatal):', e)
      }
    } catch (e) {
      hcpError = e instanceof Error ? e.message : String(e)
    }
  }

  if (storedLeadId && hcpCustomer) {
    try {
      await attachHcpEstimate(storedLeadId, {
        hcpCustomerId: hcpCustomer.id,
        hcpEstimateId,
        hcpCustomerExisting,
        hcpMatchVia: hcpMatchedBy,
        hcpError,
      })
      if (hcpInboxLeadId) {
        await attachHcpLeadId(storedLeadId, hcpInboxLeadId)
      }
    } catch (e) {
      console.error('[agent-tools] attachHcpEstimate failed (non-fatal):', e)
    }
  }

  if (storedLeadId) {
    try {
      await attachLeadToConversation(ctx.conversationId, storedLeadId, hcpCustomer?.id || null)
    } catch (e) {
      console.error('[agent-tools] attachLeadToConversation failed (non-fatal):', e)
    }
  }

  return {
    ok: true,
    lead_id: storedLeadId,
    hcp_customer_id: hcpCustomer?.id || null,
    hcp_estimate_id: hcpEstimateId || null,
    hcp_inbox_lead_id: hcpInboxLeadId || null,
    hcp_customer_existing: hcpCustomerExisting,
    hcp_match_via: hcpMatchedBy,
    hcp_error: hcpError || null,
    message: hcpError
      ? 'Lead saved on our side but Housecall Pro had an issue; the office will follow up.'
      : 'Lead is in. The office will reach out within one business day.',
  }
}

function buildAgentEstimateNotes(
  input: LeadInput,
  ctx: AgentToolContext,
  customerExisting: boolean,
  matchedBy: 'phone' | 'email' | 'name' | null,
): string {
  const lines: string[] = []
  lines.push('====================================================================')
  lines.push(`  TZ AI AGENT (${ctx.channel.toUpperCase()}) — Full lead details below.`)
  lines.push('====================================================================')
  lines.push('')
  lines.push(`Conversation id: ${ctx.conversationId}`)
  lines.push(
    customerExisting
      ? `[EXISTING CUSTOMER]${matchedBy ? ` matched by ${matchedBy}` : ''}`
      : '[NEW CUSTOMER]',
  )
  lines.push('')
  lines.push(`Service: ${input.service_label} (${input.service_key})`)
  lines.push('')
  lines.push('--- Qualification ---')
  if (input.qualification) {
    for (const [k, v] of Object.entries(input.qualification)) {
      if (typeof v === 'string' && v.trim()) lines.push(`${k}: ${v}`)
    }
  }
  if (input.customer_notes) {
    lines.push('')
    lines.push('--- Customer notes ---')
    lines.push(input.customer_notes)
  }
  lines.push('')
  lines.push('--- Property ---')
  lines.push(`Ownership: ${input.ownership}`)
  if (input.ownership === 'renter') {
    lines.push(`Landlord: ${input.landlord_name || ''}`)
    lines.push(`Landlord phone: ${input.landlord_phone || ''}`)
    lines.push(`Landlord email: ${input.landlord_email || ''}`)
    lines.push(`Permission given: ${input.landlord_permission ? 'yes' : 'no'}`)
    lines.push('')
    lines.push('ACTION REQUIRED: Verify with landlord before booking.')
  }
  if (input.referral_source) {
    lines.push('')
    lines.push(`Heard via: ${input.referral_source}`)
  }
  return lines.join('\n')
}

function lookupBusinessHoursImpl() {
  const now = new Date()
  const day = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/New_York' })
  const hour = Number.parseInt(
    now.toLocaleString('en-US', { hour: '2-digit', hour12: false, timeZone: 'America/New_York' }),
    10,
  )
  const isWeekday = !['Saturday', 'Sunday'].includes(day)
  const officeOpen = isWeekday && hour >= 7 && hour < 17
  return {
    now_local: now.toLocaleString('en-US', { timeZone: 'America/New_York' }),
    day,
    hour_local: hour,
    office_open: officeOpen,
    saturday_emergencies_only: day === 'Saturday',
    sunday_closed: day === 'Sunday',
    standard_hours: 'Mon-Fri 7am to 5pm. Saturday is emergency dispatch only. Sunday closed.',
  }
}
