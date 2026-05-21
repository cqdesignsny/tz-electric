import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Terms & Conditions | TZ Electric Inc',
  description: 'Read the terms and conditions for TZ Electric Inc services, website usage, and SMS messaging program.',
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
          <p className="mt-2 text-gray-300 text-sm">Last updated: May 2026</p>
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

          <h2>SMS / Text Messaging Program Terms</h2>
          <h3>Program Name and Description</h3>
          <p>
            <strong>Program Name:</strong> {COMPANY.name} Customer Messaging. {COMPANY.name} operates an SMS
            program that sends transactional and informational text messages to customers who have opted in.
            Messages include appointment confirmations, technician dispatch updates, estimate follow-ups,
            replies to questions you send us by text, and occasional service or maintenance reminders. Our
            smart assistant Claire may send messages on our behalf as part of this program.
          </p>
          <h3>How to Opt In</h3>
          <p>
            You may opt in by (1) submitting our online quote or contact form at{' '}
            <a href="/quote">tzelectricinc.com/quote</a> and checking the SMS consent box, (2) verbally
            agreeing to SMS follow-up during a phone call with our office or our smart assistant, or
            (3) initiating a text conversation with one of our published numbers. By opting in, you agree
            to receive recurring text messages from {COMPANY.name} at the mobile number you provided.
          </p>
          <h3>Message Frequency</h3>
          <p>
            Message frequency varies based on your service request and our ongoing communication with you.
            There is no fixed cadence. Most customers receive messages only when there is a relevant update
            (for example, an appointment confirmation or a technician arrival notice).
          </p>
          <h3>Message and Data Rates</h3>
          <p>
            Message and data rates may apply depending on your mobile carrier and plan. {COMPANY.name}
            does not charge for SMS messages, but your wireless carrier may. Please contact your carrier
            for details about your plan.
          </p>
          <h3>Help</h3>
          <p>
            For help with our SMS program, reply <strong>HELP</strong> to any message you receive from
            us, email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>, or call{' '}
            <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>.
          </p>
          <h3>How to Opt Out</h3>
          <p>
            You may cancel SMS messages from {COMPANY.name} at any time by replying{' '}
            <strong>STOP</strong> (or STOPALL, UNSUBSCRIBE, CANCEL, END, or QUIT) to any message you
            receive from us. After you reply STOP, you will receive one confirmation message and then no
            further SMS from this program. You may opt back in at any time by replying{' '}
            <strong>START</strong> or by contacting us.
          </p>
          <h3>Supported Carriers</h3>
          <p>
            Our SMS program supports all major U.S. carriers, including AT&amp;T, T-Mobile, Verizon
            Wireless, Sprint, U.S. Cellular, Boost, MetroPCS, Cricket, and others. Carriers are not
            liable for delayed or undelivered messages.
          </p>
          <h3>Mobile Information Sharing</h3>
          <p>
            No mobile information (including phone numbers and SMS opt-in data) will be shared with third
            parties or affiliates for marketing or promotional purposes. See our{' '}
            <a href="/privacy-policy">Privacy Policy</a> for full details on how we handle your data.
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
