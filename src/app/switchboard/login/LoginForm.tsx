'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/switchboard'
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/switchboard/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setError(data.error || 'Could not log in')
        setLoading(false)
        return
      }
      router.replace(next)
      router.refresh()
    } catch {
      setError('Network error. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-blue-light/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="/images/logo/tz-logo-main.svg"
            alt="TZ Electric"
            width={180}
            height={50}
            className="h-12 w-auto mx-auto brightness-0 invert"
            priority
          />
          <div className="mt-6 text-xs uppercase tracking-[0.25em] text-blue-light/80 font-mono">
            Internal
          </div>
          <h1 className="text-white text-2xl font-bold mt-2">TZ Switchboard</h1>
          <p className="text-gray-400 text-sm mt-2">
            Sign in to access the control center.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-2xl p-6 md:p-8"
        >
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-charcoal mb-2"
          >
            Admin Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-3 text-base text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition"
            required
          />

          {error && (
            <div className="mt-3 text-sm text-danger bg-danger/5 border border-danger/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || password.length === 0}
            className="mt-5 w-full px-5 py-3 rounded-md bg-accent text-white text-base font-semibold hover:bg-accent-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
            Don&apos;t have the password? Ask Cesar at CQ Studio.
          </p>
        </form>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Back to public site
          </a>
        </div>
      </div>
    </div>
  )
}
