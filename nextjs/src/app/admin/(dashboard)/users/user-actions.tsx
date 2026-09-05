"use client";

import { MoreHorizontal, ShieldCheck, ShieldOff, UserCheck, UserX } from "lucide-react";

import { ConfirmAction, useServerAction } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setUserActiveAction, setUserRoleAction } from "@/lib/actions/user-actions";
import type { UserRole } from "@/lib/constants";

/**
 * What a super admin can do to another account.
 *
 * Three things: promote, demote, and turn sign-in off or back on. There is deliberately no
 * option here to set somebody else's password. The invitation and reset links already cover
 * every case where one needs to change, and an admin who can set a colleague's password creates
 * an account whose credentials two people hold.
 *
 * The menu on your own row is limited to the things that cannot lock you out. The action
 * refuses them as well, since a menu that is not rendered is still a request anybody can post.
 */
export function UserActions({
  id,
  name,
  role,
  isActive,
  isSelf,
}: {
  id: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isSelf: boolean;
}) {
  const { run, pending } = useServerAction();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={pending}
          aria-label={`Actions for ${name}`}
        >
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {role === "admin" ? (
          <DropdownMenuItem onSelect={() => run(() => setUserRoleAction(id, "super_admin"))}>
            <ShieldCheck aria-hidden />
            Make a super admin
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={isSelf}
            onSelect={() => run(() => setUserRoleAction(id, "admin"))}
          >
            <ShieldOff aria-hidden />
            Reduce to admin
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {isActive ? (
          <ConfirmAction
            title={`Deactivate ${name}?`}
            description="They are signed out on every device straight away and cannot sign in again until an account is restored. Everything they wrote keeps their name on it."
            confirmLabel="Deactivate the account"
            onConfirm={() => setUserActiveAction(id, false)}
            trigger={
              <DropdownMenuItem variant="destructive" disabled={isSelf}>
                <UserX aria-hidden />
                Deactivate
              </DropdownMenuItem>
            }
          />
        ) : (
          <DropdownMenuItem onSelect={() => run(() => setUserActiveAction(id, true))}>
            <UserCheck aria-hidden />
            Let them sign in again
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
