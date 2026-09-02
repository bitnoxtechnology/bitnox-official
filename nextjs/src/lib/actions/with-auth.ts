import "server-only";

import { requireSuperAdmin, requireUser } from "@/lib/auth/guards";
import type { UserDTO } from "@/lib/dto";
import type { ActionResult } from "@/lib/actions/action-state";

/**
 * The guard, applied by wrapping rather than by remembering.
 *
 * Every server action that touches data has to call `requireUser()` or `requireSuperAdmin()`
 * first. `proxy.ts` cannot do it for them: it sees a signed cookie and nothing else, so it
 * does not know that a session was revoked, that an account was deactivated, or what role
 * anyone holds. An action that skips the guard is reachable by anyone who can POST.
 *
 * Writing the call at the top of forty actions works right up until the forty-first is
 * written without it, and nothing fails when that happens. These wrappers make the guard
 * part of the action's definition instead, so an unguarded action is one you have to go out
 * of your way to write.
 *
 * The guards redirect rather than return, which is what should happen: a caller with no
 * session needs the sign-in page, not a message inside a form they are not authorised to
 * submit. `redirect()` throws a value Next.js handles, so nothing after it runs.
 */

type Guarded<TArgs extends unknown[], TResult> = (
  user: UserDTO,
  ...args: TArgs
) => Promise<ActionResult<TResult>>;

export function withAuth<TArgs extends unknown[], TResult>(
  handler: Guarded<TArgs, TResult>,
): (...args: TArgs) => Promise<ActionResult<TResult>> {
  return async (...args: TArgs) => handler(await requireUser(), ...args);
}

export function withSuperAdmin<TArgs extends unknown[], TResult>(
  handler: Guarded<TArgs, TResult>,
): (...args: TArgs) => Promise<ActionResult<TResult>> {
  return async (...args: TArgs) => handler(await requireSuperAdmin(), ...args);
}
