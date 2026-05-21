'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  REFERRAL_SOURCES,
  SERVICES,
  findService,
  isQuestionVisible,
  type Question,
  type ServiceConfig,
} from './lead-form-config'
import {
  captureLeadTracking,
  readLeadTracking,
} from '@/lib/lead-tracking'
import { COMPANY } from '@/lib/constants'

type Ownership = 'homeowner' | 'renter' | ''

type FormState = {
  service?: ServiceConfig
  qualification: Record<string, string>
  firstName: string
  lastName: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  ownership: Ownership
  landlordName: string
  landlordPhone: string
  landlordEmail: string
  landlordPermission: boolean
  referralSource: string
  customerNotes: string
  smsConsent: boolean
}

const INITIAL_STATE: FormState = {
  qualification: {},
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: 'NY',
  zip: '',
  ownership: '',
  landlordName: '',
  landlordPhone: '',
  landlordEmail: '',
  landlordPermission: false,
  referralSource: '',
  customerNotes: '',
  smsConsent: false,
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10)
  if (digits.length < 4) return digits
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function isValidPhone(value: string): boolean {
  return value.replace(/\D/g, '').length === 10
}

function isValidEmail(value: string): boolean {
  if (!value) return true // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidZip(value: string): boolean {
  if (!value) return true // optional address
  return /^\d{5}(-\d{4})?$/.test(value)
}

type Props = {
  initialServiceKey?: string
}

export default function LeadForm({ initialServiceKey }: Props) {
  const router = useRouter()
  const initialService = useMemo(
    () => findService(initialServiceKey),
    [initialServiceKey],
  )

  const [step, setStep] = useState<1 | 2 | 3>(initialService ? 2 : 1)
  const [state, setState] = useState<FormState>({
    ...INITIAL_STATE,
    service: initialService,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    captureLeadTracking()
  }, [])

  // Wire browser history so back/forward step through the form instead of
  // leaving the /quote page. On mount we install a step:1 baseline beneath the
  // current entry; if the user landed at step 2 via ?service=, we layer step:2
  // on top so back from step 2 reaches the picker, not the referring page.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (initialService) {
      const fullUrl = url.toString()
      url.searchParams.delete('service')
      window.history.replaceState({ leadFormStep: 1 }, '', url.toString())
      window.history.pushState({ leadFormStep: 2 }, '', fullUrl)
    } else {
      window.history.replaceState({ leadFormStep: 1 }, '', url.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    function onPopState(e: PopStateEvent) {
      const histStep = (e.state as { leadFormStep?: number } | null)?.leadFormStep
      if (histStep === 1 || histStep === 2 || histStep === 3) {
        setStep(histStep)
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key as string]) return prev
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  function setQualification(id: string, value: string) {
    setState((prev) => {
      const nextQual: Record<string, string> = { ...prev.qualification, [id]: value }
      const service = prev.service
      if (service) {
        // Prune answers whose questions are now hidden (e.g. switching
        // propertyType from Residential to Commercial drops the residential
        // sub-questions). Fixed-point loop handles chains where a hidden
        // parent transitively hides a deeper child.
        let changed = true
        while (changed) {
          changed = false
          for (const q of service.questions) {
            if (q.id in nextQual && !isQuestionVisible(q, nextQual)) {
              delete nextQual[q.id]
              changed = true
            }
          }
        }
      }
      return { ...prev, qualification: nextQual }
    })
    setErrors((prev) => {
      if (!prev[`q_${id}`]) return prev
      const next = { ...prev }
      delete next[`q_${id}`]
      return next
    })
  }

  function pickService(service: ServiceConfig) {
    setState((prev) => ({
      ...prev,
      service,
      // Preserve answers if the user backed out and re-picked the same service.
      qualification: prev.service?.key === service.key ? prev.qualification : {},
    }))
    setStep(2)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('service', service.key)
      window.history.pushState({ leadFormStep: 2 }, '', url.toString())
    }
  }

  function goToStep3() {
    if (!validateStep2()) return
    setStep(3)
    if (typeof window !== 'undefined') {
      window.history.pushState({ leadFormStep: 3 }, '', window.location.href)
    }
  }

  function goBack() {
    if (typeof window !== 'undefined') {
      window.history.back()
    } else {
      setStep((prev) => (prev === 3 ? 2 : 1) as 1 | 2 | 3)
    }
  }

  function validateStep2(): boolean {
    const newErrors: Record<string, string> = {}
    const service = state.service
    if (!service) {
      newErrors.service = 'Please pick a service.'
    } else {
      service.questions.forEach((q) => {
        if (!isQuestionVisible(q, state.qualification)) return
        if (q.required && !state.qualification[q.id]) {
          newErrors[`q_${q.id}`] = 'Required'
        }
      })
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function validateStep3(): boolean {
    const newErrors: Record<string, string> = {}
    if (!state.firstName.trim()) newErrors.firstName = 'Required'
    if (!state.lastName.trim()) newErrors.lastName = 'Required'
    if (!isValidPhone(state.phone)) newErrors.phone = 'Enter a 10-digit phone.'
    if (!isValidEmail(state.email)) newErrors.email = 'Enter a valid email.'
    if (state.zip && !isValidZip(state.zip)) newErrors.zip = 'Enter a valid zip.'
    if (!state.ownership) newErrors.ownership = 'Pick one.'
    if (state.ownership === 'renter') {
      if (!state.landlordName.trim()) newErrors.landlordName = 'Required for renter inquiries.'
      if (!isValidPhone(state.landlordPhone)) newErrors.landlordPhone = 'Required, 10-digit phone.'
      if (!state.landlordPermission) newErrors.landlordPermission = 'Please confirm.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function submit() {
    if (!validateStep3()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const tracking = readLeadTracking()
      const res = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceKey: state.service?.key,
          serviceLabel: state.service?.label,
          qualification: state.qualification,
          firstName: state.firstName.trim(),
          lastName: state.lastName.trim(),
          email: state.email.trim() || undefined,
          phone: state.phone,
          street: state.street.trim() || undefined,
          city: state.city.trim() || undefined,
          state: state.state.trim() || 'NY',
          zip: state.zip.trim() || undefined,
          ownership: state.ownership,
          landlordName: state.landlordName.trim() || undefined,
          landlordPhone: state.landlordPhone || undefined,
          landlordEmail: state.landlordEmail.trim() || undefined,
          landlordPermission: state.landlordPermission,
          referralSource: state.referralSource || undefined,
          customerNotes: state.customerNotes.trim() || undefined,
          smsConsent: state.smsConsent,
          tracking,
        }),
      })

      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        leadId?: string | null
        channel?: string | null
        valueCents?: number | null
      }
      if (!res.ok || json.ok === false) {
        throw new Error(json.error || 'Submission failed.')
      }

      const params = new URLSearchParams({
        service: state.service?.label || '',
        serviceKey: state.service?.key || '',
        ownership: state.ownership,
      })
      if (json.leadId) params.set('leadId', json.leadId)
      if (json.channel) params.set('channel', json.channel)
      if (typeof json.valueCents === 'number') {
        params.set('value', (json.valueCents / 100).toFixed(2))
      }
      router.push(`/thank-you?${params.toString()}`)
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : 'Something went wrong. Please call us instead.',
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Stepper step={step} />

      <div className="mt-10 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl shadow-navy/5 sm:p-10">
        {step === 1 && <Step1Service onPick={pickService} />}

        {step === 2 && state.service && (
          <Step2Qualify
            service={state.service}
            qualification={state.qualification}
            errors={errors}
            onChange={setQualification}
            onCustomerNotesChange={(v) => update('customerNotes', v)}
            customerNotes={state.customerNotes}
            onBack={goBack}
            onNext={goToStep3}
          />
        )}

        {step === 3 && state.service && (
          <Step3Contact
            state={state}
            errors={errors}
            update={update}
            onBack={goBack}
            onSubmit={submit}
            submitting={submitting}
            submitError={submitError}
          />
        )}
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Prefer to talk?{' '}
        <a
          href={`tel:${COMPANY.phoneRaw}`}
          className="font-semibold text-blue hover:text-blue-dark"
        >
          {COMPANY.phone}
        </a>{' '}
        — we're glad to help over the phone.
      </p>
    </div>
  )
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: 'Service' },
    { n: 2, label: 'Quick details' },
    { n: 3, label: 'Contact info' },
  ]
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {items.map((item, i) => {
        const active = step === item.n
        const done = step > item.n
        return (
          <li key={item.n} className="flex items-center gap-2 sm:gap-4">
            <div
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                done ? 'border-blue bg-blue text-white' : active ? 'border-navy bg-navy text-white' : 'border-gray-300 bg-white text-gray-400',
              ].join(' ')}
            >
              {done ? '✓' : item.n}
            </div>
            <span
              className={[
                'hidden text-sm font-semibold sm:inline',
                active ? 'text-navy' : done ? 'text-blue' : 'text-gray-400',
              ].join(' ')}
            >
              {item.label}
            </span>
            {i < items.length - 1 && (
              <span className="h-px w-6 bg-gray-300 sm:w-12" aria-hidden />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function Step1Service({ onPick }: { onPick: (s: ServiceConfig) => void }) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
        What can we help you with?
      </h2>
      <p className="mt-2 text-gray-600">
        Pick the closest match. We'll ask a few quick questions next, then your contact info.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => onPick(s)}
            className="group flex flex-col items-start rounded-2xl border-2 border-gray-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue hover:shadow-lg focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2"
          >
            <span className="font-heading text-lg font-bold text-navy group-hover:text-blue">
              {s.label}
            </span>
            <span className="mt-1.5 text-sm text-gray-600">{s.blurb}</span>
            {s.priceFootnote && (
              <span className="mt-3 text-xs font-medium text-blue/80">
                {s.priceFootnote}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

type Step2Props = {
  service: ServiceConfig
  qualification: Record<string, string>
  errors: Record<string, string>
  onChange: (id: string, value: string) => void
  customerNotes: string
  onCustomerNotesChange: (v: string) => void
  onBack: () => void
  onNext: () => void
}

function Step2Qualify({
  service,
  qualification,
  errors,
  onChange,
  customerNotes,
  onCustomerNotesChange,
  onBack,
  onNext,
}: Step2Props) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-blue">
        {service.label}
      </p>
      <h2 className="mt-1 font-heading text-2xl font-bold text-navy sm:text-3xl">
        Tell us a bit about the project.
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Just a few quick questions. Skip anything you're not sure about.
      </p>

      <div className="mt-8 space-y-6">
        {service.questions
          .filter((q) => isQuestionVisible(q, qualification))
          .map((q) => (
            <QuestionField
              key={q.id}
              question={q}
              value={qualification[q.id] || ''}
              error={errors[`q_${q.id}`]}
              onChange={(v) => onChange(q.id, v)}
            />
          ))}

        <div>
          <label className="mb-2 block text-sm font-semibold text-navy">
            Anything else we should know? (optional)
          </label>
          <textarea
            value={customerNotes}
            onChange={(e) => onCustomerNotesChange(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-navy placeholder:text-gray-400 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
            placeholder="A few sentences if there's anything specific."
          />
        </div>
      </div>

      <FormNav onBack={onBack} onNext={onNext} nextLabel="Next: Contact info" />
    </div>
  )
}

function QuestionField({
  question,
  value,
  error,
  onChange,
}: {
  question: Question
  value: string
  error?: string
  onChange: (v: string) => void
}) {
  const baseLabel = (
    <label className="mb-2 block text-sm font-semibold text-navy">
      {question.label}
      {question.required && <span className="text-accent"> *</span>}
    </label>
  )

  if (question.type === 'select') {
    return (
      <div>
        {baseLabel}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            'w-full rounded-xl border bg-white p-3 text-sm text-navy focus:outline-none focus:ring-2',
            error ? 'border-danger focus:ring-danger/30' : 'border-gray-300 focus:border-blue focus:ring-blue/30',
          ].join(' ')}
        >
          <option value="">— select —</option>
          {question.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    )
  }

  if (question.type === 'radio') {
    return (
      <div>
        {baseLabel}
        <div className="flex flex-wrap gap-2">
          {question.options?.map((opt) => {
            const checked = value === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={[
                  'rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors',
                  checked
                    ? 'border-blue bg-blue text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue/50',
                ].join(' ')}
              >
                {opt}
              </button>
            )
          })}
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    )
  }

  if (question.type === 'textarea') {
    return (
      <div>
        {baseLabel}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={question.placeholder}
          className={[
            'w-full rounded-xl border bg-white p-3 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2',
            error ? 'border-danger focus:ring-danger/30' : 'border-gray-300 focus:border-blue focus:ring-blue/30',
          ].join(' ')}
        />
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      {baseLabel}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        className={[
          'w-full rounded-xl border bg-white p-3 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2',
          error ? 'border-danger focus:ring-danger/30' : 'border-gray-300 focus:border-blue focus:ring-blue/30',
        ].join(' ')}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}

type Step3Props = {
  state: FormState
  errors: Record<string, string>
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  onBack: () => void
  onSubmit: () => void
  submitting: boolean
  submitError: string | null
}

function Step3Contact({
  state,
  errors,
  update,
  onBack,
  onSubmit,
  submitting,
  submitError,
}: Step3Props) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
        How can we reach you?
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        We'll follow up within one business day. Active leaks and emergencies are flagged for immediate response.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <TextField
          label="First name"
          required
          value={state.firstName}
          onChange={(v) => update('firstName', v)}
          error={errors.firstName}
          autoComplete="given-name"
        />
        <TextField
          label="Last name"
          required
          value={state.lastName}
          onChange={(v) => update('lastName', v)}
          error={errors.lastName}
          autoComplete="family-name"
        />
        <TextField
          label="Phone"
          required
          value={state.phone}
          onChange={(v) => update('phone', formatPhone(v))}
          error={errors.phone}
          autoComplete="tel"
          inputMode="tel"
          placeholder="(555) 555-5555"
        />
        <TextField
          label="Email"
          value={state.email}
          onChange={(v) => update('email', v)}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
          type="email"
          placeholder="you@example.com"
        />
        <TextField
          className="sm:col-span-2"
          label="Service address (street)"
          value={state.street}
          onChange={(v) => update('street', v)}
          autoComplete="street-address"
        />
        <TextField
          label="City"
          value={state.city}
          onChange={(v) => update('city', v)}
          autoComplete="address-level2"
        />
        <div className="grid grid-cols-2 gap-3 sm:col-span-1">
          <TextField
            label="State"
            value={state.state}
            onChange={(v) => update('state', v.toUpperCase().slice(0, 2))}
            autoComplete="address-level1"
          />
          <TextField
            label="Zip"
            value={state.zip}
            onChange={(v) => update('zip', v.replace(/[^\d-]/g, '').slice(0, 10))}
            error={errors.zip}
            autoComplete="postal-code"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-sm font-semibold text-navy">
          Are you the homeowner or renting? <span className="text-accent">*</span>
        </p>
        <div className="mt-2 flex gap-2">
          {(['homeowner', 'renter'] as const).map((opt) => {
            const checked = state.ownership === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => update('ownership', opt)}
                className={[
                  'rounded-full border-2 px-5 py-2 text-sm font-semibold transition-colors',
                  checked
                    ? 'border-blue bg-blue text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue/50',
                ].join(' ')}
              >
                {opt === 'homeowner' ? "I'm the homeowner" : "I'm renting"}
              </button>
            )
          })}
        </div>
        {errors.ownership && (
          <p className="mt-1 text-xs text-danger">{errors.ownership}</p>
        )}
      </div>

      {state.ownership === 'renter' && (
        <div className="mt-6 rounded-2xl border border-warning/30 bg-amber-50/50 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
            One quick step for renters
          </p>
          <p className="mt-1 text-sm text-amber-900">
            For work on the property, we'll need to verify with your landlord before booking. We'll reach out to them directly.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TextField
              className="sm:col-span-2"
              label="Landlord name"
              required
              value={state.landlordName}
              onChange={(v) => update('landlordName', v)}
              error={errors.landlordName}
            />
            <TextField
              label="Landlord phone"
              required
              value={state.landlordPhone}
              onChange={(v) => update('landlordPhone', formatPhone(v))}
              error={errors.landlordPhone}
              inputMode="tel"
              placeholder="(555) 555-5555"
            />
            <TextField
              label="Landlord email"
              value={state.landlordEmail}
              onChange={(v) => update('landlordEmail', v)}
              type="email"
              inputMode="email"
            />
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm text-amber-900">
            <input
              type="checkbox"
              checked={state.landlordPermission}
              onChange={(e) => update('landlordPermission', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-amber-400 text-blue focus:ring-blue"
            />
            <span>
              I have my landlord's permission for this work / they've authorized the visit.
            </span>
          </label>
          {errors.landlordPermission && (
            <p className="mt-1 text-xs text-danger">{errors.landlordPermission}</p>
          )}
        </div>
      )}

      <div className="mt-8">
        <label className="mb-2 block text-sm font-semibold text-navy">
          How did you hear about us? (optional)
        </label>
        <select
          value={state.referralSource}
          onChange={(e) => update('referralSource', e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-navy focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
        >
          <option value="">— select —</option>
          {REFERRAL_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={state.smsConsent}
            onChange={(e) => update('smsConsent', e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-400 text-blue focus:ring-blue"
          />
          <span className="text-sm text-gray-700">
            <span className="font-semibold text-navy">
              Text me updates about my service request. (optional)
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-gray-600">
              By checking this box, I agree to receive SMS text messages from TZ Electric, including
              messages from our smart assistant Claire, about my service request, appointment
              confirmations, technician dispatch, and follow-ups. Message frequency varies. Message
              and data rates may apply. Reply <strong>STOP</strong> to unsubscribe at any time,{' '}
              <strong>HELP</strong> for help. See our{' '}
              <a href="/privacy-policy" className="font-semibold text-blue hover:underline">
                Privacy Policy
              </a>{' '}
              for details. No mobile information will be shared with third parties for marketing.
            </span>
          </span>
        </label>
      </div>

      {submitError && (
        <div className="mt-6 rounded-xl border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          <strong>We couldn't submit your request.</strong> {submitError} Please call us at{' '}
          <a href={`tel:${COMPANY.phoneRaw}`} className="font-semibold underline">
            {COMPANY.phone}
          </a>
          .
        </div>
      )}

      <FormNav
        onBack={onBack}
        onNext={onSubmit}
        nextLabel={submitting ? 'Sending...' : 'Send my request'}
        nextDisabled={submitting}
      />

      <p className="mt-6 text-center text-xs text-gray-400">
        By submitting, you agree to be contacted by TZ Electric about your request. We never sell your info.
      </p>
    </div>
  )
}

function TextField({
  label,
  required,
  value,
  onChange,
  error,
  autoComplete,
  inputMode,
  type = 'text',
  placeholder,
  className,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (v: string) => void
  error?: string
  autoComplete?: string
  inputMode?: 'tel' | 'email' | 'numeric' | 'text'
  type?: 'text' | 'email' | 'tel'
  placeholder?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-navy">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        className={[
          'w-full rounded-xl border bg-white p-3 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2',
          error ? 'border-danger focus:ring-danger/30' : 'border-gray-300 focus:border-blue focus:ring-blue/30',
        ].join(' ')}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}

function FormNav({
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: {
  onBack: () => void
  onNext: () => void
  nextLabel: string
  nextDisabled?: boolean
}) {
  return (
    <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-navy hover:bg-gray-100"
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-blue px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-blue-dark hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {nextLabel} →
      </button>
    </div>
  )
}
