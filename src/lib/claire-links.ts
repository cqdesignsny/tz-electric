import { CLAIRE_URL } from './constants'

/**
 * Build a Claire URL with a `?source=<location>` query param so GA4 can
 * segment /claire visits by entry point. The source value lands in the
 * standard GA4 `page_location` dimension on /claire pageviews, so no GTM
 * config is required to start reporting on it.
 *
 * Use a stable, snake_case value per placement (e.g. `header_button`,
 * `floating_bubble`, `homepage_section`, `service_hero_hvac`) so the GA4
 * report stays clean as new placements ship.
 */
export function claireHref(source: string): string {
  return `${CLAIRE_URL}?source=${encodeURIComponent(source)}`
}

/**
 * Push a `claire_cta_clicked` event to the GTM data layer alongside the
 * navigation. Lets the office build event-based reports in GA4 without
 * relying on URL parsing. Safe to call from server-rendered components
 * via onClick — it no-ops on the server and on browsers without GTM.
 */
export function trackClaireCtaClick(source: string): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> }
  if (!Array.isArray(w.dataLayer)) return
  w.dataLayer.push({
    event: 'claire_cta_clicked',
    claire_source: source,
  })
}
