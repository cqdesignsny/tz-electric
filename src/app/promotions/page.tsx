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
    description: 'Refer a friend or neighbor to TZ Electric and you both save. Earn a credit toward your next service — no limit on referrals!',
    discount: '$100 Credit',
    details: 'Both you and your referral receive a $100 credit toward any TZ Electric service. Elite Signature Plan members receive $150.',
    expires: 'Ongoing',
    category: 'All Services',
  },
  {
    title: 'Spring HVAC Tune-Up Special',
    description: 'Get your heating and cooling system ready for the season with our comprehensive tune-up service.',
    discount: '$49',
    details: 'Regular price $129. Includes full system inspection, filter replacement, and performance check.',
    expires: 'Limited Time Offer',
    category: 'HVAC',
  },
  {
    title: 'Free Generator Estimate',
    description: 'Storm season is here. Thinking about a whole-home generator? Get a free in-home estimate and system sizing consultation.',
    discount: 'FREE',
    details: 'Includes load analysis, placement planning, and detailed quote. No obligation.',
    expires: 'Ongoing',
    category: 'Generators',
  },
  {
    title: 'Mini Split Installation Rebate',
    description: 'Save big on a Mitsubishi ductless mini split system. Rebates available through manufacturer and utility programs.',
    discount: 'Up to $2,000 Off',
    details: 'Combine manufacturer rebates with utility incentives for maximum savings. Ask about NYSERDA rebates.',
    expires: 'While Funds Last',
    category: 'Mini Splits',
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
              <div key={promo.title} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
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
                  <Button href={TYPEFORM_URL} external className="mt-4" size="sm">
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
