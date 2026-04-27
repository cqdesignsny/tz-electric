import { NextRequest, NextResponse } from 'next/server'
import { createLead, type LeadPayload } from '@/lib/housecall-pro'
import { renderLeadFormSubmissionEmail } from '@/lib/email-templates'

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
    utmSource?: string
    utmMedium?: string
    utmCampaign?: string
    utmTerm?: string
    utmContent?: string
    landingPage?: string
    landingAt?: string
  }
}

function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function buildLeadNotes(body: SubmitBody): string {
  // The HCP /leads endpoint doesn't accept tags directly. Lead context that
  // would otherwise be a tag (renter status, Google Ads source, AI vs form
  // origin) gets prepended here so it's the first thing office staff see.
  const lines: string[] = []

  const flags: string[] = []
  flags.push(body.tracking?.gclid ? '[TZ AI AGENT or Google Ads]' : '[Web Form]')
  if (body.ownership === 'renter') flags.push('[RENTER - LANDLORD VERIFICATION NEEDED]')
  lines.push(flags.join(' '))
  lines.push('')

  lines.push(`Service: ${body.serviceLabel} (${body.serviceKey})`)
  lines.push('')
  lines.push('--- Qualification ---')
  Object.entries(body.qualification).forEach(([k, v]) => {
    if (isNonEmpty(v)) lines.push(`${k}: ${v}`)
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
  lines.push('--- Attribution ---')
  if (body.tracking?.gclid) lines.push(`GCLID: ${body.tracking.gclid}`)
  if (body.tracking?.utmSource) lines.push(`UTM source: ${body.tracking.utmSource}`)
  if (body.tracking?.utmMedium) lines.push(`UTM medium: ${body.tracking.utmMedium}`)
  if (body.tracking?.utmCampaign) lines.push(`UTM campaign: ${body.tracking.utmCampaign}`)
  if (body.tracking?.utmTerm) lines.push(`UTM term: ${body.tracking.utmTerm}`)
  if (body.tracking?.utmContent) lines.push(`UTM content: ${body.tracking.utmContent}`)
  if (body.tracking?.landingPage) lines.push(`Landing page: ${body.tracking.landingPage}`)
  if (body.tracking?.landingAt) lines.push(`Landing at: ${body.tracking.landingAt}`)
  if (body.referralSource) lines.push(`Heard via: ${body.referralSource}`)
  return lines.join('\n')
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

  const leadPayload: LeadPayload = {
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    phone: body.phone,
    email: isNonEmpty(body.email) ? body.email.trim() : undefined,
    street: isNonEmpty(body.street) ? body.street.trim() : undefined,
    city: isNonEmpty(body.city) ? body.city.trim() : undefined,
    state: isNonEmpty(body.state) ? body.state.trim() : 'NY',
    zip: isNonEmpty(body.zip) ? body.zip.trim() : undefined,
    serviceType: body.serviceLabel,
    source: 'Website Lead Form',
    notes: buildLeadNotes(body),
  }

  let hcpLeadId: string | undefined
  let hcpError: string | undefined
  try {
    const lead = await createLead(leadPayload)
    if (typeof lead?.id === 'string') hcpLeadId = lead.id
  } catch (e) {
    hcpError = e instanceof Error ? e.message : String(e)
    console.error('[lead-form] HCP createLead failed:', hcpError)
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
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      email: body.email,
      serviceType: body.serviceKey,
      serviceTypeLabel: body.serviceLabel,
      urgency: body.qualification?.urgency,
      street: body.street,
      city: body.city,
      state: body.state,
      zip: body.zip,
      ownership: body.ownership,
      landlordName: body.landlordName,
      landlordPhone: body.landlordPhone,
      landlordEmail: body.landlordEmail,
      qualification: body.qualification || {},
      referralSource: body.referralSource,
      notes: body.customerNotes,
      gclid: body.tracking?.gclid,
      utmSource: body.tracking?.utmSource,
      utmMedium: body.tracking?.utmMedium,
      utmCampaign: body.tracking?.utmCampaign,
      landingPage: body.tracking?.landingPage,
      hcpLeadId,
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
    hcpLeadId: hcpLeadId || null,
    hcpError: hcpError || null,
  })
}
