import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Contact TZ Electric Inc | Get a Free Quote | Hudson Valley',
  description: `Contact TZ Electric for a free quote on plumbing, HVAC, electrical, and generator services in the Hudson Valley. Call ${COMPANY.phone} or request a quote online.`,
  path: '/contact-us',
})

const contactMethods = [
  {
    title: 'Call Us',
    description: 'Speak directly with our team',
    detail: COMPANY.phone,
    href: `tel:${COMPANY.phoneRaw}`,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    title: 'Email Us',
    description: 'We respond within 24 hours',
    detail: COMPANY.email,
    href: `mailto:${COMPANY.email}`,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: 'Visit Us',
    description: 'Our office location',
    detail: COMPANY.address.full,
    href: `https://maps.google.com/?q=${encodeURIComponent(COMPANY.address.full)}`,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
]

export default function ContactPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url: '/contact-us' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-navy py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(37, 99, 235, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)',
          }} />
        </div>
        <ElectricCursor />
        <div className="container-site relative z-10">
          <div className="max-w-3xl">
            <span className="text-blue-light text-sm font-semibold uppercase tracking-wider">
              Contact Us
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              Get in Touch with TZ Electric
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              Ready for a free quote? Have a question about our services?
              We&apos;re here to help. Reach out today.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods + Form */}
      <section className="section-padding">
        <div className="container-site">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h2 className="font-heading font-bold text-navy text-2xl">
                  Reach Out Anytime
                </h2>
                <p className="mt-2 text-gray-600">
                  Whether you need a routine service or emergency repair,
                  our team is ready to help.
                </p>
              </div>

              {contactMethods.map((method) => (
                <a
                  key={method.title}
                  href={method.href}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue/5 transition-colors group"
                >
                  <div className="w-12 h-12 bg-blue/10 rounded-lg flex items-center justify-center text-blue flex-shrink-0 group-hover:bg-blue group-hover:text-white transition-colors">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy">{method.title}</h3>
                    <p className="text-gray-500 text-sm">{method.description}</p>
                    <p className="text-blue font-medium text-sm mt-1">{method.detail}</p>
                  </div>
                </a>
              ))}

              {/* Hours */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-navy mb-3">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium text-navy">{COMPANY.hours.weekday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium text-navy">{COMPANY.hours.saturday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium text-navy">{COMPANY.hours.sunday}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  24/7 emergency service available. Call anytime for urgent repairs.
                </p>
              </div>
            </div>

            {/* Quote Form CTA */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 lg:p-10">
                <h2 className="font-heading font-bold text-navy text-2xl">
                  Request a Free Quote
                </h2>
                <p className="mt-2 text-gray-600">
                  Fill out our quick form and we&apos;ll get back to you with a free,
                  no-obligation quote within 24 hours.
                </p>

                <div className="mt-8 bg-gray-50 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-blue/10 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-navy text-lg mt-4">
                    Quick & Easy Quote Request
                  </h3>
                  <p className="mt-2 text-gray-600 text-sm max-w-md mx-auto">
                    Tell us about your project and we&apos;ll provide a detailed estimate.
                    Most quotes delivered within 24 hours.
                  </p>
                  <Button href={TYPEFORM_URL} external size="lg" className="mt-6">
                    Start Your Free Quote
                  </Button>
                </div>

                <div className="mt-8 grid sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-navy">{COMPANY.reviews.count}+</p>
                    <p className="text-gray-500 text-sm">5-Star Reviews</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy">20+</p>
                    <p className="text-gray-500 text-sm">Years Experience</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy">24/7</p>
                    <p className="text-gray-500 text-sm">Emergency Service</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-gray-50 py-12">
        <div className="container-site">
          <div className="bg-gray-200 rounded-xl aspect-[21/9] flex items-center justify-center">
            <span className="text-gray-400 text-sm">Google Map Embed</span>
          </div>
        </div>
      </section>
    </>
  )
}
