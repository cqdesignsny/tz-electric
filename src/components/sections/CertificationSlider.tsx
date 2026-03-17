'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const CERTIFICATIONS = [
  {
    name: 'Mitsubishi Diamond Contractor',
    src: '/images/certifications/diamond-contractor.svg',
    invert: true,
  },
  {
    name: 'Mitsubishi Electric',
    src: '/images/certifications/mitsubishi-electric.svg',
    invert: false,
  },
  {
    name: 'Generac Authorized Dealer',
    src: '/images/certifications/generac.webp',
    invert: false,
  },
  {
    name: 'BBB Accredited Business',
    src: '/images/certifications/bbb.webp',
    invert: false,
  },
  {
    name: 'Nextdoor Neighborhood Faves 2024',
    src: '/images/certifications/neighborhood-faves.webp',
    invert: false,
  },
  {
    name: 'Chronogram Neighborhood Faves Award Winner',
    src: '/images/certifications/chronogrammy.webp',
    invert: false,
  },
]

// Double the array for seamless infinite scroll
const DOUBLED = [...CERTIFICATIONS, ...CERTIFICATIONS]

export default function CertificationSlider() {
  return (
    <section className="py-10 bg-white border-y border-gray-100 overflow-hidden">
      <div className="container-site mb-6">
        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Trusted Certifications & Awards
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />

        <motion.div
          className="flex items-center gap-16"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            x: {
              duration: 14,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
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
                className={`object-contain max-h-[96px] w-auto transition-all duration-300 opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-110 ${cert.invert ? 'brightness-0' : ''}`}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
