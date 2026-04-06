import { COMPANY } from '@/lib/constants'
import { createMetadata } from '@/lib/metadata'
import Button from '@/components/ui/Button'

export const metadata = createMetadata({
  title: 'Welcome to Your Generator Maintenance Plan | TZ Electric',
  description: 'Your generator maintenance plan enrollment is confirmed. We will be in touch shortly to schedule your first service visit.',
  path: '/maintenance/success',
})

export default function MaintenanceSuccessPage() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-site max-w-2xl text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-navy text-3xl lg:text-4xl font-heading font-bold">
          Welcome to Your Generator Maintenance Plan!
        </h1>

        <p className="mt-4 text-gray-600 text-lg leading-relaxed">
          Your payment has been processed successfully. Our team will be in touch
          shortly to schedule your first generator service visit.
        </p>

        <div className="mt-4 bg-white rounded-2xl border-2 border-blue/15 p-6 text-left">
          <h2 className="font-heading font-bold text-navy text-lg mb-3">What Happens Next</h2>
          <ul className="space-y-3">
            {[
              'You will receive a confirmation email with your plan details.',
              'Our team will contact you to schedule your first generator maintenance visit.',
              'Enjoy priority service, proactive care, and peace of mind for your backup power system.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue/10 text-blue flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700 text-sm">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/" size="md">
            Back to Home
          </Button>
          <Button
            href={`tel:${COMPANY.phoneRaw}`}
            variant="secondary"
            size="md"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            Call Us: {COMPANY.phone}
          </Button>
        </div>
      </div>
    </section>
  )
}
