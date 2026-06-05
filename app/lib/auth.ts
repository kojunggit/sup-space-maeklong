// Admin session auth.
//
// The session cookie holds a *signed token* — never the password itself — so the
// plaintext secret is never sent to the browser. Signing uses HMAC-SHA256 via
// the Web Crypto API (`crypto.subtle`), which is available in both the Node.js
// runtime (route handlers, server actions) and the Edge runtime (middleware).
//
// IMPORTANT: do NOT import `next/headers` at module scope — this module is
// imported by middleware (Edge), where `next/headers` is unavailable. Cookie
// reads that need it use a dynamic import inside the relevant helper.

export const SESSION_COOKIE = "admin_auth";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

function getSigningSecret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

// ─── base64url helpers ──────────────────────────────────────────────────────
function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmac(data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSigningSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

// ─── Session tokens ─────────────────────────────────────────────────────────
/** Create a signed session token of the form `<payload>.<signature>`. */
export async function createSessionToken(ttlSec = SESSION_MAX_AGE): Promise<string> {
  const payload = b64urlEncode(
    new TextEncoder().encode(JSON.stringify({ exp: Date.now() + ttlSec * 1000 })),
  );
  const sig = b64urlEncode(await hmac(payload));
  return `${payload}.${sig}`;
}

/** Verify signature (timing-safe) and expiry of a session token. */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!getSigningSecret() || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;

  let provided: Uint8Array;
  try {
    provided = b64urlDecode(sig);
  } catch {
    return false;
  }
  const expected = await hmac(payload);
  if (!timingSafeEqual(provided, expected)) return false;

  try {
    const data = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

/** Constant-time check of an admin password attempt against ADMIN_PASSWORD. */
export function verifyAdminPassword(input: string): boolean {
  const secret = process.env.ADMIN_PASSWORD ?? "admin";
  return timingSafeEqual(new TextEncoder().encode(input), new TextEncoder().encode(secret));
}

// ─── Server-side guards (Node runtime only) ─────────────────────────────────
/** True if the current request carries a valid admin session cookie. */
export async function isAdminRequest(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Throw if the caller is not an authenticated admin. Use at the top of
 *  admin-only server actions / route handlers. */
export async function assertAdmin(): Promise<void> {
  if (!(await isAdminRequest())) throw new Error("UNAUTHORIZED");
}
