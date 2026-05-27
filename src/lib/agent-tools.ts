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
import {
  sendClaireLeadCapturedEmail,
  sendEmergencyEscalationEmail,
  sendOfficeFlagEmail,
} from './agent-notifications'
import { classifyWindow, dispatchAfterHoursEmergencyImpl } from './after-hours-dispatch'

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

        // Send an immediate office email so the team sees the flag
        // within minutes instead of whenever they next check the
        // Switchboard. Pulls customer context from the conversation
        // row Claire wrote earlier via update_visitor_contact.
        try {
          const sql = db()
          type ConvRow = {
            customer_name: string | null
            customer_phone: string | null
            customer_email: string | null
            attribution_channel: string | null
          }
          const [conv] = (await sql`
            SELECT customer_name, customer_phone, customer_email, attribution_channel
            FROM tz_agent_conversations
            WHERE id = ${ctx.conversationId}
          `) as unknown as ConvRow[]
          await sendOfficeFlagEmail({
            conversationId: ctx.conversationId,
            channel: ctx.channel,
            reason,
            priority,
            customerName: conv?.customer_name ?? null,
            customerPhone: conv?.customer_phone ?? null,
            customerEmail: conv?.customer_email ?? null,
            attributionChannel: conv?.attribution_channel ?? null,
          })
        } catch (e) {
          console.error('[agent-tools] flag_for_office_review email failed (non-fatal):', e)
        }

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
        "Page the office for a genuine emergency. Use ONLY for active leak causing damage, no heat below 32°F, smoke/sparks/burning smell, electrical hazard with shock risk, gas smell, sewage backup with health risk, medical-equipment dependency loss. Always include the customer's phone. PREFER calling lookup_business_hours first and routing to dispatch_after_hours_emergency when the office is closed — but if you call this tool after-hours by mistake, it will still safely auto-trigger the dispatch cascade as a fallback (defense-in-depth, added 2026-05-27 PM).",
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

        // Always send the office email — that's the business-hours path.
        try {
          const sql = db()
          type ConvRow = {
            customer_name: string | null
            attribution_channel: string | null
          }
          const [conv] = (await sql`
            SELECT customer_name, attribution_channel
            FROM tz_agent_conversations
            WHERE id = ${ctx.conversationId}
          `) as unknown as ConvRow[]
          await sendEmergencyEscalationEmail({
            conversationId: ctx.conversationId,
            channel: ctx.channel,
            reason,
            customerName: customer_name || conv?.customer_name || null,
            customerPhone: customer_phone,
            address: address || null,
            attributionChannel: conv?.attribution_channel ?? null,
          })
        } catch (e) {
          console.error('[agent-tools] escalate_emergency email failed (non-fatal):', e)
        }

        // SAFETY NET (added 2026-05-27 PM): If this is fired outside
        // business hours, the office isn't watching email — we need the
        // actual on-call Twilio cascade. Auto-trigger dispatchAfter-
        // HoursEmergencyImpl so the on-call tech gets paged + the T+15/
        // T+30/T+60/T+65 ladder kicks off regardless of which emergency
        // tool Claire picked. Customer-acknowledged-fees is forced true
        // here because a life-safety emergency overrides the fee gate —
        // the tech sorts pricing on site. Documented choice.
        const window = classifyWindow()
        let afterHoursDispatch: Awaited<ReturnType<typeof dispatchAfterHoursEmergencyImpl>> | null = null
        if (window !== 'business_hours') {
          try {
            afterHoursDispatch = await dispatchAfterHoursEmergencyImpl(
              {
                issueDescription: reason,
                customerPhone: customer_phone,
                customerName: customer_name ?? null,
                customerAddress: address ?? null,
                safetyFlags: [],
                customerAcknowledgedFees: true, // safety net: emergency bypasses fee gate
              },
              ctx,
            )
            console.log(
              `[agent-tools] escalate_emergency after-hours safety net fired dispatch: ${JSON.stringify(afterHoursDispatch)}`,
            )
          } catch (e) {
            console.error(
              '[agent-tools] escalate_emergency after-hours auto-dispatch failed (non-fatal — email still fired):',
              e,
            )
          }
        }

        const baseMessage =
          'The office has been alerted and will reach out as fast as possible. Keep your phone close, someone will call you back within minutes.'

        return {
          escalated: true,
          reason,
          window,
          after_hours_dispatch: afterHoursDispatch ?? null,
          message:
            afterHoursDispatch && 'ok' in afterHoursDispatch && afterHoursDispatch.ok
              ? `${baseMessage} I've also paged our on-call team directly so they get this on their phone right now.`
              : baseMessage,
        }
      },
    }),

    dispatch_after_hours_emergency: tool({
      description:
        "Open an after-hours emergency dispatch and start the technician escalation cascade per Tyler's 2026-05-18 SOP. Time-of-day aware: overnight (10 PM – 5 AM) sends ONE text each to the on-call tech and supervisor with no calls and no follow-ups; standard after-hours (4 PM – 10 PM, 5 AM – 7:30 AM) fires the full T+0 / T+15 / T+30 (add supervisor) / T+60 cascade. Use ONLY when (1) it is after-hours per lookup_business_hours AND (2) the issue is a genuine emergency. Never call this during business hours — use create_lead_with_estimate or flag_for_office_review instead. Never read the technician's phone number to the customer; the dispatch handles privacy via call bridge.",
      inputSchema: z.object({
        issue_description: z
          .string()
          .describe(
            'What the customer is reporting. Include the safety signal (e.g. "Active leak in basement, water pooling", "No heat, outside is 24°F, baby in the home", "Sparking outlet in kitchen").',
          ),
        customer_phone: z
          .string()
          .describe('Customer callback number. On voice, this is from caller ID.'),
        customer_name: z.string().optional(),
        customer_address: z.string().optional(),
        safety_flags: z
          .array(
            z.enum([
              'active_leak',
              'no_heat',
              'smoke_sparks',
              'gas_smell',
              'electrical_hazard',
              'sewage_backup',
              'medical_equipment_loss',
              'total_power_loss',
            ]),
          )
          .optional()
          .describe('Tag the specific emergency type(s) for routing.'),
        customer_acknowledged_fees: z
          .boolean()
          .describe(
            'Has the customer been told about and approved the after-hours emergency dispatch fee ($475 + on-site work)?',
          ),
      }),
      execute: async (input) =>
        dispatchAfterHoursEmergencyImpl(
          {
            issueDescription: input.issue_description,
            customerPhone: input.customer_phone,
            customerName: input.customer_name ?? null,
            customerAddress: input.customer_address ?? null,
            safetyFlags: input.safety_flags ?? [],
            customerAcknowledgedFees: input.customer_acknowledged_fees,
          },
          ctx,
        ),
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
        // "CSR AI" is HCP's locked preset for AI agent-sourced leads.
        // The estimate appears in the Inbox as "Estimate for X" with
        // the CSR AI badge and option.notes rendered as "Additional
        // notes". Distinguishes Claire-sourced leads from web-form
        // leads (which use "Lead Form") so Tyler can filter by source.
        leadSource: 'CSR AI',
      })
      if (typeof estimate?.id === 'string') hcpEstimateId = estimate.id
      if (noteAttachError) hcpError = `Estimate created but note attach failed: ${noteAttachError}`

      // Restore the /leads POST so the office gets the inbox-card
      // notification path they actually monitor. Reverting last night's
      // single-record change after Tyler reported the David Maros
      // conversation never surfaced (2026-05-08). Belt-and-suspenders:
      // the estimate carries the rich notes via lead_source preset, the
      // /leads POST guarantees the inbox notification.
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

  // Fire an immediate office email so the team sees Claire-booked leads
  // in their inbox the way they always have for web-form leads. Pulls
  // attribution channel from the conversation row Claire wrote earlier.
  if (hcpCustomer) {
    try {
      const sql = db()
      type ConvRow = { attribution_channel: string | null }
      const [conv] = (await sql`
        SELECT attribution_channel
        FROM tz_agent_conversations
        WHERE id = ${ctx.conversationId}
      `) as unknown as ConvRow[]
      const fullAddress =
        input.street && input.city && input.state
          ? `${input.street}, ${input.city}, ${input.state}${input.zip ? ' ' + input.zip : ''}`
          : null
      await sendClaireLeadCapturedEmail({
        conversationId: ctx.conversationId,
        channel: ctx.channel,
        customerName: `${input.first_name} ${input.last_name}`.trim() || null,
        customerPhone: input.phone || null,
        customerEmail: input.email || null,
        serviceLabel: input.service_label,
        urgency: cleanQualification.urgency || null,
        scope: cleanQualification.scope || null,
        address: fullAddress,
        hcpEstimateId: hcpEstimateId || null,
        hcpCustomerId: hcpCustomer.id,
        hcpError: hcpError || null,
        attributionChannel: conv?.attribution_channel ?? null,
      })
    } catch (e) {
      console.error('[agent-tools] lead-captured email failed (non-fatal):', e)
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
  const parts = now.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const [hh, mm] = parts.split(':').map((s) => Number.parseInt(s, 10))
  const minutesIntoDay = hh * 60 + mm
  const OPEN_AT = 7 * 60 + 30 // 07:30 = 450
  const CLOSE_AT = 16 * 60 // 16:00 = 960
  const isWeekday = !['Saturday', 'Sunday'].includes(day)
  const officeOpen = isWeekday && minutesIntoDay >= OPEN_AT && minutesIntoDay < CLOSE_AT

  // After-hours window classification per the SOP (revision 2026-05-18):
  //   Overnight: 22:00 – 05:00 (single text each, no follow-ups)
  //   Standard after-hours: 04:00 PM – 10:00 PM, and 05:00 AM – 07:30 AM
  const isOvernight = minutesIntoDay >= 22 * 60 || minutesIntoDay < 5 * 60
  const afterHoursWindow = officeOpen
    ? 'business_hours'
    : isOvernight
      ? 'overnight'
      : 'standard_after_hours'

  return {
    now_local: now.toLocaleString('en-US', { timeZone: 'America/New_York' }),
    day,
    hour_local: hh,
    minute_local: mm,
    office_open: officeOpen,
    after_hours_window: afterHoursWindow,
    saturday_emergencies_only: day === 'Saturday',
    sunday_closed: day === 'Sunday',
    standard_hours: 'Mon-Fri 7:30 AM to 4:00 PM. Saturday is emergency dispatch only. Sunday is closed except for emergencies.',
  }
}
