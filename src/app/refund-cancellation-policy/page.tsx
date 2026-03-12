import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Refund & Cancellation Policy | TZ Electric Inc',
  description: 'Review TZ Electric Inc refund and cancellation policy for home services including HVAC, electrical, plumbing, and generator work.',
  path: '/refund-cancellation-policy',
})

export default function RefundPolicyPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Refund & Cancellation Policy', url: '/refund-cancellation-policy' },
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
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-2 text-gray-300 text-sm">Last updated: March 2026</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-site max-w-3xl prose prose-gray prose-headings:font-heading prose-headings:text-navy">
          <h2>Service Cancellation</h2>
          <p>
            We understand that plans change. You may cancel or reschedule a service appointment
            at no charge by contacting us at least 24 hours before the scheduled appointment time.
          </p>
          <p>
            Cancellations made less than 24 hours before a scheduled appointment may be subject
            to a cancellation fee to cover the cost of reserved time and travel.
          </p>

          <h2>Satisfaction Guarantee</h2>
          <p>
            Your satisfaction is our priority. If you are not satisfied with our work, please
            contact us within 30 days of service completion. We will work with you to resolve
            any issues, which may include re-performing the work at no additional cost.
          </p>

          <h2>Refund Policy</h2>
          <p>
            Refund eligibility depends on the nature of the service performed:
          </p>
          <ul>
            <li>
              <strong>Service calls and diagnostics:</strong> Non-refundable once the technician
              has arrived and performed the assessment.
            </li>
            <li>
              <strong>Equipment and materials:</strong> Refunds for equipment may be available if
              the equipment has not been installed. Restocking fees may apply.
            </li>
            <li>
              <strong>Installation services:</strong> If work quality does not meet agreed-upon
              standards, we will re-do the work or provide a partial refund.
            </li>
          </ul>

          <h2>Warranty Claims</h2>
          <p>
            Equipment failures covered under manufacturer warranty will be handled through
            the warranty process at no additional cost. Our workmanship guarantee covers
            labor for the duration specified in your service agreement.
          </p>

          <h2>How to Request a Refund</h2>
          <p>
            To request a refund or discuss a service concern, please contact us:
          </p>
          <p>
            Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a><br />
            Phone: <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>
          </p>
          <p>
            Please include your service date, invoice number, and a description of the issue.
            We will respond within 3 business days.
          </p>
        </div>
      </section>
    </>
  )
}
