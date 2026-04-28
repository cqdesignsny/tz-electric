/**
 * Twilio request signature verification.
 *
 * Twilio signs every webhook with HMAC-SHA1(authToken, url + sortedFormParams).
 * We verify the signature so a third party can't fake inbound SMS to us.
 *
 * https://www.twilio.com/docs/usage/webhooks/webhooks-security
 */
import crypto from 'node:crypto'

export type VerifyTwilioSignatureInput = {
  authToken: string
  signature: string
  url: string
  params: Record<string, string>
}

export function verifyTwilioSignature(input: VerifyTwilioSignatureInput): boolean {
  if (!input.authToken || !input.signature || !input.url) return false

  // Sort params by key, concatenate as `${key}${value}` with no separator.
  const sortedKeys = Object.keys(input.params).sort()
  let payload = input.url
  for (const key of sortedKeys) {
    payload += key + input.params[key]
  }

  const expected = crypto
    .createHmac('sha1', input.authToken)
    .update(Buffer.from(payload, 'utf-8'))
    .digest('base64')

  return safeEqual(expected, input.signature)
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return crypto.timingSafeEqual(aBuf, bBuf)
}
