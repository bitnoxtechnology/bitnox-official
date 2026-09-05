"use server";

import { fail, ok, validate } from "@/lib/actions/action-state";
import { withSuperAdmin } from "@/lib/actions/with-auth";
import { revokeUserSessions } from "@/lib/auth/session";
import type { UserRole } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { countActiveSuperAdmins } from "@/lib/queries/admin/users";
import { userActiveSchema, userRoleSchema } from "@/lib/validations/admin-schema";
import { User } from "@/models";

/**
 * The admin roster.
 *
 * Super admins only, and the guard is `withSuperAdmin` rather than a check written at the top
 * of each function, so an action added later cannot be reachable by a plain admin because
 * somebody forgot a line.
 *
 * Inviting is in `auth-actions.ts` with the rest of the invitation flow, because the account
 * and the one-time link are created together and splitting them would put half a transaction
 * in each file. What lives here is what happens to an account afterwards: its role, and
 * whether it can sign in.
 *
 * There is deliberately no action here that sets another person's password. The invitation
 * and reset links already cover every case where one needs to change, and an admin who can
 * set a colleague's password creates an account whose credentials two people hold.
 */

/** Three ways to lock everybody out, all of them guarded by the same count. */
const LAST_SUPER_ADMIN =
  "This is the last active super admin. Promote somebody else before changing this one.";

/**
 * Promote or demote.
 *
 * A super admin cannot demote themselves, and the last active super admin cannot be demoted
 * by anybody. Either would leave the invitation and role screens unreachable, and the only
 * way back from that is an edit against the database by hand.
 */
export const setUserRoleAction = withSuperAdmin<[string, UserRole], { role: UserRole }>(
  async (actor, id, role) => {
    const parsed = validate(userRoleSchema, { id, role });
    if (!parsed.ok) return parsed;

    if (parsed.data.id === actor.id && parsed.data.role !== "super_admin") {
      return fail("You cannot remove your own super admin role. Ask another super admin.");
    }

    await connectToDatabase();

    const user = await User.findById(parsed.data.id).exec();
    if (!user) return fail("That account no longer exists.");

    if (
      user.role === "super_admin" &&
      parsed.data.role !== "super_admin" &&
      user.isActive &&
      (await countActiveSuperAdmins()) <= 1
    ) {
      return fail(LAST_SUPER_ADMIN);
    }

    user.role = parsed.data.role;
    await user.save();

    return ok({ role: user.role }, `${user.name} is now ${roleLabel(user.role)}.`);
  },
);

/**
 * Deactivate or restore.
 *
 * Deactivating revokes every session the account holds. Leaving them alive would mean the
 * account stays signed in on whatever devices it is already on, which defeats the point of
 * the button: it is pressed when somebody leaves, and the browser they left open is exactly
 * the thing being closed.
 *
 * The account is kept rather than deleted, so the byline on everything they wrote survives
 * and the email address cannot be re-invited into a different person's history.
 */
export const setUserActiveAction = withSuperAdmin<[string, boolean], { isActive: boolean }>(
  async (actor, id, isActive) => {
    const parsed = validate(userActiveSchema, { id, isActive: isActive ? "true" : "false" });
    if (!parsed.ok) return parsed;

    if (parsed.data.id === actor.id && !parsed.data.isActive) {
      return fail("You cannot deactivate your own account.");
    }

    await connectToDatabase();

    const user = await User.findById(parsed.data.id).exec();
    if (!user) return fail("That account no longer exists.");

    if (
      user.role === "super_admin" &&
      user.isActive &&
      !parsed.data.isActive &&
      (await countActiveSuperAdmins()) <= 1
    ) {
      return fail(LAST_SUPER_ADMIN);
    }

    user.isActive = parsed.data.isActive;
    await user.save();

    if (!parsed.data.isActive) await revokeUserSessions(String(user._id));

    return ok(
      { isActive: user.isActive },
      user.isActive
        ? `${user.name} can sign in again.`
        : `${user.name} has been deactivated and signed out everywhere.`,
    );
  },
);

function roleLabel(role: UserRole): string {
  return role === "super_admin" ? "a super admin" : "an admin";
}
