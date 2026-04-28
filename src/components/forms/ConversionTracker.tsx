'use client'

import { useEffect, useRef } from 'react'

type Props = {
  leadId: string | null
  service: string | null
  serviceKey: string | null
  channel: string | null
  value: number | null
  ownership: string | null
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
    // gtag / fbq are loaded by the public layout. They may or may not exist
    // at this point; we feature-test before calling.
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

/**
 * Fires conversion events on the /thank-you page after a successful lead
 * submission. Routes through three channels:
 *
 *   1. dataLayer push (GTM) — `event: 'lead_submitted'`. Cesar can fan out
 *      to any tag from GTM without a code change. This is the preferred
 *      tracking surface for new platforms.
 *   2. GA4 `generate_lead` event — Google's recommended e-commerce-style
 *      lead event. If GA4 ↔ Google Ads is linked and `generate_lead` is
 *      marked as a conversion in GA4, it imports automatically — no
 *      conversion label needed in code.
 *   3. Meta Pixel `Lead` standard event — feeds Facebook + Instagram ads
 *      reporting and Lookalike audiences.
 *
 * `transaction_id` is set to the tz_leads UUID so analytics dedupes on
 * page refresh / back navigation.
 */
export default function ConversionTracker({
  leadId,
  service,
  serviceKey,
  channel,
  value,
  ownership,
}: Props) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const currency = 'USD'
    const numericValue = typeof value === 'number' && !Number.isNaN(value) ? value : 0
    const transactionId = leadId || undefined

    // 1. GTM dataLayer
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: 'lead_submitted',
        lead_id: transactionId,
        service_label: service,
        service_key: serviceKey,
        channel,
        ownership,
        value: numericValue,
        currency,
      })
    }

    // 2. GA4 generate_lead
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        currency,
        value: numericValue,
        transaction_id: transactionId,
        items: serviceKey
          ? [{ item_id: serviceKey, item_name: service || serviceKey, quantity: 1 }]
          : undefined,
        // Custom params surface in GA4 explorations.
        channel,
        ownership,
      })

      // Optional direct Google Ads conversion. If you've configured a
      // conversion label in Google Ads ("AW-XXX/LABEL") and want to fire
      // it independently of the GA4 import, set
      // NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL in Vercel env. GA4 import
      // is the recommended path; this is a fallback / parallel signal.
      const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL
      if (conversionLabel) {
        window.gtag('event', 'conversion', {
          send_to: conversionLabel,
          value: numericValue,
          currency,
          transaction_id: transactionId,
        })
      }
    }

    // 3. Meta Pixel Lead
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        currency,
        value: numericValue,
        content_category: serviceKey || undefined,
        content_name: service || undefined,
      })
    }
  }, [leadId, service, serviceKey, channel, value, ownership])

  return null
}
