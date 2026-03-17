'use client'

import Image from 'next/image'
import { useRef, useState, useCallback } from 'react'

type CertLogo = {
  name: string
  src: string
  type: 'dc' | 'me' | 'standard'
}

const CERTIFICATIONS: CertLogo[] = [
  {
    name: 'Mitsubishi Diamond Contractor',
    src: '/images/certifications/diamond-contractor.svg',
    type: 'dc', // White SVG → brightness-0 for gray, stays brightness-0 on hover (black)
  },
  {
    name: 'Mitsubishi Electric',
    src: '/images/certifications/mitsubishi-electric-dark.svg',
    type: 'me', // Dark-text variant with red triangles
  },
  {
    name: 'Generac Authorized Dealer',
    src: '/images/certifications/generac.webp',
    type: 'standard',
  },
  {
    name: 'BBB Accredited Business',
    src: '/images/certifications/bbb.webp',
    type: 'standard',
  },
  {
    name: 'Nextdoor Neighborhood Faves 2024',
    src: '/images/certifications/neighborhood-faves.webp',
    type: 'standard',
  },
  {
    name: 'Chronogram Neighborhood Faves Award Winner',
    src: '/images/certifications/chronogrammy.webp',
    type: 'standard',
  },
]

const DOUBLED = [...CERTIFICATIONS, ...CERTIFICATIONS]

function getLogoClasses(type: CertLogo['type']): string {
  const base = 'object-contain max-h-[96px] w-auto transition-all duration-300 pointer-events-none'
  switch (type) {
    case 'dc':
      // White SVG: brightness-0 makes black, opacity-40 for gray. Hover: full black
      return `${base} brightness-0 opacity-40 group-hover:opacity-100`
    case 'me':
      // Dark-text SVG: grayscale + low opacity for gray. Hover: full color (red triangles + dark text)
      return `${base} grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100`
    case 'standard':
      // Standard images: grayscale + low opacity. Hover: full color
      return `${base} grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100`
  }
}

export default function CertificationSlider() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!trackRef.current) return
    setIsDragging(true)
    dragStartX.current = e.clientX
    const computed = getComputedStyle(trackRef.current)
    const matrix = new DOMMatrix(computed.transform)
    scrollStartX.current = matrix.m41
    trackRef.current.style.animationPlayState = 'paused'
    trackRef.current.style.transform = `translateX(${matrix.m41}px)`
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !trackRef.current) return
    const diff = e.clientX - dragStartX.current
    trackRef.current.style.transform = `translateX(${scrollStartX.current + diff}px)`
  }, [isDragging])

  const onPointerUp = useCallback(() => {
    if (!trackRef.current) return
    setIsDragging(false)
    trackRef.current.style.transform = ''
    trackRef.current.style.animationPlayState = 'running'
  }, [])

  return (
    <section className="py-10 bg-white border-y border-gray-100 overflow-hidden">
      <div className="container-site mb-6">
        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Trusted Certifications & Awards
        </p>
      </div>

      <div
        className="relative select-none"
        onMouseEnter={() => {
          if (!isDragging && trackRef.current) {
            trackRef.current.style.animationPlayState = 'paused'
          }
        }}
        onMouseLeave={() => {
          if (!isDragging && trackRef.current) {
            trackRef.current.style.animationPlayState = 'running'
          }
        }}
      >
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          ref={trackRef}
          className="flex items-center gap-16 cursor-grab active:cursor-grabbing will-change-transform"
          style={{
            animation: 'cert-scroll 25s linear infinite',
            width: 'max-content',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {DOUBLED.map((cert, i) => (
            <div
              key={`${cert.name}-${i}`}
              className="flex-shrink-0 flex items-center justify-center h-24 w-52 group"
            >
              <Image
                src={cert.src}
                alt={cert.name}
                width={200}
                height={96}
                draggable={false}
                className={getLogoClasses(cert.type)}
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes cert-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
