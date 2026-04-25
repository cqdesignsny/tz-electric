import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SWITCHBOARD_COOKIE } from '@/lib/switchboard-auth'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set(SWITCHBOARD_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return NextResponse.json({ ok: true })
}
