import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TZ Switchboard — TZ Electric',
  description: 'Internal operations and AI agent control center.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
}

export default function SwitchboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-navy text-white border-b border-navy-light">
        <div className="container-site py-4 flex items-center justify-between">
          <Link href="/switchboard" className="flex items-baseline gap-3 group">
            <span className="text-xs uppercase tracking-[0.2em] text-blue-light/70 font-mono">
              TZ Electric
            </span>
            <span className="text-white font-semibold text-lg group-hover:text-blue-light transition-colors">
              TZ Switchboard
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Back to public site
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
