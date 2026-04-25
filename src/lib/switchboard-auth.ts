export const SWITCHBOARD_COOKIE = 'tz-switchboard-session'
const TTL_DAYS = 30
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000

type SessionPayload = {
  exp: number
  role: 'admin'
}

function getSecret(): string {
  const s = process.env.SWITCHBOARD_SESSION_SECRET
  if (!s || s.length < 16) {
    throw new Error(
      'SWITCHBOARD_SESSION_SECRET must be set to a string of at least 16 chars',
    )
  }
  return s
}

function base64url(buf: ArrayBuffer | Uint8Array): string {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let str = ''
  for (let i = 0; i < u8.length; i++) str += String.fromCharCode(u8[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64url(s: string): Uint8Array {
  const padded =
    s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(padded)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return base64url(sig)
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

export async function createSessionToken(): Promise<string> {
  const payload: SessionPayload = {
    exp: Date.now() + TTL_MS,
    role: 'admin',
  }
  const json = JSON.stringify(payload)
  const data = base64url(new TextEncoder().encode(json))
  const sig = await hmacSign(getSecret(), data)
  return `${data}.${sig}`
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false
  const [data, sig] = token.split('.')
  if (!data || !sig) return false
  let expectedSig: string
  try {
    expectedSig = await hmacSign(getSecret(), data)
  } catch {
    return false
  }
  if (!constantTimeEqual(sig, expectedSig)) return false
  try {
    const json = new TextDecoder().decode(fromBase64url(data))
    const payload = JSON.parse(json) as SessionPayload
    return typeof payload.exp === 'number' && payload.exp > Date.now()
  } catch {
    return false
  }
}

export const SESSION_TTL_SECONDS = (TTL_DAYS * 24 * 60 * 60) | 0
