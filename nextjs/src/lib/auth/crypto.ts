import { serverEnv } from "@/lib/env";

/**
 * Random values, keyed hashes and signed cookie payloads.
 *
 * Everything here uses Web Crypto rather than `node:crypto`, because `proxy.ts` verifies the
 * session cookie signature too and must not pull the Node built-in into its bundle. The APIs
 * are async as a result, which is why the signing helpers return promises.
 *
 * Verification always goes through `crypto.subtle.verify`, which compares in constant time.
 * A hand-written `===` on two hex strings returns early on the first differing character, and
 * that difference is measurable often enough to be worth not writing.
 */

const encoder = new TextEncoder();

let cachedKey: Promise<CryptoKey> | undefined;

function signingKey(): Promise<CryptoKey> {
  cachedKey ??= crypto.subtle.importKey(
    "raw",
    encoder.encode(serverEnv.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return cachedKey;
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

/** 256 bits by default: a session id, an invitation token or a reset token. */
export function randomToken(byteLength = 32): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

/**
 * A six-digit code, drawn without modulo bias.
 *
 * `random % 1_000_000` would make the low codes fractionally likelier than the high ones.
 * The bias is small, but rejection sampling costs one extra draw in roughly one attempt in
 * a thousand, so there is nothing to trade away.
 */
export function generateOtpCode(): string {
  const limit = Math.floor(0xffffffff / 1_000_000) * 1_000_000;
  const buffer = new Uint32Array(1);

  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0] ?? 0;
  } while (value >= limit);

  return String(value % 1_000_000).padStart(6, "0");
}

/**
 * A keyed hash of a secret, for storing OTP codes and one-time link tokens.
 *
 * Keyed, not plain SHA-256. A six-digit code has a million possibilities, so an unkeyed
 * digest of one is trivially reversed by anyone holding a copy of the collection. With the
 * key held only in `SESSION_SECRET`, a database leak on its own reveals nothing.
 */
export async function keyedHash(value: string): Promise<string> {
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(value));
  return toBase64Url(signature);
}

/** Constant-time. Returns false rather than throwing on a malformed signature. */
export async function verifyKeyedHash(value: string, expected: string): Promise<boolean> {
  if (!value || !expected) return false;

  try {
    return await crypto.subtle.verify(
      "HMAC",
      await signingKey(),
      fromBase64Url(expected) as unknown as BufferSource,
      encoder.encode(value),
    );
  } catch {
    return false;
  }
}

/** `<value>.<signature>`, for a cookie the browser can read but cannot forge. */
export async function signValue(value: string): Promise<string> {
  return `${value}.${await keyedHash(value)}`;
}

/** The value back out of a signed cookie, or null if the signature does not hold. */
export async function unsignValue(signed: string | undefined): Promise<string | null> {
  if (!signed) return null;

  const separator = signed.lastIndexOf(".");
  if (separator <= 0) return null;

  const value = signed.slice(0, separator);
  const signature = signed.slice(separator + 1);

  return (await verifyKeyedHash(value, signature)) ? value : null;
}

/** A signed, expiring JSON payload in a cookie. No database row, since none is needed. */
export async function signPayload(payload: Record<string, unknown>): Promise<string> {
  return signValue(toBase64Url(encoder.encode(JSON.stringify(payload))));
}

export async function readSignedPayload<T>(signed: string | undefined): Promise<T | null> {
  const encoded = await unsignValue(signed);
  if (!encoded) return null;

  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as T;
  } catch {
    return null;
  }
}
