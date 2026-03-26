import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Terms & Conditions | TZ Electric Inc',
  description: 'Read the terms and conditions for TZ Electric Inc services and website usage.',
  path: '/terms-condition',
})

export default function TermsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Terms & Conditions', url: '/terms-condition' },
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
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-gray-300 text-sm">Last updated: March 2026</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-site max-w-3xl prose prose-gray prose-headings:font-heading prose-headings:text-navy">
          <h2>Agreement to Terms</h2>
          <p>
            By accessing and using the {COMPANY.name} website and services, you agree to be bound by these
            Terms and Conditions. If you do not agree, please do not use our website or services.
          </p>

          <h2>Services</h2>
          <p>
            {COMPANY.name} provides cooling, heating, electrical, plumbing, generator, and related home services
            in the {COMPANY.serviceArea} area. All services are subject to availability and our standard
            service agreements.
          </p>

          <h2>Quotes and Pricing</h2>
          <p>
            All quotes provided are estimates and may be subject to change based on actual conditions
            found during the service. Final pricing will be confirmed before work begins. We provide
            transparent, upfront pricing whenever possible.
          </p>

          <h2>Warranties</h2>
          <p>
            Our work is backed by manufacturer warranties on equipment and our own workmanship guarantee.
            Specific warranty terms vary by service and will be provided in your service agreement.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, and images, is the property
            of {COMPANY.name} and is protected by copyright laws.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            {COMPANY.name} shall not be liable for any indirect, incidental, special, or consequential
            damages arising from your use of our website or services, except as required by applicable law.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of New York. Any disputes shall be resolved
            in the courts of New York State.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or call{' '}
            <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>.
          </p>
        </div>
      </section>
    </>
  )
}
