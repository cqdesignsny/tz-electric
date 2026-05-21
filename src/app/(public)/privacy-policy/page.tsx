import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Privacy Policy | TZ Electric Inc',
  description: 'Read the privacy policy for TZ Electric Inc. Learn how we collect, use, share, and protect your personal information, including SMS messaging consent and opt-out.',
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
          <p className="mt-2 text-gray-300 text-sm">Last updated: May 2026</p>
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

          <h2>SMS and Text Messaging Communications</h2>
          <p>
            {COMPANY.name} sends and receives SMS (text) messages to communicate with customers about service
            requests, appointment confirmations, technician dispatch updates, estimate follow-ups, and replies
            to questions you send us by text. Our AI smart assistant Claire may send messages on our behalf.
          </p>
          <h3>How You Opt In</h3>
          <p>
            You consent to receive SMS messages from {COMPANY.name} when you do any of the following:
          </p>
          <ul>
            <li>Submit our online quote, contact, or service-request form on this website and check the SMS
              consent box.</li>
            <li>Verbally agree to SMS follow-up during a phone call with our office or our smart assistant.</li>
            <li>Initiate a text conversation by sending an SMS to one of our published numbers.</li>
          </ul>
          <h3>Message Frequency, Rates, and Help</h3>
          <p>
            Message frequency varies based on your service request and our ongoing communication with you.
            Message and data rates may apply depending on your mobile carrier and plan. For help, reply
            <strong> HELP</strong> to any message from us, email{' '}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>, or call{' '}
            <a href={`tel:${COMPANY.phoneRaw}`}>{COMPANY.phone}</a>.
          </p>
          <h3>How to Opt Out</h3>
          <p>
            You may opt out of SMS messages from {COMPANY.name} at any time by replying{' '}
            <strong>STOP</strong> (or STOPALL, UNSUBSCRIBE, CANCEL, END, or QUIT) to any message you receive
            from us. After you opt out, we will send one confirmation message and then stop sending you SMS.
            You may opt back in at any time by replying <strong>START</strong> or by contacting us.
          </p>
          <h3>Mobile Information Sharing</h3>
          <p>
            <strong>
              No mobile information (including phone numbers and SMS opt-in data) will be shared with third
              parties or affiliates for marketing or promotional purposes.
            </strong>{' '}
            Information sharing related to SMS is limited to subcontractors and service providers that support
            the messaging service itself (for example, our messaging platform Twilio and our scheduling
            platform Housecall Pro), and only to the extent necessary to deliver the messages you have
            requested.
          </p>

          <h2>Sharing Your Information</h2>
          <p>
            We do not sell your personal information. We may share your information with trusted service providers
            who assist in operating our website and services, including our scheduling platform (Housecall Pro),
            our messaging platform (Twilio), analytics providers, and marketing tools.
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
