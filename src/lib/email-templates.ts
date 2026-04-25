/**
 * Branded HTML email templates for TZ Electric.
 *
 * Inline-styled, table-based layout for cross-client compatibility
 * (Apple Mail, Gmail, Outlook desktop and mobile, Yahoo, etc).
 * Max width 600px with mobile-responsive media query inside <style>.
 *
 * Brand tokens (kept in sync with the public site):
 *   Navy:   #0F1C3F   Blue:    #1E40AF   Blue Light: #2563EB
 *   Accent: #F97316   Charcoal:#1E293B   Gray:       #6B7280
 */

const SITE_URL = 'https://tzelectricinc.com'
const LOGO_URL = `${SITE_URL}/images/logo/tz-logo-main.png`
const COMPANY = {
  name: 'TZ Electric Inc.',
  address: '5079 NY-32, Catskill, NY 12414',
  phone: '(518) 678-1230',
  phoneHref: 'tel:+15186781230',
  email: 'service@tzelectricinc.com',
  tagline: 'Cooling | Heating | Electrical',
}

/**
 * HTML escape for any user-supplied text rendered into the email.
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

type StatItem = { label: string; value: string }
type CtaButton = { label: string; href: string }

type EmailLayoutOptions = {
  preheader: string
  eyebrow: string
  heading: string
  intro: string
  stats?: StatItem[]
  bodyHtml?: string
  cta?: CtaButton
}

/**
 * Wrap content in the standard TZ branded shell.
 * Returns a complete HTML document ready to send via Resend.
 */
export function renderEmailLayout(opts: EmailLayoutOptions): string {
  const stats = opts.stats || []
  const cta = opts.cta

  const statsRow =
    stats.length === 0
      ? ''
      : `
    <tr>
      <td style="padding:0 32px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            ${stats
              .map(
                (s, i) => `
            <td class="stack" style="${i < stats.length - 1 ? 'padding-right:8px;' : ''}vertical-align:top;width:${100 / stats.length}%;">
              <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;padding:14px 16px;">
                <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280;font-weight:600;margin-bottom:6px;">${escapeHtml(s.label)}</div>
                <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:18px;color:#0F1C3F;font-weight:700;line-height:1.2;">${escapeHtml(s.value)}</div>
              </div>
            </td>`,
              )
              .join('')}
          </tr>
        </table>
      </td>
    </tr>`

  const bodyBlock = opts.bodyHtml
    ? `
    <tr>
      <td style="padding:0 32px 28px;">
        ${opts.bodyHtml}
      </td>
    </tr>`
    : ''

  const ctaBlock = cta
    ? `
    <tr>
      <td align="center" style="padding:0 32px 36px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#F97316;border-radius:9999px;">
              <a href="${cta.href}" style="display:inline-block;padding:14px 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.01em;">
                ${escapeHtml(cta.label)} &nbsp;→
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    : ''

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(opts.heading)}</title>
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .container { width:100% !important; }
      .stack { display:block !important; width:100% !important; padding:0 0 8px 0 !important; }
      .px { padding-left:20px !important; padding-right:20px !important; }
      .heading { font-size:24px !important; line-height:1.25 !important; }
    }
    body { margin:0; padding:0; background:#F3F4F6; }
    a { color:#1E40AF; }
    img { display:block; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    table { border-collapse:collapse; }
  </style>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Helvetica Neue',Arial,sans-serif;color:#1E293B;">
  <!-- Preheader: invisible inbox preview text -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#F3F4F6;opacity:0;">
    ${escapeHtml(opts.preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F6;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(15,28,63,0.06),0 1px 2px rgba(15,28,63,0.04);">

          <!-- Top accent strip -->
          <tr>
            <td style="height:5px;background:linear-gradient(90deg,#F97316 0%,#1E40AF 50%,#0F1C3F 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header: logo on white -->
          <tr>
            <td align="center" class="px" style="padding:32px 32px 20px;">
              <a href="${SITE_URL}" style="text-decoration:none;display:inline-block;">
                <img src="${LOGO_URL}" alt="TZ Electric" width="200" height="auto" style="height:auto;max-width:200px;display:block;" />
              </a>
            </td>
          </tr>

          <!-- Eyebrow -->
          <tr>
            <td align="center" class="px" style="padding:0 32px 8px;">
              <div style="font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#1E40AF;font-weight:700;">
                ${escapeHtml(opts.eyebrow)}
              </div>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" class="px" style="padding:4px 32px 12px;">
              <h1 class="heading" style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:28px;line-height:1.25;color:#0F1C3F;font-weight:700;letter-spacing:-0.01em;">
                ${escapeHtml(opts.heading)}
              </h1>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td align="center" class="px" style="padding:0 32px 28px;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.6;color:#4B5563;max-width:480px;">
                ${escapeHtml(opts.intro)}
              </p>
            </td>
          </tr>

          ${statsRow}
          ${bodyBlock}
          ${ctaBlock}

          <!-- Hairline divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:#E5E7EB;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="px" style="padding:24px 32px 32px;background:#F8FAFC;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;color:#0F1C3F;font-weight:700;letter-spacing:-0.005em;">
                      ${escapeHtml(COMPANY.name)}
                    </div>
                    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#1E40AF;font-weight:600;margin-top:4px;">
                      ${escapeHtml(COMPANY.tagline)}
                    </div>
                    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#6B7280;margin-top:14px;line-height:1.6;">
                      ${escapeHtml(COMPANY.address)}<br />
                      <a href="${COMPANY.phoneHref}" style="color:#6B7280;text-decoration:none;">${escapeHtml(COMPANY.phone)}</a>
                      &nbsp;·&nbsp;
                      <a href="mailto:${COMPANY.email}" style="color:#6B7280;text-decoration:none;">${escapeHtml(COMPANY.email)}</a>
                    </div>
                    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#9CA3AF;margin-top:18px;">
                      &copy; ${new Date().getFullYear()} ${escapeHtml(COMPANY.name)}. Sent from the TZ Switchboard.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

type QuestionnaireSubmissionOptions = {
  filledBy: string
  markdown: string
  answeredCount: number
  totalCount: number
  submittedAt?: Date
}

type RenderedEmail = {
  subject: string
  html: string
  text: string
}

/**
 * Email sent to admin when someone submits the agent training questionnaire.
 */
export function renderQuestionnaireSubmissionEmail(
  opts: QuestionnaireSubmissionOptions,
): RenderedEmail {
  const submittedAt = opts.submittedAt || new Date()
  const filledByDisplay = opts.filledBy.trim() || 'someone at TZ'
  const completionPct = Math.round(
    (opts.answeredCount / Math.max(opts.totalCount, 1)) * 100,
  )

  const subject = `${filledByDisplay} submitted the TZ agent training questionnaire`

  const stats: StatItem[] = [
    { label: 'Filled by', value: filledByDisplay },
    {
      label: 'Completed',
      value: `${opts.answeredCount} of ${opts.totalCount}`,
    },
    { label: 'Completion', value: `${completionPct}%` },
  ]

  const submittedAtLabel = submittedAt.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const escapedMarkdown = escapeHtml(opts.markdown)

  const bodyHtml = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#6B7280;margin-bottom:14px;">
      Submitted ${escapeHtml(submittedAtLabel)}
    </div>
    <div style="background:#0F1C3F;border-radius:10px;padding:20px 22px;color:#E5E7EB;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,Courier,monospace;font-size:12.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word;">${escapedMarkdown}</div>
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#6B7280;margin-top:14px;line-height:1.6;">
      The full answers are above. Open the TZ Switchboard to build the agent knowledge base or send follow-up questions.
    </div>
  `

  const html = renderEmailLayout({
    preheader: `${filledByDisplay} answered ${opts.answeredCount} of ${opts.totalCount}. Knowledge base ready to build.`,
    eyebrow: 'TZ Switchboard · Agent Training',
    heading: `${filledByDisplay} submitted the questionnaire`,
    intro:
      'The agent training questionnaire just came in. Use these answers to build the AI agent knowledge base.',
    stats,
    bodyHtml,
    cta: {
      label: 'Open the TZ Switchboard',
      href: `${SITE_URL}/switchboard`,
    },
  })

  const text = [
    `# ${subject}`,
    ``,
    `Submitted: ${submittedAtLabel}`,
    `Filled by: ${filledByDisplay}`,
    `Answered: ${opts.answeredCount} of ${opts.totalCount} (${completionPct}%)`,
    ``,
    `Open the TZ Switchboard: ${SITE_URL}/switchboard`,
    ``,
    `--- Full submission ---`,
    ``,
    opts.markdown,
  ].join('\n')

  return { subject, html, text }
}
