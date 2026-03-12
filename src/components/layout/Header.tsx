'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { COMPANY, NAV_ITEMS, TYPEFORM_URL } from '@/lib/constants'
import Button from '@/components/ui/Button'

// ============================================
// MEGA MENU DATA
// ============================================

const MEGA_MENU_SERVICES = [
  {
    title: 'Electrical',
    href: '/electrical',
    description: 'Panel upgrades, rewiring, lighting, EV chargers & more',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'HVAC',
    href: '/hvac',
    description: 'Central air, furnaces, heat pumps & ventilation',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
      </svg>
    ),
  },
  {
    title: 'Mini Splits',
    href: '/mini-split',
    description: 'Mitsubishi Diamond Elite ductless systems',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    title: 'Generators',
    href: '/generator',
    description: 'Generac whole-home backup power solutions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 001.5 9.75v6A2.25 2.25 0 003.75 18z" />
      </svg>
    ),
  },
  {
    title: 'Plumbing',
    href: '/plumbing',
    description: 'Pipe repair, drains, fixtures & full-service plumbing',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l5.653-4.655M15.17 11.42l5.653-4.655a2.548 2.548 0 00-3.586-3.586l-4.655 5.653M11.42 15.17l3.75-3.75" />
      </svg>
    ),
  },
  {
    title: 'Hot Water Heaters',
    href: '/hot-water-heaters',
    description: 'Tankless & traditional water heater install & repair',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      </svg>
    ),
  },
  {
    title: 'Emergency Services',
    href: '/emergency',
    description: '24/7 emergency plumbing, electrical & HVAC repair',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
]

const SERVICE_AREA_COUNTIES: { county: string; cities: { label: string; href: string }[] }[] = [
  {
    county: 'Greene County',
    cities: [
      { label: 'Catskill', href: '/service-areas/catskill-ny' },
      { label: 'Hunter', href: '/service-areas/hunter-ny' },
    ],
  },
  {
    county: 'Columbia County',
    cities: [
      { label: 'Hudson', href: '/service-areas/hudson-ny' },
    ],
  },
  {
    county: 'Ulster County',
    cities: [
      { label: 'Woodstock', href: '/service-areas/woodstock-ny' },
      { label: 'Saugerties', href: '/service-areas/saugerties-ny' },
    ],
  },
  {
    county: 'Dutchess County',
    cities: [
      { label: 'Rhinebeck', href: '/service-areas/rhinebeck-ny' },
    ],
  },
  {
    county: 'Albany County',
    cities: [
      { label: 'Albany', href: '/service-areas/albany-ny' },
    ],
  },
]

const ABOUT_LINKS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    label: 'About Us', href: '/about-us', description: 'Our story, values & team',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
    label: 'Reviews', href: '/reviews', description: '330+ five-star Google reviews',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
    label: 'Gallery', href: '/gallery', description: 'See our completed projects',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
    label: 'Blog', href: '/blog', description: 'Tips, guides & company news',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
      </svg>
    ),
    label: 'Careers', href: '/careers', description: 'Join the TZ Electric team',
  },
]

// ============================================
// ICON COMPONENTS
// ============================================

function PhoneIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const megaPanelVariants = {
  hidden: { opacity: 0, y: -4, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: 'auto' as const,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -4,
    height: 0,
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] as const },
  },
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const mobileMenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.25 } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
}

// ============================================
// MEGA PANEL COMPONENTS
// ============================================

function ServicesMegaPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="container-site py-8">
      <div className="flex gap-8">
        {/* Services Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-bold text-navy text-sm uppercase tracking-wider">
              Our Services
            </h3>
            <Link
              href="/services"
              onClick={onClose}
              className="text-sm font-medium text-blue hover:text-blue-dark flex items-center gap-1 transition-colors"
            >
              View All Services
              <ArrowRightIcon />
            </Link>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {MEGA_MENU_SERVICES.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                onClick={onClose}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-sky/50 transition-colors"
              >
                <span className="w-9 h-9 flex-shrink-0 rounded-lg bg-blue/10 text-blue flex items-center justify-center" aria-hidden="true">
                  {service.icon}
                </span>
                <div className="min-w-0">
                  <span className="block font-heading font-semibold text-navy text-sm group-hover:text-blue transition-colors">
                    {service.title}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {service.description}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right CTA */}
        <div className="hidden xl:flex flex-col w-64 flex-shrink-0 bg-navy rounded-2xl p-6 text-white">
          <div className="flex-1">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <h4 className="font-heading font-bold text-lg text-white leading-tight mb-2">
              Need Help Choosing?
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              Not sure which service you need? Give us a call and our experts will guide you.
            </p>
          </div>
          <a
            href={`tel:${COMPANY.phoneRaw}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-navy font-heading font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            <PhoneIcon className="w-4 h-4" />
            {COMPANY.phone}
          </a>
        </div>
      </div>
    </div>
  )
}

function ServiceAreasMegaPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="container-site py-8">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-heading font-bold text-navy text-sm uppercase tracking-wider">
          Service Areas
        </h3>
        <Link
          href="/service-areas"
          onClick={onClose}
          className="text-sm font-medium text-blue hover:text-blue-dark flex items-center gap-1 transition-colors"
        >
          View All Areas
          <ArrowRightIcon />
        </Link>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-6">
        {SERVICE_AREA_COUNTIES.map((group) => (
          <div key={group.county}>
            <h4 className="font-heading font-semibold text-navy text-xs uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
              {group.county}
            </h4>
            <ul className="space-y-1.5">
              {group.cities.map((city) => (
                <li key={city.href}>
                  <Link
                    href={city.href}
                    onClick={onClose}
                    className="text-sm text-gray-600 hover:text-blue transition-colors"
                  >
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-gray-500">
        Serving the entire Hudson Valley, NY region including Dutchess, Ulster, Albany, Columbia & Greene counties.
      </div>
    </div>
  )
}

function AboutMegaPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="container-site py-8">
      <div className="flex gap-8">
        <div className="flex-1">
          <h3 className="font-heading font-bold text-navy text-sm uppercase tracking-wider mb-5">
            About TZ Electric
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ABOUT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="group flex items-start gap-3 p-3 rounded-xl hover:bg-sky/50 transition-colors"
              >
                <span className="w-9 h-9 flex-shrink-0 rounded-lg bg-blue/10 text-blue flex items-center justify-center" aria-hidden="true">
                  {link.icon}
                </span>
                <div>
                  <span className="block font-heading font-semibold text-navy text-sm group-hover:text-blue transition-colors">
                    {link.label}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    {link.description}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* Featured Card */}
        <div className="hidden lg:flex flex-col w-72 flex-shrink-0 bg-gradient-to-br from-blue to-blue-dark rounded-2xl p-6 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <h4 className="font-heading font-bold text-lg text-white leading-tight mb-2">
            330+ Five-Star Reviews
          </h4>
          <p className="text-sm text-blue-100/80 leading-relaxed mb-4">
            See why Hudson Valley homeowners trust TZ Electric for all their home comfort needs.
          </p>
          <Link
            href="/reviews"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline"
          >
            Read Our Reviews
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MOBILE ACCORDION ITEM
// ============================================

function MobileAccordion({
  label,
  href,
  children,
  onClose,
}: {
  label: string
  href: string
  children?: React.ReactNode
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  if (!children) {
    return (
      <Link
        href={href}
        onClick={onClose}
        className="flex items-center px-4 py-3.5 text-base font-medium text-navy hover:text-blue hover:bg-gray-50 rounded-xl transition-colors"
      >
        {label}
      </Link>
    )
  }

  return (
    <div>
      <div className="flex items-center rounded-xl hover:bg-gray-50 transition-colors">
        <Link
          href={href}
          onClick={onClose}
          className="flex-1 px-4 py-3.5 text-base font-medium text-navy hover:text-blue transition-colors"
        >
          {label}
        </Link>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-3 text-gray-500 hover:text-blue transition-colors"
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
        >
          <ChevronDown open={expanded} />
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-2 pl-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// MAIN HEADER COMPONENT
// ============================================

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Close mega menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mega menu on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveDropdown(null)
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleMouseEnter = useCallback((label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setActiveDropdown(label)
  }, [])

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }, [])

  const closeMega = useCallback(() => {
    setActiveDropdown(null)
  }, [])

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
  }, [])

  const dropdownItems = ['Services', 'Service Areas', 'About']

  return (
    <>
      {/* Top Bar */}
      <div className="bg-navy text-white text-sm">
        <div className="container-site flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="flex items-center gap-1.5 text-white hover:text-sky transition-colors"
            >
              <PhoneIcon />
              <span className="font-semibold">{COMPANY.phone}</span>
            </a>
            <span className="hidden sm:inline text-gray-400">|</span>
            <span className="hidden sm:inline text-gray-300">
              Serving the {COMPANY.serviceArea} Region
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-gray-300">
            <span>{COMPANY.hours.weekday} Mon-Fri</span>
            <span className="text-gray-500">|</span>
            <span className="text-amber-400 font-medium">24/7 Emergency Service</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <header ref={headerRef} className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-nav">
        <div className="container-site flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" onClick={closeMega}>
            <Image
              src="/images/logo/tz-logo-main.svg"
              alt="TZ Electric — Plumbing, Heating & Cooling"
              width={200}
              height={56}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const hasDropdown = dropdownItems.includes(item.label)
              return (
                <div
                  key={item.label}
                  onMouseEnter={() => hasDropdown ? handleMouseEnter(item.label) : setActiveDropdown(null)}
                  onMouseLeave={hasDropdown ? handleMouseLeave : undefined}
                >
                  <Link
                    href={item.href}
                    onClick={closeMega}
                    className={`
                      flex items-center gap-1 px-3 py-2 text-sm font-heading font-semibold rounded-lg transition-colors
                      ${activeDropdown === item.label
                        ? 'text-blue bg-sky/50'
                        : 'text-navy hover:text-blue hover:bg-gray-50'
                      }
                    `}
                  >
                    {item.label}
                    {hasDropdown && <ChevronDown open={activeDropdown === item.label} />}
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <a
              href={`tel:${COMPANY.phoneRaw}`}
              className="flex items-center gap-2 text-navy font-heading font-semibold text-sm hover:text-blue transition-colors"
            >
              <PhoneIcon />
              {COMPANY.phone}
            </a>
            <Button href={TYPEFORM_URL} external size="sm">
              Get a Free Quote
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-navy hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* ============================================
            MEGA MENU PANELS (Desktop)
           ============================================ */}
        <AnimatePresence>
          {activeDropdown && dropdownItems.includes(activeDropdown) && (
            <>
              {/* Backdrop */}
              <motion.div
                key="mega-backdrop"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 top-[var(--header-height,120px)] bg-black/10 z-40"
                onClick={closeMega}
                aria-hidden="true"
              />

              {/* Panel */}
              <motion.div
                key={`mega-${activeDropdown}`}
                variants={megaPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute left-0 right-0 top-full z-50 bg-white border-t border-gray-100 shadow-lg overflow-hidden"
                onMouseEnter={() => handleMouseEnter(activeDropdown)}
                onMouseLeave={handleMouseLeave}
              >
                {activeDropdown === 'Services' && <ServicesMegaPanel onClose={closeMega} />}
                {activeDropdown === 'Service Areas' && <ServiceAreasMegaPanel onClose={closeMega} />}
                {activeDropdown === 'About' && <AboutMegaPanel onClose={closeMega} />}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ============================================
            MOBILE MENU
           ============================================ */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed inset-x-0 top-[calc(var(--header-height,60px)+var(--topbar-height,40px))] bottom-0 bg-white z-50 overflow-y-auto border-t border-gray-100"
            >
              <nav className="container-site py-4 space-y-1">
                {/* Services */}
                <MobileAccordion label="Services" href="/services" onClose={closeMobile}>
                  <div className="space-y-0.5">
                    {MEGA_MENU_SERVICES.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-blue hover:bg-sky/40 rounded-lg transition-colors"
                      >
                        <span className="w-8 h-8 flex-shrink-0 rounded-lg bg-blue/10 text-blue flex items-center justify-center" aria-hidden="true">{service.icon}</span>
                        <div>
                          <span className="font-medium text-navy">{service.title}</span>
                          <span className="block text-xs text-gray-400">{service.description}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </MobileAccordion>

                {/* Service Areas */}
                <MobileAccordion label="Service Areas" href="/service-areas" onClose={closeMobile}>
                  <div className="space-y-3">
                    {SERVICE_AREA_COUNTIES.map((group) => (
                      <div key={group.county}>
                        <span className="block px-3 text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          {group.county}
                        </span>
                        {group.cities.map((city) => (
                          <Link
                            key={city.href}
                            href={city.href}
                            onClick={closeMobile}
                            className="block px-3 py-2 text-sm text-gray-600 hover:text-blue hover:bg-sky/40 rounded-lg transition-colors"
                          >
                            {city.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                    <Link
                      href="/service-areas"
                      onClick={closeMobile}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue hover:text-blue-dark transition-colors"
                    >
                      View All Areas
                      <ArrowRightIcon />
                    </Link>
                  </div>
                </MobileAccordion>

                {/* About */}
                <MobileAccordion label="About" href="/about-us" onClose={closeMobile}>
                  <div className="space-y-0.5">
                    {ABOUT_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-blue hover:bg-sky/40 rounded-lg transition-colors"
                      >
                        <span className="w-8 h-8 flex-shrink-0 rounded-lg bg-blue/10 text-blue flex items-center justify-center" aria-hidden="true">{link.icon}</span>
                        <span className="font-medium text-navy">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </MobileAccordion>

                {/* Direct Links */}
                <Link
                  href="/financing"
                  onClick={closeMobile}
                  className="flex items-center px-4 py-3.5 text-base font-medium text-navy hover:text-blue hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Financing
                </Link>
                <Link
                  href="/promotions"
                  onClick={closeMobile}
                  className="flex items-center px-4 py-3.5 text-base font-medium text-navy hover:text-blue hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Promotions
                </Link>

                {/* Mobile CTAs */}
                <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                  <a
                    href={`tel:${COMPANY.phoneRaw}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-navy text-white rounded-xl font-heading font-semibold text-base"
                  >
                    <PhoneIcon />
                    Call {COMPANY.phone}
                  </a>
                  <Button href={TYPEFORM_URL} external className="w-full" size="md">
                    Get a Free Quote
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
