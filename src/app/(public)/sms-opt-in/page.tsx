import Link from 'next/link'
import { COMPANY } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'SMS Text Messaging Program & Opt-In | TZ Electric Inc',
  description:
    'How to opt in to text messages from TZ Electric, the exact consent language, message types, frequency, rates, and how to get HELP or reply STOP to opt out.',
  path: '/sms-opt-in',
})

export default function SmsOptInPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'SMS Text Messaging Program', url: '/sms-opt-in' },
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
            SMS Text Messaging Program
          </h1>
          <p className="mt-2 text-gray-300 text-sm">{COMPANY.name} Customer Messaging &middot; Last updated: June 2026</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-site max-w-3xl space-y-8 text-gray-700 leading-relaxed">
          <p>
            {COMPANY.name} operates an SMS program (&ldquo;{COMPANY.name} Customer Messaging&rdquo;)
            that sends transactional and informational text messages to customers who have opted in.
            This page explains how to opt in, the consent language we use, what messages you will
            receive, and how to get help or opt out.
          </p>

          {/* How to opt in */}
          <div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-3">How to opt in</h2>
            <p className="mb-3">You can opt in to receive SMS messages from {COMPANY.name} in any of three ways:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                <strong>Online form.</strong> Submit our quote or contact form at{' '}
                <Link href="/quote" className="font-semibold text-blue hover:underline">
                  tzelectricinc.com/quote
                </Link>{' '}
                and check the SMS consent box shown below. The box is <strong>unchecked by default</strong>;
                checking it is your express opt-in.
              </li>
              <li>
                <strong>By phone.</strong> Verbally agree to SMS follow-up during a call with our
                office or our smart assistant Claire. Your consent is logged in our system.
              </li>
              <li>
                <strong>By text.</strong> Text our published number first to start a conversation
                with us.
              </li>
            </ol>
          </div>

          {/* The exact consent CTA shown on the form */}
          <div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-3">
              The consent checkbox on our form
            </h2>
            <p className="mb-3">
              This is the exact opt-in checkbox and language presented on our online form at{' '}
              <Link href="/quote" className="font-semibold text-blue hover:underline">/quote</Link>:
            </p>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-400 bg-white text-[10px] text-gray-400"
                >
                  ☐
                </span>
                <span className="text-sm text-gray-700">
                  <span className="font-semibold text-navy block">
                    Text me updates about my service request. (optional)
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-600">
                    By checking this box, I agree to receive SMS text messages from TZ Electric,
                    including messages from our smart assistant Claire, about my service request,
                    appointment confirmations, technician dispatch, and follow-ups. Message frequency
                    varies. Message and data rates may apply. Reply <strong>STOP</strong> to
                    unsubscribe at any time, <strong>HELP</strong> for help. No mobile information
                    will be shared with third parties for marketing.
                  </span>
                </span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/quote"
                className="inline-flex items-center px-6 py-3 bg-blue text-white font-heading font-semibold rounded-full hover:bg-blue-dark transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Go to the opt-in form
              </Link>
            </div>
          </div>

          {/* Message types */}
          <div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-3">What messages you&apos;ll receive</h2>
            <p>
              Appointment confirmations, technician dispatch updates, estimate follow-ups, replies to
              questions you text us (handled by our smart assistant Claire), and occasional service or
              maintenance reminders. We do <strong>not</strong> send marketing or promotional messages
              without your prior express consent.
            </p>
          </div>

          {/* Frequency */}
          <div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-3">Message frequency</h2>
            <p>
              Message frequency varies based on your service request and our ongoing communication.
              There is no fixed cadence. Most customers receive messages only when there is a relevant
              update, such as an appointment confirmation or a technician arrival notice.
            </p>
          </div>

          {/* Rates */}
          <div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-3">Message and data rates</h2>
            <p>
              Message and data rates may apply depending on your mobile carrier and plan. {COMPANY.name}{' '}
              does not charge for SMS messages, but your wireless carrier may. Contact your carrier for
              details about your plan.
            </p>
          </div>

          {/* Help */}
          <div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-3">Help</h2>
            <p>
              Reply <strong>HELP</strong> to any message you receive from us, email{' '}
              <a href={`mailto:${COMPANY.email}`} className="font-semibold text-blue hover:underline">
                {COMPANY.email}
              </a>
              , or call{' '}
              <a href={`tel:${COMPANY.phoneRaw}`} className="font-semibold text-blue hover:underline">
                {COMPANY.phone}
              </a>
              .
            </p>
          </div>

          {/* Opt out */}
          <div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-3">How to opt out</h2>
            <p>
              You can cancel SMS messages at any time by replying <strong>STOP</strong> (or STOPALL,
              UNSUBSCRIBE, CANCEL, END, or QUIT) to any message you receive from us. After you reply
              STOP, you will receive one confirmation message and then no further SMS from this program.
              Reply <strong>START</strong> to opt back in at any time.
            </p>
          </div>

          {/* Privacy */}
          <div>
            <h2 className="font-heading font-bold text-navy text-2xl mb-3">Privacy</h2>
            <p>
              No mobile information (including phone numbers and SMS opt-in data) will be shared with
              third parties or affiliates for marketing or promotional purposes. See our{' '}
              <Link href="/privacy-policy" className="font-semibold text-blue hover:underline">
                Privacy Policy
              </Link>{' '}
              and the full{' '}
              <Link href="/terms-condition" className="font-semibold text-blue hover:underline">
                SMS Program Terms &amp; Conditions
              </Link>{' '}
              for complete details.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
