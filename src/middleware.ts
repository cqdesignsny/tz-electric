import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

import {
  SWITCHBOARD_COOKIE,
  verifySessionToken,
} from '@/lib/switchboard-auth'
import { ALLOWED_EMAIL_DOMAINS } from '@/lib/auth-config'

export const config = {
  matcher: ['/switchboard/:path*'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow the login page to render (and the NextAuth signin pages)
  // so unauthenticated visitors can actually authenticate.
  if (pathname === '/switchboard/login' || pathname.startsWith('/switchboard/login/')) {
    return NextResponse.next()
  }

  // Path 1 (preferred): NextAuth Google OAuth session.
  try {
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      // Auth.js v5 sets this cookie name by default.
      cookieName:
        process.env.NODE_ENV === 'production'
          ? '__Secure-authjs.session-token'
          : 'authjs.session-token',
    })
    const email = typeof token?.email === 'string' ? token.email.toLowerCase() : null
    if (email) {
      const at = email.lastIndexOf('@')
      const domain = at > 0 ? email.slice(at + 1) : ''
      if (ALLOWED_EMAIL_DOMAINS.includes(domain)) {
        return NextResponse.next()
      }
      // Authenticated but on a non-allowlisted domain → bounce to login
      // with a context-aware error.
      const denied = new URL('/switchboard/login', request.url)
      denied.searchParams.set('error', 'AccessDenied')
      return NextResponse.redirect(denied)
    }
  } catch {
    // Fall through to legacy path.
  }

  // Path 2 (transition fallback): the original shared-password HMAC cookie.
  // Kept so Cesar / pre-OAuth sessions don't break during cutover. Once
  // every active user has signed in via Google, remove this whole block.
  const legacyToken = request.cookies.get(SWITCHBOARD_COOKIE)?.value
  let legacyValid = false
  try {
    legacyValid = await verifySessionToken(legacyToken)
  } catch {
    legacyValid = false
  }
  if (legacyValid) return NextResponse.next()

  const loginUrl = new URL('/switchboard/login', request.url)
  if (pathname !== '/switchboard') {
    loginUrl.searchParams.set('next', pathname + request.nextUrl.search)
  }
  return NextResponse.redirect(loginUrl)
}
