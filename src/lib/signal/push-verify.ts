// Shared signing for the push leg. Signal signs the exact JSON body with a
// per-destination shared secret; the admin recomputes the same HMAC and rejects
// the request on mismatch. This is what lets an admin trust that a payload
// genuinely came from Signal (the admin never calls out, so it must be able to
// verify what comes in). Both repos implement this identically.

import { createHmac, timingSafeEqual } from "node:crypto";

export const PUSH_SIGNATURE_HEADER = "x-signal-signature";

/** HMAC-SHA256 over the raw body, hex-encoded. */
export function signPushBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

/** Constant-time compare of a received signature against the expected one. */
export function verifyPushSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  const expected = signPushBody(body, secret);
  // Hex of equal-length HMACs are equal length; bail before timingSafeEqual
  // (which throws on length mismatch) if a malformed signature is sent.
  if (signature.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex"),
    );
  } catch {
    return false;
  }
}
