'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/switchboard'
  const errorParam = searchParams.get('error')

  const [password, setPassword] = useState('')
  const [error, setError] = useState(
    errorParam === 'AccessDenied'
      ? 'Your Google account is not on the TZ team. Ask an owner to invite you, or use the admin password.'
      : '',
  )
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError('')
    await signIn('google', { callbackUrl: next })
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
            Sign in with your @tzelectricinc.com account.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-md border border-gray-300 bg-white text-charcoal text-base font-semibold hover:border-blue hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleLogo />
            {googleLoading ? 'Redirecting…' : 'Sign in with Google'}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-gray-400">
            <div className="flex-1 h-px bg-gray-200" />
            <span>or admin password</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit}>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Transition fallback for pre-Google sessions"
              className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-3 text-base text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition"
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
              {loading ? 'Signing in…' : 'Sign in with password'}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-5 text-center leading-relaxed">
            Need access? Ask Tyler or Terry to invite your TZ Electric email.
          </p>
        </div>

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

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.18c-.27 1.43-1.07 2.65-2.28 3.46v2.87h3.69C21.6 18.83 23 15.83 23 12.27z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.08 0 5.66-1.02 7.55-2.77l-3.69-2.87c-1.02.69-2.34 1.1-3.86 1.1-2.97 0-5.49-2.01-6.39-4.71H1.8v2.96C3.68 20.34 7.55 23 12 23z"
      />
      <path
        fill="#FBBC04"
        d="M5.61 13.75c-.23-.69-.36-1.43-.36-2.18s.13-1.49.36-2.18V6.43H1.8C1.04 7.94.6 9.62.6 11.4s.44 3.46 1.2 4.97l3.81-2.62z"
      />
      <path
        fill="#EA4335"
        d="M12 4.51c1.68 0 3.18.58 4.36 1.71l3.27-3.27C17.66 1.31 14.96.4 12 .4 7.55.4 3.68 3.06 1.8 6.43l3.81 2.96c.9-2.7 3.42-4.88 6.39-4.88z"
      />
    </svg>
  )
}
