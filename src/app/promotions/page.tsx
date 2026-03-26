import { COMPANY, TYPEFORM_URL } from '@/lib/constants'
import { createMetadata, getBreadcrumbSchema } from '@/lib/metadata'
import Button from '@/components/ui/Button'
import CTASection from '@/components/sections/CTASection'
import ElectricCursor from '@/components/effects/ElectricCursor'

export const metadata = createMetadata({
  title: 'Current Promotions & Deals | TZ Electric Inc | Hudson Valley',
  description: `Save on HVAC, electrical, plumbing, and generator services with current promotions from TZ Electric. Serving the Hudson Valley with ${COMPANY.reviews.count}+ 5-star reviews.`,
  path: '/promotions',
})

const promotions = [
  {
    title: 'Referral Reward Program',
    description: 'Refer a friend or neighbor to TZ Electric and you both save. Earn a credit toward your next service with no limit on referrals!',
    discount: '$100 Credit',
    details: 'Both you and your referral receive a $100 credit toward any TZ Electric service. Elite Signature Plan members receive $150.',
    expires: 'Ongoing',
    category: 'All Services',
  },
  {
    title: 'Single Zone Mini Split Installation',
    description: 'Keep your space comfortable year-round and save big! Perfect for individual rooms, home offices, or additions.',
    discount: '$750 Off',
    details: 'Limited-time offer on any single zone Mitsubishi mini split installation.',
    expires: 'Limited Time',
    category: 'Mini Splits',
  },
  {
    title: 'Multi Zone Mini Split Installation',
    description: 'Upgrade your whole-home comfort and save! Personalized temperature control across multiple rooms.',
    discount: '$1,000 Off',
    details: 'Any multi-zone Mitsubishi mini split system installation.',
    expires: 'Limited Time',
    category: 'Mini Splits',
  },
  {
    title: 'Standard Hot Water Heater Replacement',
    description: 'Hot water when you need it, now with extra savings! Limited-time pricing on standard water heater replacements.',
    discount: '$350 Off',
    details: 'Applies to standard tank water heater replacement.',
    expires: 'Limited Time',
    category: 'Hot Water Heaters',
  },
  {
    title: 'Hybrid Hot Water Heater',
    description: 'Energy-smart comfort with a hybrid heat pump water heater. Reduce your energy bills while enjoying endless hot water.',
    discount: '$500 Off',
    details: 'Applies to hybrid heat pump water heater installation.',
    expires: 'Limited Time',
    category: 'Hot Water Heaters',
  },
  {
    title: 'Service Upgrade (100-200 Amp)',
    description: 'Upgrade your home\'s power capacity to handle modern energy demands with confidence.',
    discount: '$450 Off',
    details: 'Applies to 100-to-200 amp electrical service panel upgrades.',
    expires: 'Limited Time',
    category: 'Electrical',
  },
  {
    title: 'Generator Purchase',
    description: 'Power up your peace of mind and save on a whole-home Generac generator.',
    discount: '$1,000 Off',
    details: 'Seasonal promotion. Contact us for current availability.',
    expires: 'Seasonal',
    category: 'Generators',
  },
  {
    title: 'Generator Replacement',
    description: 'Upgrade your backup power system with dependable, modern performance.',
    discount: '$500 Off',
    details: 'Applies to generator replacement and upgrade projects.',
    expires: 'Limited Time',
    category: 'Generators',
  },
]

export default function PromotionsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Promotions', url: '/promotions' },
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
              Special Offers
            </span>
            <h1 className="text-white text-4xl lg:text-5xl font-heading font-bold leading-tight mt-2">
              Current Promotions & Deals
            </h1>
            <p className="mt-4 text-gray-300 text-lg max-w-2xl">
              Take advantage of our current specials and save on the home services you need.
              Quality work at competitive prices.
            </p>
          </div>
        </div>
      </section>

      {/* Promotions Grid */}
      <section className="section-padding">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-8">
            {promotions.map((promo) => (
              <div key={promo.title} className="bg-white border-2 border-blue/15 rounded-2xl overflow-hidden shadow-sm hover:border-blue/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="bg-blue/5 px-6 py-3 flex items-center justify-between border-b border-gray-100">
                  <span className="text-blue text-sm font-semibold">{promo.category}</span>
                  <span className="text-xs text-gray-500">{promo.expires}</span>
                </div>
                <div className="p-6">
                  <div className="text-3xl font-bold text-navy">{promo.discount}</div>
                  <h2 className="font-heading font-bold text-navy text-xl mt-2">
                    {promo.title}
                  </h2>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                    {promo.description}
                  </p>
                  <p className="mt-3 text-gray-500 text-xs">
                    {promo.details}
                  </p>
                  <Button href={TYPEFORM_URL} external className="mt-4 !bg-accent hover:!bg-accent-dark" size="sm">
                    Claim This Offer
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
            <h2 className="font-heading font-bold text-navy text-2xl">
              Don&apos;t See What You Need?
            </h2>
            <p className="mt-2 text-gray-600 max-w-lg mx-auto">
              We frequently update our promotions. Contact us to ask about current deals
              or get a competitive quote for any service.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <Button href={`tel:${COMPANY.phoneRaw}`} variant="secondary">
                Call {COMPANY.phone}
              </Button>
              <Button href={TYPEFORM_URL} external>
                Get a Free Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  )
}
