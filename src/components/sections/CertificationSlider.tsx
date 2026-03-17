'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const CERTIFICATIONS = [
  {
    name: 'Mitsubishi Diamond Contractor',
    src: '/images/certifications/diamond-contractor.svg',
    invertForGray: true, // White SVG — needs special handling
  },
  {
    name: 'Mitsubishi Electric',
    src: '/images/certifications/mitsubishi-electric.svg',
    invertForGray: false, // Has red triangle + dark text already
  },
  {
    name: 'Generac Authorized Dealer',
    src: '/images/certifications/generac.webp',
    invertForGray: false,
  },
  {
    name: 'BBB Accredited Business',
    src: '/images/certifications/bbb.webp',
    invertForGray: false,
  },
  {
    name: 'Nextdoor Neighborhood Faves 2024',
    src: '/images/certifications/neighborhood-faves.webp',
    invertForGray: false,
  },
  {
    name: 'Chronogram Neighborhood Faves Award Winner',
    src: '/images/certifications/chronogrammy.webp',
    invertForGray: false,
  },
]

// Triple the array for seamless infinite scroll — ensures no gap even on wide screens
const TRIPLED = [...CERTIFICATIONS, ...CERTIFICATIONS, ...CERTIFICATIONS]

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
          animate={{ x: ['0%', '-33.333%'] }}
          transition={{
            x: {
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
              repeatType: 'loop',
            },
          }}
        >
          {TRIPLED.map((cert, i) => (
            <div
              key={`${cert.name}-${i}`}
              className="flex-shrink-0 flex items-center justify-center h-24 w-52 group cursor-pointer"
            >
              <Image
                src={cert.src}
                alt={cert.name}
                width={200}
                height={96}
                className={`object-contain max-h-[96px] w-auto transition-all duration-300
                  ${cert.invertForGray
                    ? 'brightness-0 opacity-40 group-hover:opacity-100 group-hover:brightness-100'
                    : 'grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100'
                  }
                  group-hover:scale-110`}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
