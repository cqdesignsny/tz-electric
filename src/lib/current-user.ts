/**
 * Server-side helper to read the currently authenticated TZ user.
 *
 * Combines two sources:
 *   1. NextAuth Google OAuth session (preferred, per-user identity).
 *   2. The legacy shared-password cookie (transition fallback). When
 *      this is the only signal, we treat the request as an anonymous
 *      "office" user — useful for Cesar testing during cutover, but
 *      callers that need attribution (KB edits, conversation takeover)
 *      should require a Google session.
 *
 * Returns null if the request has no authentication at all. The
 * middleware already redirects unauth visitors at the page boundary,
 * so server components calling this helper inside `/switchboard/...`
 * can assume null only happens during an edge case (race on session
 * refresh).
 */
import { cookies } from 'next/headers'

import { auth } from './auth-config'
import { SWITCHBOARD_COOKIE, verifySessionToken } from './switchboard-auth'
import { getUserByEmail, type TzUser, type UserRole } from './users'

export type CurrentUser = {
  email: string
  role: UserRole
  source: 'google' | 'password'
  user: TzUser | null
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Path 1: NextAuth Google OAuth session.
  try {
    const session = await auth()
    const email = session?.user?.email?.toLowerCase()
    if (email) {
      const user = await getUserByEmail(email)
      if (user && user.role !== 'disabled' && !user.disabled_at) {
        return { email, role: user.role, source: 'google', user }
      }
    }
  } catch (e) {
    console.error('[current-user] NextAuth session read failed:', e)
  }

  // Path 2: legacy password cookie. Anonymous, no email, treat as office
  // for capability checks. KB edits / role changes / takeover that need
  // an authoring identity must reject this and force a Google sign-in.
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SWITCHBOARD_COOKIE)?.value
    const valid = await verifySessionToken(token)
    if (valid) {
      return {
        email: 'admin@switchboard.local',
        role: 'admin',
        source: 'password',
        user: null,
      }
    }
  } catch {
    // ignore
  }

  return null
}

/**
 * Strict variant that throws when the request isn't backed by a real
 * Google identity. Use in handlers that write attribution-sensitive
 * data (KB edits, role changes, conversation takeover).
 */
export async function requireGoogleUser(): Promise<CurrentUser> {
  const cu = await getCurrentUser()
  if (!cu || cu.source !== 'google' || !cu.user) {
    throw new Error(
      'This action requires signing in with your TZ Electric Google account.',
    )
  }
  return cu
}
