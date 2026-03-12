import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Accessibility Statement | TZ Electric Inc',
  description: 'TZ Electric Inc is committed to making our website accessible to all users. Read our accessibility statement.',
  path: '/accessibility-statement',
})

export default function AccessibilityPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Accessibility Statement', url: '/accessibility-statement' },
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
            Accessibility Statement
          </h1>
          <p className="mt-2 text-gray-300 text-sm">Last updated: March 2026</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-site max-w-3xl prose prose-gray prose-headings:font-heading prose-headings:text-navy">
          <h2>Our Commitment</h2>
          <p>
            {COMPANY.name} is committed to ensuring digital accessibility for people of all abilities.
            We continually improve the user experience for everyone and apply relevant accessibility
            standards.
          </p>

          <h2>Standards</h2>
          <p>
            We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
            These guidelines help make web content more accessible to people with disabilities.
          </p>

          <h2>Measures We Take</h2>
          <ul>
            <li>Semantic HTML for proper document structure</li>
            <li>Alt text for images</li>
            <li>Sufficient color contrast ratios</li>
            <li>Keyboard navigation support</li>
            <li>Responsive design for all screen sizes</li>
            <li>Clear and consistent navigation</li>
            <li>Descriptive link text</li>
          </ul>

          <h2>Feedback</h2>
          <p>
            We welcome your feedback on the accessibility of our website. If you encounter
            accessibility barriers or have suggestions for improvement, please contact us:
          </p>
          <p>
            Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a><br />
            Phone: <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a><br />
            Address: {COMPANY.address.full}
          </p>
          <p>
            We aim to respond to accessibility feedback within 5 business days.
          </p>
        </div>
      </section>
    </>
  )
}
