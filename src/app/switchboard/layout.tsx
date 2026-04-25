import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'TZ Switchboard',
    template: '%s | TZ Switchboard',
  },
  description:
    'Internal operations and AI agent control center for TZ Electric.',
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

export default function SwitchboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
