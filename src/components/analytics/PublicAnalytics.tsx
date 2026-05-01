import { ANALYTICS } from '@/lib/constants'

/**
 * Public-site analytics bundle: GTM, GA4 + Google Ads, Facebook Pixel,
 * Hotjar. Included in (public)/layout.tsx and claire/layout.tsx so visit
 * tracking works wherever the visitor lands. Switchboard does NOT load
 * these — it's an internal surface and analytics there would be noise.
 */
export default function PublicAnalytics() {
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
    </>
  )
}
