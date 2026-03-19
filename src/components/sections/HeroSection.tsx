'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import Button from '@/components/ui/Button'
import ElectricCursor from '@/components/effects/ElectricCursor'
import { TrustIndexBadge } from '@/components/ui/TrustIndexWidget'

const HERO_SLIDES = [
  { src: '/images/hero/tz-team-2025.avif', alt: 'TZ Electric team of professionals' },
  { src: '/images/services/electrical-panel.webp', alt: 'Electrical panel upgrade service' },
  { src: '/images/services/hvac-hero.png', alt: 'HVAC installation and repair' },
  { src: '/images/services/mini-split.webp', alt: 'Mitsubishi ductless mini split system' },
  { src: '/images/services/generator.webp', alt: 'Generac whole-home generator' },
  { src: '/images/services/service-1.avif', alt: 'Professional home service work' },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [nextSlide])

  return (
    <section className="relative bg-navy overflow-hidden min-h-[700px] lg:min-h-[750px]">
      {/* Background Image Slider */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_SLIDES[currentSlide].src}
              alt={HERO_SLIDES[currentSlide].alt}
              fill
              className="object-cover"
              priority={currentSlide === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
        {/* Navy overlay — 60% opacity for readability with luxury depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/75 to-navy/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/40" />
      </div>

      {/* Electric Cursor Effect */}
      <ElectricCursor />

      <div className="container-site relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[500px] lg:min-h-[550px] py-12 lg:py-16">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Trust Index Badge */}
            <div className="mb-4">
              <TrustIndexBadge />
            </div>

            <h1 className="text-white text-4xl lg:text-5xl xl:text-6xl font-heading font-bold leading-[1.1]">
              Your Trusted{' '}
              <span className="text-blue-light">Home Services</span>{' '}
              Experts
            </h1>

            <p className="mt-6 text-gray-200 text-lg lg:text-xl max-w-xl leading-relaxed">
              Expert cooling, heating, electrical, plumbing, and generator services
              for the {COMPANY.serviceArea} region. Licensed, insured, and
              committed to your comfort.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={TYPEFORM_URL} external size="lg">
                Get a Free Quote
              </Button>
              <Button
                href={`tel:${COMPANY.phoneRaw}`}
                variant="outline"
                size="lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Call {COMPANY.phone}
              </Button>
            </div>

            {/* Quick Trust Signals */}
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-300">
              {COMPANY.certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side — certification logos floating over the slider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex flex-col items-center justify-center"
          >
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 text-center">
              <Image
                src="/images/certifications/diamond-contractor.svg"
                alt="Mitsubishi Diamond Contractor"
                width={280}
                height={80}
                className="mx-auto mb-6 brightness-0 invert"
              />
              <Image
                src="/images/certifications/mitsubishi-electric.svg"
                alt="Mitsubishi Electric"
                width={220}
                height={90}
                className="mx-auto mb-6"
              />
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-white">12+</div>
                  <div className="text-xs text-gray-400">Years</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-white">330+</div>
                  <div className="text-xs text-gray-400">Reviews</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-white">24/7</div>
                  <div className="text-xs text-gray-400">Service</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
