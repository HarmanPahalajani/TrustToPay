import crypto from "node:crypto";

/**
 * Verifies an incoming webhook signature using HMAC-SHA256 with constant-time comparison.
 * Addresses replay attacks with a 5-minute timestamp tolerance window.
 */
export function verifyWebhookSignature(params: {
  rawBody: Buffer;
  signatureHex: string;
  timestampHeader: string;
  secret: string;
  maxAgeSeconds?: number;
}): { valid: boolean; reason?: string } {
  const { rawBody, signatureHex, timestampHeader, secret, maxAgeSeconds = 300 } = params;

  // 1. Verify timestamp is within tolerance window to prevent replay attacks
  const timestamp = Number.parseInt(timestampHeader, 10);
  if (!Number.isFinite(timestamp)) {
    return { valid: false, reason: "INVALID_TIMESTAMP" };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestamp) > maxAgeSeconds) {
    return { valid: false, reason: "TIMESTAMP_EXPIRED" };
  }

  // 2. Compute expected HMAC
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${timestamp}.`);
  hmac.update(rawBody);
  const expectedBuffer = hmac.digest();

  // 3. Compare signatures using constant-time comparison
  try {
    const providedBuffer = Buffer.from(signatureHex, "hex");
    if (providedBuffer.length !== expectedBuffer.length) {
      return { valid: false, reason: "SIGNATURE_LENGTH_MISMATCH" };
    }
    const match = crypto.timingSafeEqual(expectedBuffer, providedBuffer);
    return match ? { valid: true } : { valid: false, reason: "SIGNATURE_MISMATCH" };
  } catch {
    return { valid: false, reason: "HEX_DECODE_ERROR" };
  }
}
