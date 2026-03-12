import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Privacy Policy | TZ Electric Inc',
  description: 'Read the privacy policy for TZ Electric Inc. Learn how we collect, use, and protect your personal information.',
  path: '/privacy-policy',
})

export default function PrivacyPolicyPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy-policy' },
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
            Privacy Policy
          </h1>
          <p className="mt-2 text-gray-300 text-sm">Last updated: March 2026</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-site max-w-3xl prose prose-gray prose-headings:font-heading prose-headings:text-navy">
          <h2>Introduction</h2>
          <p>
            {COMPANY.name} (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy
            and is committed to protecting your personal information. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you visit our website or use our services.
          </p>

          <h2>Information We Collect</h2>
          <p>We may collect information about you in the following ways:</p>
          <h3>Personal Data</h3>
          <p>
            When you contact us, request a quote, or schedule service, we may collect your name, email address,
            phone number, mailing address, and information about your service request.
          </p>
          <h3>Usage Data</h3>
          <p>
            We automatically collect certain information when you visit our website, including your IP address,
            browser type, operating system, referring URLs, and pages viewed. We use Google Analytics, Google Tag
            Manager, and similar tools to collect this data.
          </p>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain our services</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Schedule and manage service appointments</li>
            <li>Send you service-related communications</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Sharing Your Information</h2>
          <p>
            We do not sell your personal information. We may share your information with trusted service providers
            who assist in operating our website and services, including our scheduling platform (Housecall Pro),
            analytics providers, and marketing tools.
          </p>

          <h2>Cookies and Tracking</h2>
          <p>
            Our website uses cookies and similar tracking technologies. For more information, please see our{' '}
            <a href="/cookies">Cookie Policy</a>.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information.
            However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2>Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal information by contacting
            us at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            {COMPANY.name}<br />
            {COMPANY.address.full}<br />
            Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a><br />
            Phone: <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>
          </p>
        </div>
      </section>
    </>
  )
}
