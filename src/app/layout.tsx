import type { Metadata } from 'next'
import { Montserrat, Manrope } from 'next/font/google'
import './globals.css'
import { COMPANY } from '@/lib/constants'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: COMPANY.name,
    template: `%s | ${COMPANY.name}`,
  },
  metadataBase: new URL('https://tzelectricinc.com'),
}

// Pinned to initial-scale=1 so the layout always renders at the actual
// device width. We deliberately do NOT set maximum-scale=1 / user-
// scalable=no — that breaks accessibility (visitors with low vision
// rely on pinch-zoom). The "input zoom on tap" issue iOS Safari does
// is fixed at the input level by giving every input/textarea a 16px
// minimum font-size (in globals.css), which is what triggers the
// platform's auto-zoom behavior.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen flex flex-col overflow-x-clip">{children}</body>
    </html>
  )
}
