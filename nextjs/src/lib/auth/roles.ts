import type { UserRole } from "@/lib/constants";

/**
 * The role check, on its own.
 *
 * Separate from `guards.ts` because that module reaches for cookies and redirects, which
 * makes it unusable outside a request. This is a pure comparison, so it can be tested
 * directly and read from anywhere.
 */
export function isSuperAdmin(user: { role: UserRole } | null | undefined): boolean {
  return user?.role === "super_admin";
}
