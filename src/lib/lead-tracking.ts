/**
 * Lead tracking utilities for the native quote form.
 *
 * Captures every common ad-platform click ID plus UTM parameters and the
 * entry referrer. Persists two parallel sets of cookies:
 *
 *   tz_first_*  90-day TTL, never overwritten — first-touch snapshot
 *   tz_last_*   30-day TTL, refreshed on each new attribution — last-touch
 *
 * Click IDs covered:
 *   gclid    Google Ads (search, shopping, display, YouTube)
 *   gbraid   Google Ads, iOS app conversions
 *   wbraid   Google Ads, web conversions on iOS
 *   fbclid   Meta (Facebook + Instagram + Threads)
 *   msclkid  Microsoft Advertising (Bing)
 *   ttclid   TikTok Ads
 *   li_fat_id  LinkedIn Ads
 *   lsa_id     Google Local Services Ads (rare; LSA leads usually bypass site)
 *
 * Runs on the client. Server submission reads them from the request body and
 * derives a single `channel` label via lib/attribution.ts.
 */

const FIRST_TOUCH_DAYS = 90
const LAST_TOUCH_DAYS = 30

const FIELDS = [
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'msclkid',
  'ttclid',
  'li_fat_id',
  'lsa_id',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'referrer',
  'landing_page',
  'landing_at',
] as const

type FieldKey = (typeof FIELDS)[number]

export type LeadTracking = {
  // Last-touch (always current submission's session)
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
  // First-touch (90-day persisted, frozen on first attribution)
  firstTouch?: {
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
  }
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

function readUrlParams(): Record<FieldKey, string | undefined> {
  const params = new URLSearchParams(window.location.search)
  // Read `referrer`, `landing_page`, `landing_at` from the environment, not URL.
  return {
    gclid: params.get('gclid') || undefined,
    gbraid: params.get('gbraid') || undefined,
    wbraid: params.get('wbraid') || undefined,
    fbclid: params.get('fbclid') || undefined,
    msclkid: params.get('msclkid') || undefined,
    ttclid: params.get('ttclid') || undefined,
    li_fat_id: params.get('li_fat_id') || undefined,
    lsa_id: params.get('lsa_id') || undefined,
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
    referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
    landing_page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    landing_at: new Date().toISOString(),
  }
}

function hasAttribution(values: Record<FieldKey, string | undefined>): boolean {
  // A "real" attribution event is anything that names where the visit came
  // from. Bare landing/referrer alone aren't enough.
  return !!(
    values.gclid ||
    values.gbraid ||
    values.wbraid ||
    values.fbclid ||
    values.msclkid ||
    values.ttclid ||
    values.li_fat_id ||
    values.lsa_id ||
    values.utm_source ||
    values.utm_medium ||
    values.utm_campaign ||
    (values.referrer && !isInternalReferrer(values.referrer))
  )
}

function isInternalReferrer(ref: string): boolean {
  try {
    const refHost = new URL(ref).hostname.toLowerCase()
    const ownHost =
      typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : ''
    return refHost === ownHost
  } catch {
    return false
  }
}

function writeCookies(prefix: 'first' | 'last', values: Record<FieldKey, string | undefined>) {
  const days = prefix === 'first' ? FIRST_TOUCH_DAYS : LAST_TOUCH_DAYS
  for (const k of FIELDS) {
    const v = values[k]
    if (v) setCookie(`tz_${prefix}_${k}`, v, days)
  }
}

function readCookieSet(prefix: 'first' | 'last'): Record<FieldKey, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const k of FIELDS) {
    out[k] = getCookie(`tz_${prefix}_${k}`)
  }
  return out as Record<FieldKey, string | undefined>
}

function hasFirstTouch(): boolean {
  return !!getCookie('tz_first_landing_at')
}

/**
 * Capture every channel signal from the current URL + referrer and persist
 * to first/last-touch cookies. Idempotent: only refreshes last-touch when
 * the URL carries new attribution (so a deep link inside the site doesn't
 * clobber the original ad-attributed values).
 */
export function captureLeadTracking(): void {
  if (typeof window === 'undefined') return

  const values = readUrlParams()
  const isAttributedVisit = hasAttribution(values)

  // First-touch: only ever written once. If the visitor returns months
  // later via a different campaign, first-touch is still the original.
  if (!hasFirstTouch() && isAttributedVisit) {
    writeCookies('first', values)
  }
  // First-touch fallback for visitors with no attribution at all on their
  // very first session: still capture landing page + referrer so we can
  // tell direct vs referral later.
  if (!hasFirstTouch()) {
    writeCookies('first', values)
  }

  // Last-touch: refresh on every attributed visit.
  if (isAttributedVisit) {
    writeCookies('last', values)
  }
}

/**
 * Read both touch sets and shape into the LeadTracking object the API
 * accepts. Last-touch fields are spread at the top level (matches the
 * shape the API has been seeing); first-touch lives under .firstTouch.
 */
export function readLeadTracking(): LeadTracking {
  const last = readCookieSet('last')
  const first = readCookieSet('first')

  // Fall back to first-touch fields if last-touch is empty (for direct
  // visitors who never had an attributed session).
  const merged: Record<FieldKey, string | undefined> = {} as Record<FieldKey, string | undefined>
  for (const k of FIELDS) {
    merged[k] = last[k] || first[k]
  }

  return {
    gclid: merged.gclid,
    gbraid: merged.gbraid,
    wbraid: merged.wbraid,
    fbclid: merged.fbclid,
    msclkid: merged.msclkid,
    ttclid: merged.ttclid,
    liFatId: merged.li_fat_id,
    lsaId: merged.lsa_id,
    utmSource: merged.utm_source,
    utmMedium: merged.utm_medium,
    utmCampaign: merged.utm_campaign,
    utmTerm: merged.utm_term,
    utmContent: merged.utm_content,
    referrer: merged.referrer,
    landingPage: merged.landing_page,
    landingAt: merged.landing_at,
    firstTouch: hasFirstTouch()
      ? {
          gclid: first.gclid,
          gbraid: first.gbraid,
          wbraid: first.wbraid,
          fbclid: first.fbclid,
          msclkid: first.msclkid,
          ttclid: first.ttclid,
          liFatId: first.li_fat_id,
          lsaId: first.lsa_id,
          utmSource: first.utm_source,
          utmMedium: first.utm_medium,
          utmCampaign: first.utm_campaign,
          utmTerm: first.utm_term,
          utmContent: first.utm_content,
          referrer: first.referrer,
          landingPage: first.landing_page,
          landingAt: first.landing_at,
        }
      : undefined,
  }
}
