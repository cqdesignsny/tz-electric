/**
 * Re-export of the NextAuth route handlers. Kept in a separate module
 * because Next.js route files want to export only allowed names; the
 * underlying `auth-config.ts` exports several things (auth, signIn,
 * signOut, etc.) that don't belong in a route file.
 */
export { handlers } from './auth-config'
import { handlers } from './auth-config'

export const { GET, POST } = handlers
