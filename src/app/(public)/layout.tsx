import type { Metadata } from 'next'
import { COMPANY, ANALYTICS } from '@/lib/constants'
import { getLocalBusinessSchema } from '@/lib/metadata'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ScrollToTop from '@/components/effects/ScrollToTop'
import FloatingCTA from '@/components/ui/FloatingCTA'

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
      {/* GTM noscript (must be early in body) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${ANALYTICS.gtm}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>

      {/* Google Tag Manager */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${ANALYTICS.gtm}');`,
        }}
      />

      {/* Google Analytics 4 + Google Ads */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${ANALYTICS.ga4}');
gtag('config','${ANALYTICS.googleAds}');`,
        }}
      />

      {/* Facebook Pixel */}
      <script
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${ANALYTICS.facebookPixel}');
fbq('track','PageView');`,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${ANALYTICS.facebookPixel}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* Hotjar */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(h,o,t,j,a,r){
h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
h._hjSettings={hjid:${ANALYTICS.hotjar},hjsv:6};
a=o.getElementsByTagName('head')[0];
r=o.createElement('script');r.async=1;
r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
        }}
      />

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
    </>
  )
}
