'use client'

import { useState, useEffect } from 'react'
import { COMPANY, TYPEFORM_URL } from '@/lib/constants'

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      {/* Phone Button */}
      <a
        href={`tel:${COMPANY.phoneRaw}`}
        className="flex items-center gap-2 bg-navy text-white px-5 py-3 rounded-full shadow-lg hover:bg-navy-light transition-all duration-300 hover:scale-105 font-heading font-semibold text-sm"
        aria-label={`Call ${COMPANY.phone}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
        <span className="hidden sm:inline">Call Now</span>
      </a>

      {/* Get Quote Button */}
      <a
        href={TYPEFORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-accent text-white px-5 py-3 rounded-full shadow-lg hover:bg-accent-dark transition-all duration-300 hover:scale-105 font-heading font-semibold text-sm"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        Get a Free Quote
      </a>
    </div>
  )
}
