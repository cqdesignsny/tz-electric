/**
 * NextAuth (Auth.js v5) catch-all route handler.
 * Auth-related URLs:
 *   /api/auth/signin                   sign-in entry point
 *   /api/auth/callback/google          Google OAuth callback (configured in Cloud Console)
 *   /api/auth/signout                  sign-out endpoint
 *   /api/auth/session                  read current session
 */
export { GET, POST } from '@/lib/auth-config-handlers'
