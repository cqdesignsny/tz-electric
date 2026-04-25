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
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
}
