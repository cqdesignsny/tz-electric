'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { SECTIONS, type Question, type Section } from './questions'

const STORAGE_KEY = 'tz-agent-training-v1'

type Answers = Record<string, string | string[]>

type Persisted = {
  answers: Answers
  currentSection: number
  filledBy: string
  savedAt: string
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'submitted'; deliveredByEmail: boolean }
  | { kind: 'error'; message: string }

export default function QuestionnaireForm() {
  const [hydrated, setHydrated] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [filledBy, setFilledBy] = useState('')
  const [savedLabel, setSavedLabel] = useState<string>('')
  const [reviewMode, setReviewMode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: 'idle' })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Persisted
        setAnswers(parsed.answers || {})
        setFilledBy(parsed.filledBy || '')
        if (typeof parsed.currentSection === 'number') {
          setCurrentSection(Math.min(parsed.currentSection, SECTIONS.length - 1))
        }
        if (parsed.savedAt) {
          setSavedLabel(formatSavedLabel(new Date(parsed.savedAt)))
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const payload: Persisted = {
      answers,
      currentSection,
      filledBy,
      savedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      setSavedLabel(formatSavedLabel(new Date()))
    } catch {
      // ignore quota errors
    }
  }, [answers, currentSection, filledBy, hydrated])

  const setAnswer = useCallback((id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  const completedCount = useMemo(() => {
    let total = 0
    let answered = 0
    for (const section of SECTIONS) {
      for (const q of section.questions) {
        total += 1
        if (isAnswered(answers[q.id])) answered += 1
      }
    }
    return { total, answered }
  }, [answers])

  const handleReset = () => {
    if (!confirm('Clear all answers and start over? This cannot be undone.')) return
    localStorage.removeItem(STORAGE_KEY)
    setAnswers({})
    setFilledBy('')
    setCurrentSection(0)
    setReviewMode(false)
  }

  const handleDownload = () => {
    const md = buildMarkdown(answers, filledBy)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tz-agent-training-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    const md = buildMarkdown(answers, filledBy)
    try {
      await navigator.clipboard.writeText(md)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      alert('Could not copy to clipboard. Use Download instead.')
    }
  }

  const handleSubmit = async () => {
    setSubmitState({ kind: 'submitting' })
    const markdown = buildMarkdown(answers, filledBy)
    try {
      const res = await fetch('/api/agent-training/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown, filledBy, answers }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Submission failed')
      }
      setSubmitState({
        kind: 'submitted',
        deliveredByEmail: Boolean(data.delivered),
      })
    } catch (err) {
      setSubmitState({
        kind: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Something went wrong. Try Copy as a backup.',
      })
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading…</div>
      </div>
    )
  }

  const section = SECTIONS[currentSection]
  const isLast = currentSection === SECTIONS.length - 1

  return (
    <div>
      {/* Header banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 font-mono mb-1">
                AI Agents
              </div>
              <h1 className="text-navy text-2xl md:text-3xl font-bold">
                Agent Training Questionnaire
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl text-sm md:text-base">
                Answer what you can. Skip anything you are not sure about. Your
                answers save automatically as you type. When you finish, hit
                Submit and your responses route directly to Cesar at CQ Studio.
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl md:text-3xl font-bold text-navy tabular-nums">
                {completedCount.answered}
                <span className="text-gray-400 text-lg">
                  /{completedCount.total}
                </span>
              </div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mt-1">
                Answered
              </div>
            </div>
          </div>

          {/* Filled-by + saved indicator */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              value={filledBy}
              onChange={(e) => setFilledBy(e.target.value)}
              placeholder="Who is filling this out? (e.g. Tyler, Terry)"
              className="bg-gray-50 text-charcoal placeholder-gray-400 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent w-full sm:max-w-xs"
            />
            <div className="text-xs text-gray-500">
              {savedLabel ? `Auto-saved · ${savedLabel}` : 'Not saved yet'}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{
                width: `${(completedCount.answered / completedCount.total) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 md:px-8 py-8 md:py-10 max-w-6xl">
        {!reviewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            {/* Section nav */}
            <aside className="lg:sticky lg:top-6 self-start">
              <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
                Sections
              </div>
              <ol className="space-y-1">
                {SECTIONS.map((s, idx) => {
                  const sectionAnswered = s.questions.filter((q) =>
                    isAnswered(answers[q.id]),
                  ).length
                  const sectionTotal = s.questions.length
                  const isCurrent = idx === currentSection
                  const complete = sectionAnswered === sectionTotal
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => setCurrentSection(idx)}
                        className={`w-full text-left rounded-md px-3 py-2.5 text-sm transition-colors flex items-start gap-3 ${
                          isCurrent
                            ? 'bg-navy text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center text-[10px] font-bold ${
                            complete
                              ? 'bg-success border-success text-white'
                              : isCurrent
                                ? 'border-white text-white'
                                : 'border-gray-300 text-gray-400'
                          }`}
                        >
                          {complete ? '✓' : idx + 1}
                        </span>
                        <span className="flex-1">
                          <span className="block font-medium leading-tight">
                            {s.title}
                          </span>
                          <span
                            className={`block text-xs mt-0.5 ${
                              isCurrent ? 'text-blue-light/80' : 'text-gray-500'
                            }`}
                          >
                            {sectionAnswered}/{sectionTotal} done
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>

              <button
                onClick={() => setReviewMode(true)}
                className="mt-4 w-full text-left rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <span className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 text-[10px] font-bold">
                  →
                </span>
                <span className="font-medium">Review &amp; Submit</span>
              </button>
            </aside>

            {/* Questions */}
            <main>
              <SectionView
                section={section}
                answers={answers}
                onAnswer={setAnswer}
              />

              <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
                <button
                  onClick={() =>
                    setCurrentSection((i) => Math.max(0, i - 1))
                  }
                  disabled={currentSection === 0}
                  className="px-5 py-2.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                {isLast ? (
                  <button
                    onClick={() => setReviewMode(true)}
                    className="px-6 py-2.5 rounded-md text-sm font-semibold bg-accent text-white hover:bg-accent-dark transition-colors"
                  >
                    Review &amp; Submit →
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setCurrentSection((i) =>
                        Math.min(SECTIONS.length - 1, i + 1),
                      )
                    }
                    className="px-6 py-2.5 rounded-md text-sm font-semibold bg-blue text-white hover:bg-blue-dark transition-colors"
                  >
                    Next Section →
                  </button>
                )}
              </div>
            </main>
          </div>
        ) : (
          <ReviewView
            answers={answers}
            filledBy={filledBy}
            onBack={() => setReviewMode(false)}
            onSubmit={handleSubmit}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onReset={handleReset}
            copied={copied}
            submitState={submitState}
            answered={completedCount.answered}
            total={completedCount.total}
            onJumpToSection={(idx) => {
              setCurrentSection(idx)
              setReviewMode(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

function SectionView({
  section,
  answers,
  onAnswer,
}: {
  section: Section
  answers: Answers
  onAnswer: (id: string, value: string | string[]) => void
}) {
  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-blue font-semibold mb-2">
          {section.id}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3">
          {section.title}
        </h2>
        <p className="text-gray-600 leading-relaxed max-w-3xl">{section.intro}</p>
      </div>

      <div className="space-y-6">
        {section.questions.map((q) => (
          <QuestionField
            key={q.id}
            question={q}
            value={answers[q.id]}
            onChange={(value) => onAnswer(q.id, value)}
          />
        ))}
      </div>
    </div>
  )
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question
  value: string | string[] | undefined
  onChange: (value: string | string[]) => void
}) {
  const baseInput =
    'w-full bg-white border border-gray-300 rounded-md px-4 py-2.5 text-sm text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-light focus:border-transparent transition'

  const renderInput = () => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className={baseInput}
          />
        )
      case 'long_text':
        return (
          <textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className={`${baseInput} resize-y min-h-[100px]`}
          />
        )
      case 'currency_range':
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || 'e.g. $200-$500'}
            className={baseInput}
          />
        )
      case 'yes_no':
        return (
          <div className="flex gap-2">
            {['Yes', 'No', 'Sometimes'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
                  value === opt
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )
      case 'yes_no_detail': {
        const composite = (value as string) || ''
        const yn = composite.startsWith('Yes')
          ? 'Yes'
          : composite.startsWith('No')
            ? 'No'
            : ''
        const detail = composite.replace(/^(Yes|No)\s*[—\-:]?\s*/, '')
        const update = (newYn: string, newDetail: string) => {
          if (!newYn && !newDetail) onChange('')
          else if (!newDetail) onChange(newYn)
          else onChange(`${newYn || ''} — ${newDetail}`.trim())
        }
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              {['Yes', 'No'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => update(opt, detail)}
                  className={`px-4 py-2 rounded-md text-sm font-medium border transition ${
                    yn === opt
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <textarea
              value={detail}
              onChange={(e) => update(yn, e.target.value)}
              placeholder="Add details, context, or exceptions"
              rows={3}
              className={`${baseInput} resize-y min-h-[80px]`}
            />
          </div>
        )
      }
      case 'single_select':
        return (
          <div className="space-y-2">
            {question.options?.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition ${
                  value === opt.value
                    ? 'border-blue bg-sky'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  className="mt-0.5 accent-blue"
                />
                <span className="text-sm text-charcoal">{opt.label}</span>
              </label>
            ))}
          </div>
        )
      case 'multi_select': {
        const arr = (Array.isArray(value) ? value : []) as string[]
        const toggle = (v: string) => {
          if (arr.includes(v)) onChange(arr.filter((x) => x !== v))
          else onChange([...arr, v])
        }
        return (
          <div className="space-y-2">
            {question.options?.map((opt) => {
              const checked = arr.includes(opt.value)
              return (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition ${
                    checked
                      ? 'border-blue bg-sky'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt.value)}
                    className="mt-0.5 accent-blue"
                  />
                  <span className="text-sm text-charcoal">{opt.label}</span>
                </label>
              )
            })}
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 md:p-6">
      <label className="block text-base font-semibold text-navy mb-1">
        {question.label}
      </label>
      {question.hint && (
        <p className="text-sm text-gray-500 mb-3">{question.hint}</p>
      )}
      <div className="mt-3">{renderInput()}</div>
    </div>
  )
}

function ReviewView({
  answers,
  filledBy,
  onBack,
  onSubmit,
  onCopy,
  onDownload,
  onReset,
  copied,
  submitState,
  answered,
  total,
  onJumpToSection,
}: {
  answers: Answers
  filledBy: string
  onBack: () => void
  onSubmit: () => void
  onCopy: () => void
  onDownload: () => void
  onReset: () => void
  copied: boolean
  submitState: SubmitState
  answered: number
  total: number
  onJumpToSection: (idx: number) => void
}) {
  const isSubmitting = submitState.kind === 'submitting'
  const isSubmitted = submitState.kind === 'submitted'
  const hasError = submitState.kind === 'error'

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3">
          Thanks{filledBy ? `, ${filledBy.split(' ')[0]}` : ''}
        </h2>
        <p className="text-gray-600 leading-relaxed mb-2">
          Your answers were submitted to CQ Studio. Cesar will use them to build
          out the AI agents.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          {submitState.deliveredByEmail
            ? 'Email delivery confirmed.'
            : 'Saved on the server. Email delivery will catch up when configured.'}
        </p>
        <button
          onClick={onBack}
          className="text-sm text-blue hover:text-blue-dark font-medium"
        >
          ← Back to questions
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm text-gray-600 hover:text-charcoal mb-6"
      >
        ← Back to questions
      </button>

      <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">
        Review &amp; Submit
      </h2>
      <p className="text-gray-600 mb-6">
        {answered} of {total} answered{filledBy ? ` · Filled by ${filledBy}` : ''}.
        When you hit Submit, the answers route directly to Cesar at CQ Studio.
        No download or email needed.
      </p>

      {/* Submit + fallback buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 md:p-6 mb-8">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full px-5 py-4 rounded-md bg-accent text-white text-base font-semibold hover:bg-accent-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting…' : 'Submit to CQ Studio'}
        </button>

        {hasError && (
          <div className="mt-3 text-sm text-danger bg-danger/5 border border-danger/20 rounded-md px-4 py-3">
            {submitState.message} Use Copy as a backup.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button
            onClick={onCopy}
            className="flex-1 px-4 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
          >
            {copied ? 'Copied' : 'Copy as backup'}
          </button>
          <button
            onClick={onDownload}
            className="flex-1 px-4 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition"
          >
            Download Markdown
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          Your answers stay saved in this browser, so you can come back later if
          you missed anything.
        </p>
      </div>

      {/* Per-section summary */}
      <div className="space-y-4">
        {SECTIONS.map((section, idx) => {
          const sectionAnswered = section.questions.filter((q) =>
            isAnswered(answers[q.id]),
          ).length
          const sectionTotal = section.questions.length
          const complete = sectionAnswered === sectionTotal
          return (
            <div
              key={section.id}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        complete
                          ? 'bg-success text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {complete ? '✓' : idx + 1}
                    </span>
                    <h3 className="font-semibold text-navy">{section.title}</h3>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {sectionAnswered} of {sectionTotal} answered
                  </div>
                </div>
                <button
                  onClick={() => onJumpToSection(idx)}
                  className="text-sm text-blue hover:text-blue-dark font-medium"
                >
                  Edit →
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reset */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-danger underline"
        >
          Clear all answers and start over
        </button>
      </div>
    </div>
  )
}

function isAnswered(value: string | string[] | undefined): boolean {
  if (value === undefined || value === null) return false
  if (Array.isArray(value)) return value.length > 0
  return value.trim().length > 0
}

function formatSavedLabel(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function buildMarkdown(answers: Answers, filledBy: string): string {
  const lines: string[] = []
  lines.push('# TZ Electric — AI Agent Training Questionnaire')
  lines.push('')
  lines.push(`**Filled by:** ${filledBy || '(not provided)'}`)
  lines.push(`**Submitted:** ${new Date().toLocaleString()}`)
  lines.push('')
  lines.push('---')
  lines.push('')

  for (const section of SECTIONS) {
    lines.push(`## ${section.title}`)
    lines.push('')
    for (const q of section.questions) {
      const raw = answers[q.id]
      lines.push(`### ${q.label}`)
      if (q.hint) lines.push(`*${q.hint}*`)
      lines.push('')
      if (!isAnswered(raw)) {
        lines.push('_(no answer)_')
      } else if (Array.isArray(raw)) {
        const labelMap = new Map(
          (q.options || []).map((o) => [o.value, o.label]),
        )
        for (const v of raw) {
          lines.push(`- ${labelMap.get(v) || v}`)
        }
      } else if (q.type === 'single_select') {
        const label = q.options?.find((o) => o.value === raw)?.label || raw
        lines.push(label)
      } else {
        lines.push(String(raw))
      }
      lines.push('')
    }
    lines.push('---')
    lines.push('')
  }

  return lines.join('\n')
}
