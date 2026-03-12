import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Cookie Policy | TZ Electric Inc',
  description: 'Learn about how TZ Electric Inc uses cookies and similar tracking technologies on our website.',
  path: '/cookies',
})

export default function CookiePolicyPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Cookie Policy', url: '/cookies' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="bg-navy py-12">
        <div className="container-site">
          <h1 className="text-white text-3xl lg:text-4xl font-heading font-bold">
            Cookie Policy
          </h1>
          <p className="mt-2 text-gray-300 text-sm">Last updated: March 2026</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-site max-w-3xl prose prose-gray prose-headings:font-heading prose-headings:text-navy">
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They help the
            website remember your preferences and improve your browsing experience.
          </p>

          <h2>How We Use Cookies</h2>
          <p>Our website uses the following types of cookies:</p>

          <h3>Essential Cookies</h3>
          <p>
            Required for basic website functionality. These cannot be disabled.
          </p>

          <h3>Analytics Cookies</h3>
          <p>
            We use Google Analytics (GA4) and Hotjar to understand how visitors use our website.
            This helps us improve our content and user experience.
          </p>

          <h3>Marketing Cookies</h3>
          <p>
            We use Google Ads and Facebook Pixel to deliver relevant advertisements and measure
            the effectiveness of our marketing campaigns.
          </p>

          <h2>Third-Party Cookies</h2>
          <p>
            Some cookies are placed by third-party services that appear on our pages, including
            Google (Analytics, Ads, Maps), Facebook, Hotjar, and Typeform.
          </p>

          <h2>Managing Cookies</h2>
          <p>
            You can control and manage cookies through your browser settings. Most browsers allow
            you to refuse or delete cookies. Note that disabling cookies may affect website functionality.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about our cookie practices? Contact us at{' '}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </p>
        </div>
      </section>
    </>
  )
}
