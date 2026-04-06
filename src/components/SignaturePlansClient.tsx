'use client'

import { useState } from 'react'
import { COMPANY } from '@/lib/constants'
import type { Plan } from '@/lib/signature-plans-data'
import SignupModal from '@/components/SignupModal'

interface SignaturePlansClientProps {
  plans: Plan[]
}

export default function SignaturePlansClient({ plans }: SignaturePlansClientProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  function handleSignUp(plan: Plan) {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.slug}
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
              plan.highlighted
                ? 'bg-blue text-white shadow-xl ring-2 ring-blue scale-[1.02]'
                : 'bg-white text-navy border-2 border-gray-200 shadow-card hover:shadow-card-hover'
            }`}
          >
            {plan.badge && (
              <div className="absolute top-0 right-0 bg-amber-400 text-navy text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-bl-lg">
                {plan.badge}
              </div>
            )}

            <div className="p-8">
              <h3 className={`font-heading font-bold text-2xl ${plan.highlighted ? 'text-white' : 'text-navy'}`}>
                {plan.name}
              </h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span className={`text-5xl font-heading font-bold ${plan.highlighted ? 'text-white' : 'text-blue'}`}>
                  ${plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                  /month
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${plan.highlighted ? 'bg-white/10' : 'bg-blue/5'}`}>
                  <span className={`text-sm font-medium ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>Prepaid Yearly</span>
                  <span className={`text-lg font-heading font-bold ${plan.highlighted ? 'text-white' : 'text-navy'}`}>
                    ${plan.prepaidYearly}<span className="text-xs font-normal">/yr</span>
                  </span>
                </div>
                <div className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${plan.highlighted ? 'bg-white/10' : 'bg-blue/5'}`}>
                  <span className={`text-sm font-medium ${plan.highlighted ? 'text-blue-100' : 'text-gray-600'}`}>Prepaid 3-Year</span>
                  <span className={`text-lg font-heading font-bold ${plan.highlighted ? 'text-white' : 'text-navy'}`}>
                    ${plan.prepaid3Year.toLocaleString()}<span className="text-xs font-normal">/3yr</span>
                  </span>
                </div>
              </div>

              <hr className={`my-6 ${plan.highlighted ? 'border-blue-400/30' : 'border-gray-200'}`} />

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-success'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-sm ${plan.highlighted ? 'text-white' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-2">
                <button
                  onClick={() => handleSignUp(plan)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-heading font-semibold text-sm transition-colors bg-accent text-white hover:bg-accent-dark cursor-pointer"
                >
                  Sign Up Online
                </button>
                <a
                  href={`tel:${COMPANY.phoneRaw}`}
                  className={`w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-heading font-semibold text-xs transition-colors ${
                    plan.highlighted
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-gray-100 text-navy hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Or Call to Enroll
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SignupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
      />
    </>
  )
}
