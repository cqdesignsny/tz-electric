/**
 * After-hours emergency dispatch — opens a tz_emergency_dispatches row,
 * fires the initial T+0 notifications via Twilio, and schedules the
 * next cascade tick. The cron worker at /api/cron/dispatch-escalation
 * picks up from there.
 *
 * SOP: TZ_Electric_After_Hours_SOP.md (2026-05-18).
 *
 * Windows:
 *   - Overnight (10 PM – 5 AM):   one text to tech + one text to supervisor, done.
 *   - Standard (4 PM – 10 PM,
 *               5 AM – 7:30 AM):  text + call tech at T+0, T+15, T+30 (add supervisor),
 *                                  T+60 (final), then customer "team tied up" callback.
 */

import { db } from './db'
import { getOnCall, getSupervisorChain, type OnCallPerson } from './on-call'
import { sendSms, placeCall, normalizePhoneE164, type TwilioOutboundResult } from './twilio-outbound'
import type { AgentToolContext } from './agent-tools'

type DispatchInput = {
  issueDescription: string
  customerPhone: string
  customerName: string | null
  customerAddress: string | null
  safetyFlags: string[]
  customerAcknowledgedFees: boolean
}

export type DispatchResult =
  | {
      ok: true
      dispatchId: string
      window: 'standard_after_hours' | 'overnight'
      onCallTech: { name: string; matched: boolean }
      attemptsFired: number
      message: string
    }
  | { ok: false; error: string }

/**
 * Decide which after-hours window we're in based on local NY time.
 * Mirrors lookupBusinessHoursImpl logic for consistency.
 */
function classifyWindow(at: Date = new Date()): 'business_hours' | 'standard_after_hours' | 'overnight' {
  const day = at.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/New_York' })
  const parts = at.toLocaleString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const [hh, mm] = parts.split(':').map((s) => Number.parseInt(s, 10))
  const minutes = hh * 60 + mm
  const isWeekday = !['Saturday', 'Sunday'].includes(day)
  const OPEN_AT = 7 * 60 + 30
  const CLOSE_AT = 16 * 60
  if (isWeekday && minutes >= OPEN_AT && minutes < CLOSE_AT) return 'business_hours'
  const isOvernight = minutes >= 22 * 60 || minutes < 5 * 60
  return isOvernight ? 'overnight' : 'standard_after_hours'
}

function buildTechMessage(input: DispatchInput, dispatchId: string): string {
  const lines = [
    'TZ Emergency Dispatch',
    `Customer: ${input.customerName || 'Unknown name'}`,
    `Phone: ${input.customerPhone}`,
  ]
  if (input.customerAddress) lines.push(`Address: ${input.customerAddress}`)
  lines.push(`Issue: ${input.issueDescription}`)
  if (input.safetyFlags.length > 0) {
    lines.push(`Flags: ${input.safetyFlags.join(', ')}`)
  }
  lines.push(`Ref: ${dispatchId.slice(0, 8)}`)
  return lines.join('\n')
}

function buildTechVoiceMessage(input: DispatchInput): string {
  const name = input.customerName ? `from ${input.customerName}` : ''
  const where = input.customerAddress ? `at ${input.customerAddress}` : ''
  const phoneSpoken = input.customerPhone.replace(/\D/g, '').split('').join(' ')
  return [
    `TZ Electric emergency dispatch ${name} ${where}.`,
    `Issue: ${input.issueDescription}.`,
    `Please call the customer back at ${phoneSpoken}.`,
    'Check your text messages for the full details.',
  ].join(' ')
}

async function recordAttempt(opts: {
  dispatchId: string
  attemptNo: number
  targetRole: 'tech' | 'supervisor' | 'customer'
  targetName: string | null
  targetPhone: string
  channel: 'sms' | 'voice'
  result: TwilioOutboundResult
}) {
  const sql = db()
  const status = opts.result.ok ? 'sent' : 'failed'
  const sid = opts.result.ok ? opts.result.sid : null
  const error = opts.result.ok ? null : opts.result.error

  // ON CONFLICT for idempotency: if the cron retries the same tick we
  // don't double-fire. The unique index is (dispatch, attempt, role, channel).
  await sql`
    INSERT INTO tz_dispatch_attempts (
      dispatch_id, attempt_no, target_role, target_name, target_phone,
      channel, status, twilio_sid, error
    ) VALUES (
      ${opts.dispatchId}, ${opts.attemptNo}, ${opts.targetRole}, ${opts.targetName},
      ${normalizePhoneE164(opts.targetPhone)}, ${opts.channel}, ${status}, ${sid}, ${error}
    )
    ON CONFLICT (dispatch_id, attempt_no, target_role, channel) DO NOTHING
  `
}

export async function dispatchAfterHoursEmergencyImpl(
  input: DispatchInput,
  ctx: AgentToolContext,
): Promise<DispatchResult> {
  const now = new Date()
  const window = classifyWindow(now)

  if (window === 'business_hours') {
    return {
      ok: false,
      error:
        'Office is currently open. Use create_lead_with_estimate or flag_for_office_review during business hours, not after-hours dispatch.',
    }
  }

  if (!input.customerAcknowledgedFees) {
    return {
      ok: false,
      error:
        'Customer has not acknowledged the after-hours dispatch fee. Ask them to confirm before dispatching.',
    }
  }

  // Look up who to page.
  const onCallTech = await getOnCall('tech', now)
  const supervisors = await getSupervisorChain()
  const primarySupervisor = supervisors[0] ?? null

  if (!onCallTech && !primarySupervisor) {
    return {
      ok: false,
      error:
        'No on-call tech or supervisor configured. Cannot dispatch. Fall back to flag_for_office_review with priority=high.',
    }
  }

  const sql = db()

  // Open the dispatch row. next_attempt_at depends on the window.
  // Overnight = no follow-up. Standard = T+15 minutes from now.
  const nextAttemptAt =
    window === 'overnight' ? null : new Date(now.getTime() + 15 * 60 * 1000)
  const dispatchRows = (await sql`
    INSERT INTO tz_emergency_dispatches (
      conversation_id, customer_name, customer_phone, customer_address,
      issue_description, safety_flags, window, status,
      next_attempt_at, next_attempt_no
    ) VALUES (
      ${ctx.conversationId}, ${input.customerName}, ${input.customerPhone},
      ${input.customerAddress}, ${input.issueDescription}, ${input.safetyFlags as string[]},
      ${window}, 'open',
      ${nextAttemptAt ? nextAttemptAt.toISOString() : null},
      ${window === 'overnight' ? 99 : 1}
    )
    RETURNING id
  `) as unknown as { id: string }[]
  const dispatchId = dispatchRows[0].id

  const techMessage = buildTechMessage(input, dispatchId)
  const techVoice = buildTechVoiceMessage(input)
  let attemptsFired = 0

  if (window === 'overnight') {
    // One text to tech. One text to supervisor. Done.
    if (onCallTech) {
      const r = await sendSms({ to: onCallTech.phone, body: techMessage })
      await recordAttempt({
        dispatchId,
        attemptNo: 0,
        targetRole: 'tech',
        targetName: onCallTech.personName,
        targetPhone: onCallTech.phone,
        channel: 'sms',
        result: r,
      })
      if (r.ok) attemptsFired++
    }
    if (primarySupervisor) {
      const r = await sendSms({ to: primarySupervisor.phone, body: techMessage })
      await recordAttempt({
        dispatchId,
        attemptNo: 0,
        targetRole: 'supervisor',
        targetName: primarySupervisor.personName,
        targetPhone: primarySupervisor.phone,
        channel: 'sms',
        result: r,
      })
      if (r.ok) attemptsFired++
    }
  } else {
    // Standard cascade T+0: text + call on-call tech.
    if (onCallTech) {
      const smsRes = await sendSms({ to: onCallTech.phone, body: techMessage })
      await recordAttempt({
        dispatchId,
        attemptNo: 0,
        targetRole: 'tech',
        targetName: onCallTech.personName,
        targetPhone: onCallTech.phone,
        channel: 'sms',
        result: smsRes,
      })
      if (smsRes.ok) attemptsFired++

      const callRes = await placeCall({
        to: onCallTech.phone,
        message: techVoice,
      })
      await recordAttempt({
        dispatchId,
        attemptNo: 0,
        targetRole: 'tech',
        targetName: onCallTech.personName,
        targetPhone: onCallTech.phone,
        channel: 'voice',
        result: callRes,
      })
      if (callRes.ok) attemptsFired++
    }
  }

  // Build the customer-facing confirmation message Claire reads back.
  const customerMessage =
    window === 'overnight'
      ? `Got it. I've alerted our on-call team and the supervisor. Given the time of night, response is not guaranteed tonight. Our team will follow up as soon as possible, potentially between 5 AM and 7:30 AM depending on when they see the message, and guaranteed during normal business hours of 7:30 AM to 4:00 PM.`
      : `Got it. I've alerted ${
          onCallTech ? onCallTech.personName.split(' ')[0] : 'the on-call team'
        }. They should be calling you back within the next 10 to 15 minutes. If you don't hear from us in that window, I'll automatically escalate to our supervisor. Keep your phone close.`

  return {
    ok: true,
    dispatchId,
    window,
    onCallTech: {
      name: onCallTech?.personName || 'unassigned',
      matched: Boolean(onCallTech),
    },
    attemptsFired,
    message: customerMessage,
  }
}

/**
 * Cron-driven escalation tick. Walks open dispatches whose
 * next_attempt_at is due and fires the next step.
 *
 * Step ladder (standard after-hours only — overnight does nothing here):
 *   attempt_no = 1 (T+15): text + call tech again
 *   attempt_no = 2 (T+30): text + call tech, AND text + call supervisor
 *   attempt_no = 3 (T+60): final text + call to both
 *   attempt_no = 4 (T+60+): "team tied up" callback to customer
 *                            and close the dispatch
 */
export async function runEscalationTick(): Promise<{
  processed: number
  fired: number
  errors: string[]
}> {
  const sql = db()
  const now = new Date()
  const errors: string[] = []
  let fired = 0

  const due = (await sql`
    SELECT
      id, conversation_id, customer_name, customer_phone, customer_address,
      issue_description, safety_flags, window, next_attempt_no, opened_at,
      customer_callback_sent_at
    FROM tz_emergency_dispatches
    WHERE status = 'open'
      AND window = 'standard_after_hours'
      AND next_attempt_at IS NOT NULL
      AND next_attempt_at <= ${now.toISOString()}
    ORDER BY next_attempt_at ASC
    LIMIT 25
  `) as unknown as Array<{
    id: string
    conversation_id: string | null
    customer_name: string | null
    customer_phone: string
    customer_address: string | null
    issue_description: string
    safety_flags: string[] | null
    window: 'standard_after_hours' | 'overnight'
    next_attempt_no: number
    opened_at: string
    customer_callback_sent_at: string | null
  }>

  for (const d of due) {
    try {
      const dispatchInput: DispatchInput = {
        issueDescription: d.issue_description,
        customerPhone: d.customer_phone,
        customerName: d.customer_name,
        customerAddress: d.customer_address,
        safetyFlags: d.safety_flags ?? [],
        customerAcknowledgedFees: true, // already validated at open time
      }
      const techMessage = buildTechMessage(dispatchInput, d.id)
      const techVoice = buildTechVoiceMessage(dispatchInput)

      const onCallTech = await getOnCall('tech', now)
      const supervisors = await getSupervisorChain()
      const supervisor = supervisors[0] ?? null

      const attemptNo = d.next_attempt_no

      if (attemptNo === 1) {
        // T+15: text + call tech again
        if (onCallTech) {
          await fireAttempt({
            dispatchId: d.id,
            attemptNo,
            target: onCallTech,
            role: 'tech',
            smsBody: techMessage,
            voiceMessage: techVoice,
          })
        }
        await sql`
          UPDATE tz_emergency_dispatches
          SET next_attempt_at = ${new Date(now.getTime() + 15 * 60 * 1000).toISOString()},
              next_attempt_no = 2,
              updated_at = NOW()
          WHERE id = ${d.id}
        `
      } else if (attemptNo === 2) {
        // T+30: text + call tech, AND text + call supervisor
        if (onCallTech) {
          await fireAttempt({
            dispatchId: d.id,
            attemptNo,
            target: onCallTech,
            role: 'tech',
            smsBody: techMessage,
            voiceMessage: techVoice,
          })
        }
        if (supervisor) {
          await fireAttempt({
            dispatchId: d.id,
            attemptNo,
            target: supervisor,
            role: 'supervisor',
            smsBody: techMessage,
            voiceMessage: techVoice,
          })
        }
        await sql`
          UPDATE tz_emergency_dispatches
          SET next_attempt_at = ${new Date(now.getTime() + 30 * 60 * 1000).toISOString()},
              next_attempt_no = 3,
              updated_at = NOW()
          WHERE id = ${d.id}
        `
      } else if (attemptNo === 3) {
        // T+60: final attempt on both
        if (onCallTech) {
          await fireAttempt({
            dispatchId: d.id,
            attemptNo,
            target: onCallTech,
            role: 'tech',
            smsBody: techMessage,
            voiceMessage: techVoice,
          })
        }
        if (supervisor) {
          await fireAttempt({
            dispatchId: d.id,
            attemptNo,
            target: supervisor,
            role: 'supervisor',
            smsBody: techMessage,
            voiceMessage: techVoice,
          })
        }
        // Set the customer callback to fire 5 minutes after final tech attempt
        await sql`
          UPDATE tz_emergency_dispatches
          SET next_attempt_at = ${new Date(now.getTime() + 5 * 60 * 1000).toISOString()},
              next_attempt_no = 4,
              updated_at = NOW()
          WHERE id = ${d.id}
        `
      } else if (attemptNo === 4) {
        // Customer "team tied up" callback.
        if (!d.customer_callback_sent_at) {
          const teamTiedUp =
            'This is TZ Electric. Our emergency team is currently tied up on other emergency calls at the moment. We will get back to you as soon as we possibly can. Thank you for your patience.'
          const cb = await placeCall({ to: d.customer_phone, message: teamTiedUp })
          await recordAttempt({
            dispatchId: d.id,
            attemptNo,
            targetRole: 'customer',
            targetName: d.customer_name,
            targetPhone: d.customer_phone,
            channel: 'voice',
            result: cb,
          })
        }
        await sql`
          UPDATE tz_emergency_dispatches
          SET status = 'closed_no_response',
              next_attempt_at = NULL,
              customer_callback_sent_at = NOW(),
              resolved_at = NOW(),
              resolution_notes = 'No tech or supervisor response after T+60. Customer notified.',
              updated_at = NOW()
          WHERE id = ${d.id}
        `
      }

      fired++
    } catch (e) {
      errors.push(`dispatch ${d.id}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return { processed: due.length, fired, errors }
}

async function fireAttempt(opts: {
  dispatchId: string
  attemptNo: number
  target: OnCallPerson
  role: 'tech' | 'supervisor'
  smsBody: string
  voiceMessage: string
}) {
  const smsRes = await sendSms({ to: opts.target.phone, body: opts.smsBody })
  await recordAttempt({
    dispatchId: opts.dispatchId,
    attemptNo: opts.attemptNo,
    targetRole: opts.role,
    targetName: opts.target.personName,
    targetPhone: opts.target.phone,
    channel: 'sms',
    result: smsRes,
  })

  const callRes = await placeCall({ to: opts.target.phone, message: opts.voiceMessage })
  await recordAttempt({
    dispatchId: opts.dispatchId,
    attemptNo: opts.attemptNo,
    targetRole: opts.role,
    targetName: opts.target.personName,
    targetPhone: opts.target.phone,
    channel: 'voice',
    result: callRes,
  })
}
