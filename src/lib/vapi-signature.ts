/**
 * Vapi server URL secret verification.
 *
 * When Vapi posts to our server URL it includes the secret configured
 * in the Vapi assistant settings on a header. Vapi accepts either the
 * standard `Authorization: Bearer <secret>` form or the legacy
 * `X-Vapi-Secret: <secret>` header. We accept both so a token rotation
 * in either spot doesn't break us.
 *
 * https://docs.vapi.ai/server-url/server-authentication
 */
import crypto from 'node:crypto'

export type VapiAuthHeaders = {
  authorization?: string | null
  xVapiSecret?: string | null
}

export function extractVapiSecret(headers: VapiAuthHeaders): string | null {
  const auth = headers.authorization?.trim()
  if (auth) {
    if (auth.toLowerCase().startsWith('bearer ')) {
      return auth.slice(7).trim() || null
    }
    return auth
  }
  const xv = headers.xVapiSecret?.trim()
  return xv || null
}

export function verifyVapiSecret(presented: string | null, expected: string | undefined | null): boolean {
  if (!presented || !expected) return false
  const a = Buffer.from(presented)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

/**
 * Convenience: pull headers off a Web `Request` and check them in one
 * call. Returns true on a valid match, false otherwise (including when
 * VAPI_SERVER_URL_SECRET is unset, which keeps us closed-by-default
 * rather than open).
 */
export function verifyVapiRequest(req: Request, expectedSecret: string | undefined): boolean {
  const presented = extractVapiSecret({
    authorization: req.headers.get('authorization'),
    xVapiSecret: req.headers.get('x-vapi-secret'),
  })
  return verifyVapiSecret(presented, expectedSecret || null)
}
