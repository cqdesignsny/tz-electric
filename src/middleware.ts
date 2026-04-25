import { NextRequest, NextResponse } from 'next/server'
import {
  SWITCHBOARD_COOKIE,
  verifySessionToken,
} from '@/lib/switchboard-auth'

export const config = {
  matcher: ['/switchboard/:path*'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/switchboard/login' || pathname.startsWith('/switchboard/login/')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SWITCHBOARD_COOKIE)?.value
  let valid = false
  try {
    valid = await verifySessionToken(token)
  } catch {
    valid = false
  }
  if (valid) return NextResponse.next()

  const loginUrl = new URL('/switchboard/login', request.url)
  if (pathname !== '/switchboard') {
    loginUrl.searchParams.set('next', pathname + request.nextUrl.search)
  }
  return NextResponse.redirect(loginUrl)
}
