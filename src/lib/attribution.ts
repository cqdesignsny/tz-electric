/**
 * Channel attribution. Reduces a LeadTracking snapshot into a single label
 * the office, the Lead Pipeline, and the reports section can all filter by.
 *
 * Priority order:
 *   1. Click IDs (most reliable — paid clicks always carry an ID)
 *   2. UTM source/medium (campaigns that don't pass click IDs)
 *   3. Referrer host (organic + referral traffic)
 *   4. "Direct" if nothing landed
 *
 * Lead value tiers map service to expected lead value (in cents) for ROAS
 * reporting. Values are placeholder defaults based on typical home-services
 * close rates × average ticket; tune once we have a few months of HCP
 * Won/Lost data to compute actual close-rate-by-channel.
 */

import type { LeadTracking } from './lead-tracking'

export type Channel =
  // Paid
  | 'Google Ads'
  | 'Google LSA'
  | 'Bing Ads'
  | 'Meta Ads (Facebook)'
  | 'Meta Ads (Instagram)'
  | 'TikTok Ads'
  | 'LinkedIn Ads'
  // Organic
  | 'Google Organic'
  | 'Bing Organic'
  | 'Yahoo Organic'
  | 'DuckDuckGo Organic'
  | 'Facebook Organic'
  | 'Instagram Organic'
  | 'YouTube'
  | 'Nextdoor'
  | 'Yelp'
  | 'BBB'
  | 'Email'
  | 'Direct'
  | string // Referral - {host}, Other - {source}

export function deriveChannel(t: LeadTracking | null | undefined): Channel {
  if (!t) return 'Direct'

  // 1. Click IDs.
  if (t.gclid || t.gbraid || t.wbraid) return 'Google Ads'
  if (t.lsaId) return 'Google LSA'
  if (t.msclkid) return 'Bing Ads'
  if (t.ttclid) return 'TikTok Ads'
  if (t.liFatId) return 'LinkedIn Ads'
  if (t.fbclid) {
    // Meta passes fbclid for both FB and IG. Use referrer to disambiguate.
    const host = referrerHost(t.referrer)
    if (host && host.includes('instagram')) return 'Meta Ads (Instagram)'
    return 'Meta Ads (Facebook)'
  }

  // 2. UTM source/medium. Common patterns from manual tagging.
  const src = (t.utmSource || '').toLowerCase()
  const med = (t.utmMedium || '').toLowerCase()
  if (src) {
    if (src.includes('google') && (med === 'cpc' || med === 'paid' || med === 'ppc'))
      return 'Google Ads'
    if (src.includes('google') && (med === 'organic' || !med)) return 'Google Organic'
    if (src.includes('bing') && (med === 'cpc' || med === 'paid')) return 'Bing Ads'
    if (src.includes('bing')) return 'Bing Organic'
    if (src.includes('facebook') && (med === 'cpc' || med === 'paid')) return 'Meta Ads (Facebook)'
    if (src.includes('facebook')) return 'Facebook Organic'
    if (src.includes('instagram') && (med === 'cpc' || med === 'paid'))
      return 'Meta Ads (Instagram)'
    if (src.includes('instagram')) return 'Instagram Organic'
    if (src.includes('tiktok')) return 'TikTok Ads'
    if (src.includes('linkedin')) return 'LinkedIn Ads'
    if (src.includes('youtube')) return 'YouTube'
    if (src.includes('nextdoor')) return 'Nextdoor'
    if (src.includes('yelp')) return 'Yelp'
    if (src.includes('bbb')) return 'BBB'
    if (med === 'email' || src.includes('email') || src.includes('newsletter'))
      return 'Email'
    return `Other - ${t.utmSource}`
  }

  // 3. Referrer host parsing (organic + referrals).
  const host = referrerHost(t.referrer)
  if (host) {
    if (host.includes('google.com/localservices')) return 'Google LSA'
    if (host.endsWith('google.com') || host.endsWith('google.com.')) return 'Google Organic'
    if (host.endsWith('bing.com')) return 'Bing Organic'
    if (host.endsWith('yahoo.com')) return 'Yahoo Organic'
    if (host.endsWith('duckduckgo.com')) return 'DuckDuckGo Organic'
    if (host.includes('facebook.com') || host === 'l.facebook.com') return 'Facebook Organic'
    if (host.includes('instagram.com') || host === 'l.instagram.com') return 'Instagram Organic'
    if (host.endsWith('youtube.com') || host.endsWith('youtu.be')) return 'YouTube'
    if (host.endsWith('nextdoor.com')) return 'Nextdoor'
    if (host.endsWith('yelp.com')) return 'Yelp'
    if (host.endsWith('bbb.org')) return 'BBB'
    if (
      host.includes('mail.google.com') ||
      host.includes('outlook.live.com') ||
      host.includes('mail.yahoo.com')
    )
      return 'Email'
    return `Referral - ${host}`
  }

  return 'Direct'
}

function referrerHost(referrer?: string | null): string | null {
  if (!referrer) return null
  try {
    const url = new URL(referrer)
    return url.hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Per-service default lead value in cents. Used for the conversion event
 * fired on /thank-you so Google Ads / Meta optimization has something
 * meaningful to optimize on. Tune as we accumulate close-rate data.
 *
 * Formula: estimated job value × close rate ÷ 2 (lead → estimate → won
 * funnel discount). E.g. generator install ~$8000 × 25% close ÷ 2 = $1000;
 * we use a conservative $400 to start. Adjust in `tz_leads.attribution_value_cents`
 * directly for one-offs, or update this map for tier-wide changes.
 */
const SERVICE_VALUE_CENTS: Record<string, number> = {
  generator: 40000,
  hvac: 40000,
  electrical: 30000,
  'ev-charger': 25000,
  plumbing: 20000,
  surge: 10000,
  other: 20000,
}

const DEFAULT_LEAD_VALUE_CENTS = 25000 // $250

export function leadValueCents(serviceKey: string | null | undefined): number {
  if (!serviceKey) return DEFAULT_LEAD_VALUE_CENTS
  return SERVICE_VALUE_CENTS[serviceKey] ?? DEFAULT_LEAD_VALUE_CENTS
}

export function leadValueDollars(serviceKey: string | null | undefined): number {
  return Math.round(leadValueCents(serviceKey) / 100)
}

/**
 * Bucket the rich channel label into a small set of categories for
 * stat-card aggregation. The full label still shows on each row.
 */
export function channelGroup(channel: Channel | string | null | undefined):
  | 'paid'
  | 'organic'
  | 'direct'
  | 'referral'
  | 'unknown' {
  if (!channel) return 'unknown'
  if (channel === 'Direct') return 'direct'
  if (channel.endsWith('Ads') || channel === 'Google LSA') return 'paid'
  if (channel.endsWith('Organic') || channel === 'YouTube') return 'organic'
  if (channel.startsWith('Referral') || channel === 'Nextdoor' || channel === 'Yelp' || channel === 'BBB')
    return 'referral'
  return 'unknown'
}
