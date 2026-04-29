import { NextRequest, NextResponse } from 'next/server'
import {
  createCustomerForLead,
  createEstimateForLead,
  createInboxLeadForEstimate,
  findExistingCustomer,
  type HCPCustomer,
} from '@/lib/housecall-pro'
import { renderLeadFormSubmissionEmail } from '@/lib/email-templates'
import { attachHcpEstimate, attachHcpLeadId, insertLead } from '@/lib/leads-store'
import { deriveChannel, leadValueCents } from '@/lib/attribution'
import {
  findService,
  getQuestionLabel,
  isQuestionVisible,
  type ServiceConfig,
} from '@/components/forms/lead-form-config'

export const runtime = 'nodejs'

type SubmitBody = {
  serviceKey: string
  serviceLabel: string
  qualification: Record<string, string>
  firstName: string
  lastName: string
  email?: string
  phone: string
  street?: string
  city?: string
  state?: string
  zip?: string
  ownership: 'homeowner' | 'renter'
  landlordName?: string
  landlordPhone?: string
  landlordEmail?: string
  landlordPermission?: boolean
  referralSource?: string
  customerNotes?: string
  tracking?: {
    gclid?: string
    gbraid?: string
    wbraid?: string
    fbclid?: string
    msclkid?: string
    ttclid?: string
    liFatId?: string
    lsaId?: string
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmTerm?: string
    utmContent?: string
    referrer?: string
    landingPage?: string
    landingAt?: string
    firstTouch?: Record<string, string | undefined>
  }
}

function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function shorten(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

/**
 * Filter the qualification map to only the questions that are actually
 * visible given the current answers. The form prunes hidden answers
 * client-side already, but this is defense-in-depth so an SMS / voice
 * agent (which doesn't have the same client UI) can submit with stale
 * answers and we'll still record only what's relevant.
 */
function visibleQualification(
  service: ServiceConfig | undefined,
  answers: Record<string, string>,
): Record<string, string> {
  if (!service) return answers
  const out: Record<string, string> = {}
  for (const q of service.questions) {
    if (!isQuestionVisible(q, answers)) continue
    const v = answers[q.id]
    if (isNonEmpty(v)) out[q.id] = v
  }
  return out
}

function buildEstimatePrivateNotes(
  body: SubmitBody,
  service: ServiceConfig | undefined,
  qualification: Record<string, string>,
  customerExisting: boolean,
): string {
  const lines: string[] = []

  lines.push('====================================================================')
  lines.push('  WEBSITE LEAD — Full details below.')
  lines.push('====================================================================')
  lines.push('')

  const flags: string[] = []
  flags.push('[Web Form]')
  flags.push(customerExisting ? '[EXISTING CUSTOMER]' : '[NEW CUSTOMER]')
  if (body.ownership === 'renter') flags.push('[RENTER - LANDLORD VERIFICATION NEEDED]')
  if (qualification.urgentNow === 'Yes — active leak') flags.push('[ACTIVE LEAK]')
  if (qualification.medical === 'Yes') flags.push('[MEDICAL EQUIPMENT IN HOME]')
  lines.push(flags.join(' '))
  lines.push('')

  lines.push(`Service: ${body.serviceLabel} (${body.serviceKey})`)
  lines.push('')

  lines.push('--- Qualification ---')
  Object.entries(qualification).forEach(([k, v]) => {
    if (!isNonEmpty(v)) return
    const label = service ? getQuestionLabel(service, k) : k
    lines.push(`${label}: ${v}`)
  })
  if (body.customerNotes && isNonEmpty(body.customerNotes)) {
    lines.push('')
    lines.push('--- Customer notes ---')
    lines.push(body.customerNotes)
  }
  lines.push('')

  lines.push('--- Property ---')
  lines.push(`Ownership: ${body.ownership}`)
  if (body.ownership === 'renter') {
    lines.push(`Landlord: ${body.landlordName || ''}`)
    lines.push(`Landlord phone: ${body.landlordPhone || ''}`)
    lines.push(`Landlord email: ${body.landlordEmail || ''}`)
    lines.push(`Permission given: ${body.landlordPermission ? 'yes' : 'no'}`)
    lines.push('')
    lines.push('ACTION REQUIRED: Verify with landlord before booking.')
  }
  lines.push('')

  lines.push('--- Attribution (last touch) ---')
  const t = body.tracking
  if (t?.gclid) lines.push(`GCLID: ${t.gclid}`)
  if (t?.gbraid) lines.push(`GBRAID: ${t.gbraid}`)
  if (t?.wbraid) lines.push(`WBRAID: ${t.wbraid}`)
  if (t?.fbclid) lines.push(`FBCLID: ${t.fbclid}`)
  if (t?.msclkid) lines.push(`MSCLKID: ${t.msclkid}`)
  if (t?.ttclid) lines.push(`TTCLID: ${t.ttclid}`)
  if (t?.liFatId) lines.push(`LinkedIn FAT ID: ${t.liFatId}`)
  if (t?.lsaId) lines.push(`LSA ID: ${t.lsaId}`)
  if (t?.utmSource) lines.push(`UTM source: ${t.utmSource}`)
  if (t?.utmMedium) lines.push(`UTM medium: ${t.utmMedium}`)
  if (t?.utmCampaign) lines.push(`UTM campaign: ${t.utmCampaign}`)
  if (t?.utmTerm) lines.push(`UTM term: ${t.utmTerm}`)
  if (t?.utmContent) lines.push(`UTM content: ${t.utmContent}`)
  if (t?.referrer) lines.push(`Referrer: ${t.referrer}`)
  if (t?.landingPage) lines.push(`Landing page: ${t.landingPage}`)
  if (t?.landingAt) lines.push(`Landing at: ${t.landingAt}`)
  const ft = t?.firstTouch
  if (ft && Object.values(ft).some(Boolean)) {
    lines.push('')
    lines.push('--- Attribution (first touch) ---')
    if (ft.gclid) lines.push(`First-touch GCLID: ${ft.gclid}`)
    if (ft.fbclid) lines.push(`First-touch FBCLID: ${ft.fbclid}`)
    if (ft.utmSource) lines.push(`First-touch UTM source: ${ft.utmSource}`)
    if (ft.utmMedium) lines.push(`First-touch UTM medium: ${ft.utmMedium}`)
    if (ft.utmCampaign) lines.push(`First-touch UTM campaign: ${ft.utmCampaign}`)
    if (ft.referrer) lines.push(`First-touch referrer: ${ft.referrer}`)
    if (ft.landingPage) lines.push(`First-touch landing page: ${ft.landingPage}`)
    if (ft.landingAt) lines.push(`First-touch landing at: ${ft.landingAt}`)
  }
  if (body.referralSource) {
    lines.push('')
    lines.push(`Heard via (self-reported): ${body.referralSource}`)
  }
  return lines.join('\n')
}

function buildEstimateTags(
  body: SubmitBody,
  qualification: Record<string, string>,
  customerExisting: boolean,
  channel: string,
): string[] {
  const tags: string[] = ['Web Form']
  tags.push(`Channel: ${channel}`)
  tags.push(`Service: ${body.serviceLabel}`)

  const urgency = qualification.urgency
  if (isNonEmpty(urgency)) tags.push(`Urgency: ${shorten(urgency, 40)}`)

  const scope =
    qualification.scope || qualification.scopeCooling || qualification.scopeHeating
  if (isNonEmpty(scope)) tags.push(shorten(scope, 50))

  if (customerExisting) tags.push('Existing customer')
  if (body.ownership === 'renter') tags.push('Renter - Verify with Landlord')
  if (qualification.medical === 'Yes') tags.push('Medical Equipment in Home')
  if (qualification.urgentNow === 'Yes — active leak') tags.push('ACTIVE LEAK')

  return tags
}

export async function POST(req: NextRequest) {
  let body: SubmitBody
  try {
    body = (await req.json()) as SubmitBody
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  // Minimum required fields.
  if (
    !isNonEmpty(body.firstName) ||
    !isNonEmpty(body.lastName) ||
    !isNonEmpty(body.phone) ||
    !isNonEmpty(body.serviceKey) ||
    !isNonEmpty(body.serviceLabel) ||
    !body.ownership
  ) {
    return NextResponse.json(
      { ok: false, error: 'Missing required fields' },
      { status: 400 },
    )
  }

  if (body.ownership === 'renter') {
    if (
      !isNonEmpty(body.landlordName) ||
      !isNonEmpty(body.landlordPhone) ||
      !body.landlordPermission
    ) {
      return NextResponse.json(
        { ok: false, error: 'Renter inquiries require landlord name, phone, and permission' },
        { status: 400 },
      )
    }
  }

  const service = findService(body.serviceKey)
  const cleanQualification = visibleQualification(service, body.qualification || {})

  const firstName = body.firstName.trim()
  const lastName = body.lastName.trim()
  const email = isNonEmpty(body.email) ? body.email.trim() : undefined
  const phone = body.phone
  const street = isNonEmpty(body.street) ? body.street.trim() : undefined
  const city = isNonEmpty(body.city) ? body.city.trim() : undefined
  const state = isNonEmpty(body.state) ? body.state.trim() : 'NY'
  const zip = isNonEmpty(body.zip) ? body.zip.trim() : undefined

  // Derive single-label attribution channel and per-service lead value for
  // ROAS reporting + the conversion event on /thank-you.
  const channel = deriveChannel(body.tracking)
  const valueCents = leadValueCents(body.serviceKey)

  // Persist to our own DB first so we keep a record even if HCP rejects.
  // tz_leads is now the authoritative read source for the TZ Switchboard
  // Lead Pipeline — HCP linkage is filled in below once we have ids back.
  let storedLeadId: string | null = null
  try {
    storedLeadId = await insertLead({
      source: 'web_form',
      serviceKey: body.serviceKey,
      serviceLabel: body.serviceLabel,
      firstName,
      lastName,
      phone,
      email,
      street,
      city,
      state,
      zip,
      ownership: body.ownership,
      landlordName: body.landlordName,
      landlordPhone: body.landlordPhone,
      landlordEmail: body.landlordEmail,
      qualification: cleanQualification,
      customerNotes: body.customerNotes,
      referralSource: body.referralSource,
      tracking: (body.tracking as Record<string, unknown> | undefined) || null,
      attributionChannel: channel,
      attributionFirstTouch:
        (body.tracking?.firstTouch as Record<string, unknown> | undefined) || null,
      attributionReferrer: body.tracking?.referrer || null,
      attributionValueCents: valueCents,
    })
  } catch (e) {
    console.error('[lead-form] tz_leads insert failed (non-fatal):', e)
  }

  // HCP routing: find-or-create customer, then create an unscheduled
  // estimate with the lead details in private_notes. This replaces the
  // previous /leads-only flow per Tyler's 2026-04-28 routing change.
  // Match logic: any one of name / phone / email matches a record in HCP
  // and we treat them as existing; this catches returning customers who
  // mistyped a name or use a household-shared email.
  let hcpCustomer: HCPCustomer | null = null
  let hcpCustomerExisting = false
  let hcpMatchedBy: 'phone' | 'email' | 'name' | null = null
  let hcpEstimateId: string | undefined
  let hcpInboxLeadId: string | undefined
  let hcpError: string | undefined

  try {
    const match = await findExistingCustomer({
      firstName,
      lastName,
      phone,
      email,
    })
    if (match) {
      hcpCustomer = match.customer
      hcpCustomerExisting = true
      hcpMatchedBy = match.matchedBy
    } else {
      hcpCustomer = await createCustomerForLead({
        firstName,
        lastName,
        phone,
        email,
        street,
        city,
        state,
        zip,
      })
    }
  } catch (e) {
    hcpError = e instanceof Error ? e.message : String(e)
    console.error('[lead-form] HCP customer step failed:', hcpError)
  }

  if (hcpCustomer && !hcpError) {
    try {
      const privateNotes = buildEstimatePrivateNotes(
        body,
        service,
        cleanQualification,
        hcpCustomerExisting,
      )
      const tags = buildEstimateTags(body, cleanQualification, hcpCustomerExisting, channel)
      const description = `${body.serviceLabel} — Website lead`
      const address =
        street && city && state && zip
          ? { street, city, state, zip }
          : undefined

      // Surface how we matched the existing customer in private_notes so
      // the office can sanity-check the link (especially the name-only and
      // email-only cases which are weaker signals than a phone match).
      const notesWithMatch = hcpMatchedBy
        ? `${privateNotes}\n\nMatched existing customer by: ${hcpMatchedBy}`
        : privateNotes

      const { estimate, noteAttachError } = await createEstimateForLead({
        customerId: hcpCustomer.id,
        privateNotes: notesWithMatch,
        description,
        tags,
        address,
      })
      if (typeof estimate?.id === 'string') hcpEstimateId = estimate.id
      if (noteAttachError) {
        // Estimate exists in HCP, but office-internal notes never landed.
        // Surface the failure so the Switchboard row + office email show
        // it; office can re-add the note manually.
        hcpError = `Estimate created but office note failed to attach: ${noteAttachError}`
      }

      // Drop a Job Inbox entry so the office sees new leads at a glance
      // in HCP's "API Leads" channel. Attaches to the existing customer
      // via customer_id (no duplicate). Failure here is non-fatal — the
      // estimate already exists.
      try {
        const inbox = await createInboxLeadForEstimate({
          customerId: hcpCustomer.id,
          tags,
          address,
        })
        if (typeof inbox?.id === 'string') hcpInboxLeadId = inbox.id
      } catch (e) {
        console.error('[lead-form] HCP Job Inbox lead failed (non-fatal):', e)
      }
    } catch (e) {
      hcpError = e instanceof Error ? e.message : String(e)
      console.error('[lead-form] HCP createEstimate failed:', hcpError)
    }
  }

  // Stitch the HCP linkage back into our row so the Lead Pipeline can
  // deep-link and the office team can confirm the routing worked.
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
      console.error('[lead-form] attachHcpEstimate failed (non-fatal):', e)
    }
  }

  // Send branded email regardless of HCP outcome so the office sees every lead.
  const apiKey = process.env.RESEND_API_KEY
  const fromAddress =
    process.env.AGENT_TRAINING_FROM_EMAIL ||
    'TZ Switchboard <notifications@tzelectricinc.com>'
  const replyTo =
    process.env.AGENT_TRAINING_REPLY_TO || 'service@tzelectricinc.com'

  const officeRecipients = (process.env.LEAD_FORM_TO_EMAILS ||
    'cesar@creativequalitymarketing.com,service@tzelectricinc.com')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (apiKey && officeRecipients.length > 0) {
    const { subject, html, text } = renderLeadFormSubmissionEmail({
      firstName,
      lastName,
      phone,
      email,
      serviceType: body.serviceKey,
      serviceTypeLabel: body.serviceLabel,
      urgency: cleanQualification.urgency,
      street,
      city,
      state,
      zip,
      ownership: body.ownership,
      landlordName: body.landlordName,
      landlordPhone: body.landlordPhone,
      landlordEmail: body.landlordEmail,
      qualification: cleanQualification,
      referralSource: body.referralSource,
      notes: body.customerNotes,
      channel,
      gclid: body.tracking?.gclid,
      utmSource: body.tracking?.utmSource,
      utmMedium: body.tracking?.utmMedium,
      utmCampaign: body.tracking?.utmCampaign,
      landingPage: body.tracking?.landingPage,
      hcpLeadId: hcpEstimateId,
      hcpError,
    })

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: officeRecipients,
          reply_to: replyTo,
          subject,
          html,
          text,
        }),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => 'unknown')
        console.error('[lead-form] Resend non-2xx', res.status, errText)
      }
    } catch (e) {
      console.error('[lead-form] Resend send failed:', e)
    }
  } else if (!apiKey) {
    console.warn('[lead-form] RESEND_API_KEY not set; skipping email notification.')
  }

  return NextResponse.json({
    ok: true,
    leadId: storedLeadId,
    hcpCustomerId: hcpCustomer?.id || null,
    hcpEstimateId: hcpEstimateId || null,
    hcpInboxLeadId: hcpInboxLeadId || null,
    hcpCustomerExisting,
    hcpError: hcpError || null,
    channel,
    valueCents,
  })
}
