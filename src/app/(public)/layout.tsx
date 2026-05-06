import type { Metadata } from 'next'
import { COMPANY } from '@/lib/constants'
import { getLocalBusinessSchema } from '@/lib/metadata'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/effects/ScrollToTop'
import FloatingCTA from '@/components/ui/FloatingCTA'
import ClaireFloatingBubble from '@/components/claire/ClaireFloatingBubble'
import PublicAnalytics from '@/components/analytics/PublicAnalytics'

export const metadata: Metadata = {
  title: {
    default: `${COMPANY.name} | ${COMPANY.tagline} | ${COMPANY.serviceArea}`,
    template: `%s | ${COMPANY.name}`,
  },
  description: `${COMPANY.name} provides expert cooling, heating, electrical, plumbing, and generator services in the ${COMPANY.serviceArea} region. ${COMPANY.reviews.count}+ five-star Google reviews. Call ${COMPANY.phone}.`,
  keywords: [
    'plumber near me',
    'HVAC contractor Hudson Valley',
    'electrician Catskill NY',
    'mini split installation',
    'Generac generator dealer',
    'emergency plumber',
    'heating repair',
    'air conditioning',
  ],
  authors: [{ name: COMPANY.name }],
  creator: COMPANY.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: COMPANY.name,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
  },
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const localBusinessSchema = getLocalBusinessSchema()

  return (
    <>
      <PublicAnalytics />

      {/* LocalBusiness JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />

      <ScrollToTop />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingCTA />
      <ClaireFloatingBubble />
    </>
  )
}
