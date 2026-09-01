/**
 * Server-only authentication helpers.
 *
 * Passwords are hashed with scrypt (Node's built-in crypto — no deps).
 * Sessions use an HMAC-signed HttpOnly cookie.
 * All DB lookups use parameterized queries (SQL-injection safe).
 */

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "oneway_admin_session";
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Long secret used to sign session cookies. Store in .env as AUTH_SECRET. */
function getSecret(): string {
  return process.env.AUTH_SECRET || "";
}

/* ------------------------------------------------------------------ */
/* Password hashing (scrypt)                                          */
/* ------------------------------------------------------------------ */

const SCRYPT_OPTS = { N: 16384, r: 8, p: 1 };
const KEYLEN = 32;
const HASH_PREFIX = "scrypt$";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN, SCRYPT_OPTS).toString("hex");
  return `${HASH_PREFIX}${salt}$${hash}`;
}

/** Constant-time password check. Returns false for malformed hashes. */
export function verifyPassword(password: string, stored: string): boolean {
  if (typeof stored !== "string" || !stored.startsWith(HASH_PREFIX)) return false;
  const [, salt, expectedHex] = stored.split("$");
  if (!salt || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = scryptSync(password, salt, KEYLEN, SCRYPT_OPTS);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/* ------------------------------------------------------------------ */
/* Session tokens (HMAC-SHA256 signed payload)                        */
/* ------------------------------------------------------------------ */

function sign(value: string): string {
  const mac = createHmac("sha256", getSecret());
  mac.update(value);
  return mac.digest().toString("hex");
}

/** Returns `base64url(payload).hex-signature` where payload = username:expiry */
export function createSessionToken(username: string): string {
  const payload = Buffer.from(`${username}:${Date.now() + SESSION_TTL_MS}`, "utf-8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Returns the username if the token is valid & unexpired, otherwise null. */
export function verifySessionToken(token: string): string | null {
  if (!token || !getSecret()) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = sign(payload);
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(sig, "hex");
  if (actualBuf.length !== expectedBuf.length || !timingSafeEqual(actualBuf, expectedBuf)) {
    return null;
  }

  const decoded = Buffer.from(payload, "base64url").toString("utf-8");
  const idx = decoded.lastIndexOf(":");
  if (idx < 0) return null;
  const username = decoded.slice(0, idx);
  const expiry = Number(decoded.slice(idx + 1));
  if (!username || !expiry || Date.now() >= expiry) return null;
  return username;
}

/** Reads & verifies the session cookie for the current request. Server-only. */
export async function getSessionUser(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value || "";
  return verifySessionToken(token);
}
