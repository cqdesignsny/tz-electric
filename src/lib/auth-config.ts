/**
 * Auth.js v5 (NextAuth) configuration for the TZ Switchboard.
 *
 * Per-user Google OAuth, domain-restricted to `tzelectricinc.com` (TZ team)
 * and `creativequalitymarketing.com` (CQ Studio). On every successful
 * sign-in we upsert into `tz_users` so we have a stable identity for
 * KB edit attribution, conversation takeover authorship, and the audit
 * log. Roles default to 'office' on first login; owners (Tyler / Terry)
 * are auto-assigned when their email lands.
 *
 * The shared password flow is preserved for transition (and as a
 * break-glass fallback for Cesar). Once everyone's logged in via Google,
 * the password fallback can be removed by ripping out the
 * `verifySessionToken` cookie path in middleware.
 */
import type { NextAuthConfig } from 'next-auth'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

import { upsertUserOnSignIn } from './users'

export const ALLOWED_EMAIL_DOMAINS = ['tzelectricinc.com', 'creativequalitymarketing.com']

/** Email allowlist for owner role. Other emails default to 'office' on first login. */
export const OWNER_EMAILS = ['tyler@tzelectricinc.com', 'terry@tzelectricinc.com']

/** Email allowlist for admin role. */
export const ADMIN_EMAILS = ['cesar@creativequalitymarketing.com']

function getDomainFromEmail(email: string | null | undefined): string | null {
  if (!email) return null
  const at = email.lastIndexOf('@')
  if (at < 0) return null
  return email.slice(at + 1).toLowerCase()
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Restrict OAuth consent to organization workspace where possible;
      // the signIn callback below is the authoritative gate.
      authorization: {
        params: {
          prompt: 'select_account',
          // hd parameter is a soft hint to Google; we still verify the
          // workspace domain client-side.
          hd: 'tzelectricinc.com',
        },
      },
    }),
  ],
  pages: {
    signIn: '/switchboard/login',
    error: '/switchboard/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const email = user.email || profile?.email
      const domain = getDomainFromEmail(email)
      if (!email || !domain || !ALLOWED_EMAIL_DOMAINS.includes(domain)) {
        // Rejecting from signIn surfaces on the error page as
        // "AccessDenied". The login page reads ?error= to show context.
        console.warn('[auth] rejected sign-in from disallowed domain:', email)
        return false
      }

      try {
        await upsertUserOnSignIn({
          email: email.toLowerCase(),
          name: user.name || profile?.name || null,
          pictureUrl: user.image || (profile?.picture as string | undefined) || null,
          googleSub: account?.providerAccountId || null,
          hd: typeof profile?.hd === 'string' ? profile.hd : null,
        })
      } catch (e) {
        console.error('[auth] upsertUserOnSignIn failed:', e)
        // Don't block sign-in on a DB hiccup — the user can still get a
        // session; we'll backfill on the next request.
      }
      return true
    },
    async jwt({ token, user, profile }) {
      // First sign-in carries `user`; subsequent calls just re-shape token.
      if (user?.email) token.email = user.email.toLowerCase()
      if (profile?.name) token.name = profile.name
      if (typeof profile?.picture === 'string') token.picture = profile.picture
      return token
    },
    async session({ session, token }) {
      if (token.email && session.user) {
        session.user.email = String(token.email)
      }
      return session
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
