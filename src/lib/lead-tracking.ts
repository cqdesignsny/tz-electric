/**
 * Lead tracking utilities for the native quote form.
 *
 * Captures Google Click ID (GCLID) and UTM parameters when a visitor lands
 * on the site, persists them in cookies for 30 days, and exposes a helper
 * to attach them to lead submissions for HCP attribution and Google Ads
 * Smart Bidding reporting.
 *
 * Runs on the client. Server submission reads them from the request body.
 */

const COOKIE_DAYS = 30
const COOKIE_KEYS = {
  gclid: 'tz_gclid',
  source: 'tz_utm_source',
  medium: 'tz_utm_medium',
  campaign: 'tz_utm_campaign',
  term: 'tz_utm_term',
  content: 'tz_utm_content',
  landing: 'tz_landing_page',
  landingAt: 'tz_landing_at',
} as const

export type LeadTracking = {
  gclid?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  landingPage?: string
  landingAt?: string
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
  if (!match) return undefined
  const value = match.split('=')[1]
  return value ? decodeURIComponent(value) : undefined
}

/**
 * Capture GCLID + UTM from the current URL and persist them.
 * Idempotent: only writes when the URL has fresh values, so a deep link
 * inside the site doesn't clobber the original ad-attributed values.
 */
export function captureLeadTracking(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const gclid = params.get('gclid')
  const utmSource = params.get('utm_source')
  const utmMedium = params.get('utm_medium')
  const utmCampaign = params.get('utm_campaign')
  const utmTerm = params.get('utm_term')
  const utmContent = params.get('utm_content')

  // Only refresh tracking when the URL itself carries new attribution.
  const hasNewAttribution = gclid || utmSource || utmCampaign
  if (!hasNewAttribution && getCookie(COOKIE_KEYS.landing)) return

  if (gclid) setCookie(COOKIE_KEYS.gclid, gclid, COOKIE_DAYS)
  if (utmSource) setCookie(COOKIE_KEYS.source, utmSource, COOKIE_DAYS)
  if (utmMedium) setCookie(COOKIE_KEYS.medium, utmMedium, COOKIE_DAYS)
  if (utmCampaign) setCookie(COOKIE_KEYS.campaign, utmCampaign, COOKIE_DAYS)
  if (utmTerm) setCookie(COOKIE_KEYS.term, utmTerm, COOKIE_DAYS)
  if (utmContent) setCookie(COOKIE_KEYS.content, utmContent, COOKIE_DAYS)

  setCookie(COOKIE_KEYS.landing, window.location.pathname, COOKIE_DAYS)
  setCookie(COOKIE_KEYS.landingAt, new Date().toISOString(), COOKIE_DAYS)
}

/**
 * Read the persisted tracking back at submit time.
 */
export function readLeadTracking(): LeadTracking {
  return {
    gclid: getCookie(COOKIE_KEYS.gclid),
    utmSource: getCookie(COOKIE_KEYS.source),
    utmMedium: getCookie(COOKIE_KEYS.medium),
    utmCampaign: getCookie(COOKIE_KEYS.campaign),
    utmTerm: getCookie(COOKIE_KEYS.term),
    utmContent: getCookie(COOKIE_KEYS.content),
    landingPage: getCookie(COOKIE_KEYS.landing),
    landingAt: getCookie(COOKIE_KEYS.landingAt),
  }
}
