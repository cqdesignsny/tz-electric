'use client'

import Script from 'next/script'

/**
 * Trust Index Google Reviews Widget
 * Premium widget connected to TZ Electric's Google reviews
 */
export function TrustIndexWidget() {
  return (
    <Script
      src="https://cdn.trustindex.io/loader.js?f9ed46c3227458599e465982749"
      strategy="lazyOnload"
    />
  )
}

/**
 * Trust Index Badge
 * Small badge showing Google review rating — for header/nav
 */
export function TrustIndexBadge() {
  return (
    <Script
      src="https://cdn.trustindex.io/loader.js?730da6332aac58532676097c4d6"
      strategy="lazyOnload"
    />
  )
}
