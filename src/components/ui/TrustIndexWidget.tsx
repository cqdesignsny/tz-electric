'use client'

import { useEffect, useRef } from 'react'

/**
 * Trust Index Google Reviews Widget
 * Premium widget connected to TZ Electric's Google reviews.
 * The script must be inline in the DOM — Trust Index injects content next to the script tag.
 */
export function TrustIndexWidget() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // Prevent duplicate script injection
    if (containerRef.current.querySelector('script')) return

    const script = document.createElement('script')
    script.src = 'https://cdn.trustindex.io/loader.js?f9ed46c3227458599e465982749'
    script.defer = true
    script.async = true
    containerRef.current.appendChild(script)
  }, [])

  return <div ref={containerRef} />
}

/**
 * Trust Index Badge
 * Small badge showing Google review rating — for header/nav.
 */
export function TrustIndexBadge() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (containerRef.current.querySelector('script')) return

    const script = document.createElement('script')
    script.src = 'https://cdn.trustindex.io/loader.js?730da6332aac58532676097c4d6'
    script.defer = true
    script.async = true
    containerRef.current.appendChild(script)
  }, [])

  return <div ref={containerRef} />
}
