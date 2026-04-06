'use client'

import { useState } from 'react'
import SignupModal from '@/components/SignupModal'
import type { SignupPlan } from '@/components/SignupModal'

const TEST_PLAN: SignupPlan = {
  name: 'Test Plan',
  slug: 'test-plan',
  pricing: [
    {
      frequency: 'monthly',
      label: 'Test ($1)',
      suffix: '',
      amount: 1,
      stripePriceId: 'price_1TJGh6GstwohZtDfcsm9n6Wa',
      isRecurring: false,
      hcpTemplateName: 'TEST - Plan Signup Test',
      hcpBillingCycle: 'Monthly',
    },
  ],
}

export default function TestSignupPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-heading font-bold text-navy mb-2">
          Signup Flow Test
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          This is a hidden test page. Charges $1.00 to test the full flow:
          form → Stripe → HCP customer creation + tagging.
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="px-8 py-3 rounded-full bg-accent text-white font-heading font-semibold hover:bg-accent-dark transition-colors"
        >
          Test Sign Up ($1)
        </button>
      </div>

      <SignupModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        plan={TEST_PLAN}
        title="TEST SIGNUP"
        returnPath="/test-signup"
      />
    </div>
  )
}
