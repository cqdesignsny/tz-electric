import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  SESSION_TTL_SECONDS,
  SWITCHBOARD_COOKIE,
  createSessionToken,
} from '@/lib/switchboard-auth'

export async function POST(request: Request) {
  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request' },
      { status: 400 },
    )
  }

  const expected = process.env.SWITCHBOARD_PASSWORD
  if (!expected) {
    console.error(
      '[switchboard/auth/login] SWITCHBOARD_PASSWORD not set',
    )
    return NextResponse.json(
      { ok: false, error: 'Login is not configured yet' },
      { status: 503 },
    )
  }

  if (typeof body.password !== 'string' || body.password.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Password is required' },
      { status: 400 },
    )
  }

  const supplied = body.password
  if (supplied.length !== expected.length) {
    return NextResponse.json(
      { ok: false, error: 'Wrong password' },
      { status: 401 },
    )
  }
  let mismatch = 0
  for (let i = 0; i < supplied.length; i++) {
    mismatch |= supplied.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  if (mismatch !== 0) {
    return NextResponse.json(
      { ok: false, error: 'Wrong password' },
      { status: 401 },
    )
  }

  let token: string
  try {
    token = await createSessionToken()
  } catch (err) {
    console.error('[switchboard/auth/login] could not create session', err)
    return NextResponse.json(
      { ok: false, error: 'Login is not configured yet' },
      { status: 503 },
    )
  }

  const cookieStore = await cookies()
  cookieStore.set(SWITCHBOARD_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })

  return NextResponse.json({ ok: true })
}
