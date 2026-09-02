import "server-only";

import { Resend } from "resend";

import { serverEnv } from "@/lib/env";

/**
 * The Resend client, created on first use.
 *
 * Constructing it at module scope would read the API key while the module graph is still
 * being built, which is early enough to break `next build` on a machine that has no `.env`.
 */

let client: Resend | undefined;

export function resend(): Resend {
  client ??= new Resend(serverEnv.RESEND_API_KEY);
  return client;
}
