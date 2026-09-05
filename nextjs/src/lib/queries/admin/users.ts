import "server-only";

import { toUser, type UserDTO } from "@/lib/dto";
import { connectForRequest, searchPattern } from "@/lib/queries/admin/shared";
import { User, type IUser } from "@/models";

/**
 * The admin roster.
 *
 * Unpaginated. This is a list of the handful of people who can sign in to the site, and it
 * is a list you want to see all of at once: paginating five rows hides the fifth behind a
 * control that says there is more.
 *
 * `passwordHash` is `select: false` on the model and `toUser` names the fields it copies
 * rather than spreading, so there are two independent reasons a hash cannot reach this
 * screen.
 */
export async function listUsers(search?: string): Promise<UserDTO[]> {
  await connectForRequest();

  const filter: Record<string, unknown> = {};

  if (search) {
    const pattern = searchPattern(search);
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const users = await User.find(filter).sort({ role: 1, name: 1 }).lean<IUser[]>().exec();

  return users.map(toUser);
}

/**
 * How many active super admins there are.
 *
 * Read before a demotion or a deactivation, because an account that removes the last super
 * admin locks the invitation and role screens for everybody, and the only way back is a
 * database edit.
 */
export async function countActiveSuperAdmins(): Promise<number> {
  await connectForRequest();

  return User.countDocuments({ role: "super_admin", isActive: true }).exec();
}
