import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import Button from '@/components/ui/Button'

export default function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-blue to-blue-dark text-white">
      <div className="container-site text-center max-w-3xl mx-auto">
        <h2 className="font-heading font-bold text-white text-3xl md:text-4xl">
          Ready for Reliable Home Services?
        </h2>
        <p className="mt-4 text-blue-100 text-lg">
          Get a free, no-obligation quote from our expert team. We&apos;ll assess your
          needs and provide an upfront price. No surprises, no hidden fees.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button
            href={TYPEFORM_URL}
            external
            size="lg"
            className="!bg-accent !text-white hover:!bg-accent-dark shadow-lg"
          >
            Get a Free Quote
          </Button>
          <Button
            href={`tel:${COMPANY.phoneRaw}`}
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-blue"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            Call {COMPANY.phone}
          </Button>
        </div>

        <p className="mt-6 text-blue-200 text-sm">
          {COMPANY.financing.join(' & ')} financing available. 24/7 emergency service.
        </p>
      </div>
    </section>
  )
}
