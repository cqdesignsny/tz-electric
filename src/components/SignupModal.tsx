'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlanPricing, BillingFrequency } from '@/lib/signature-plans-data'

export interface SignupPlan {
  name: string
  slug: string
  pricing: PlanPricing[]
}

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  plan: SignupPlan | null
  title?: string
  returnPath?: string
}

export default function SignupModal({ isOpen, onClose, plan, title = 'TZ SIGNATURE PLAN', returnPath = '/signature-plans' }: SignupModalProps) {
  const [frequency, setFrequency] = useState<BillingFrequency>(plan?.pricing[0]?.frequency ?? 'monthly')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('NY')
  const [zip, setZip] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!plan) return null

  // TypeScript narrowing: plan is guaranteed non-null below this point,
  // but closures don't inherit narrowing. Use a const to satisfy TS.
  const currentPlan = plan

  const selectedPricing = currentPlan.pricing.find((p) => p.frequency === frequency)

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  function handlePhoneChange(value: string) {
    setPhone(formatPhone(value))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 10) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }
    if (zip.replace(/\D/g, '').length < 5) {
      setError('Please enter a valid 5-digit ZIP code.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug: currentPlan.slug,
          frequency,
          returnPath,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phoneDigits,
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zip: zip.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="bg-navy px-6 py-5 text-center">
              <p className="text-blue-200 text-sm font-heading font-semibold uppercase tracking-wide">
                {title}
              </p>
              <h2 className="text-white text-2xl font-heading font-bold mt-1">
                {currentPlan.name}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Billing frequency */}
              <div>
                <label className="block text-sm font-heading font-semibold text-navy mb-2">
                  Billing Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {currentPlan.pricing.map((p) => (
                    <button
                      key={p.frequency}
                      type="button"
                      onClick={() => setFrequency(p.frequency)}
                      className={`px-3 py-3 rounded-lg text-center transition-all border-2 ${
                        frequency === p.frequency
                          ? 'border-blue bg-blue/5 text-navy'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-xs font-heading font-semibold">{p.label}</span>
                      <span className="block text-lg font-heading font-bold mt-0.5">
                        ${p.amount.toLocaleString()}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {p.suffix}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-heading font-semibold text-navy mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-navy focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-heading font-semibold text-navy mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-navy focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-heading font-semibold text-navy mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-navy focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-colors"
                  placeholder="(845) 555-1234"
                />
              </div>

              {/* Address */}
              <div>
                <label htmlFor="street" className="block text-sm font-heading font-semibold text-navy mb-1">
                  Street Address
                </label>
                <input
                  id="street"
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-navy focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-colors"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-6 gap-3">
                <div className="col-span-3">
                  <label htmlFor="city" className="block text-sm font-heading font-semibold text-navy mb-1">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-navy focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-colors"
                    placeholder="Catskill"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="state" className="block text-sm font-heading font-semibold text-navy mb-1">
                    State
                  </label>
                  <input
                    id="state"
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    maxLength={2}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-navy text-center focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="zip" className="block text-sm font-heading font-semibold text-navy mb-1">
                    ZIP Code
                  </label>
                  <input
                    id="zip"
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    maxLength={5}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm text-navy focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-colors"
                    placeholder="12414"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-accent text-white font-heading font-semibold text-base hover:bg-accent-dark transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    {selectedPricing && (
                      <span className="text-white/80">
                        &mdash; ${selectedPricing.amount.toLocaleString()}{selectedPricing.suffix}
                      </span>
                    )}
                  </>
                )}
              </button>

              {selectedPricing?.isRecurring && (
                <p className="text-center text-xs text-gray-500 leading-relaxed">
                  By continuing, you authorize TZ Electric, Inc. to charge your payment
                  method on a recurring {selectedPricing.frequency === 'monthly' || selectedPricing.frequency === '3year' ? 'monthly' : 'yearly'} basis
                  at the rate shown above. Your plan renews automatically until canceled.
                  You may cancel at any time by contacting us. <a href="/signature-plans#terms" className="underline hover:text-navy">Cancellation terms</a> apply.
                </p>
              )}

              <p className="text-center text-xs text-gray-400">
                Secure payment powered by Stripe. Your card information never touches our servers.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
