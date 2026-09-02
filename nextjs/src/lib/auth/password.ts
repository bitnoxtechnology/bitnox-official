import { hash, verify, type Options } from "@node-rs/argon2";

/**
 * Password hashing.
 *
 * argon2id, at the OWASP second-recommended parameter set: 19 MiB of memory, two passes,
 * one lane. Memory cost is what makes GPU cracking expensive, which is why that is the
 * parameter tuned up rather than the iteration count.
 *
 * Both functions are async and run off the main thread, so a login does not block the event
 * loop for the tens of milliseconds the hash takes.
 */

/**
 * `Algorithm.Argon2id`, written as its numeric value because the binding declares it as an
 * ambient `const enum`, which `isolatedModules` cannot import.
 */
const ARGON2ID = 2;

const OPTIONS = {
  algorithm: ARGON2ID,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} satisfies Options;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

/**
 * Verification reads the cost parameters out of the stored hash, so raising OPTIONS later
 * does not invalidate existing passwords.
 *
 * Returns false rather than throwing on a malformed or missing hash. A thrown error would be
 * a distinguishable outcome, and distinguishable outcomes are how login endpoints end up
 * confirming which email addresses have accounts.
 */
export async function verifyPassword(hashed: string, password: string): Promise<boolean> {
  if (!hashed || !password) return false;

  try {
    return await verify(hashed, password);
  } catch {
    return false;
  }
}
