import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { UserActions } from "@/app/admin/(dashboard)/users/user-actions";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { listUsers } from "@/lib/queries/admin/users";

export const metadata: Metadata = { title: "Users" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

/**
 * The people who can sign in.
 *
 * Super admins only. The guard is here and in every action behind it: a page that is not
 * rendered is still a URL anybody can type, and an action is still a request anybody can post.
 *
 * Unpaginated and unfiltered, because this is a handful of rows and it is a list you want to
 * see all of at once. Paginating five accounts hides the fifth behind a control that says there
 * is more.
 *
 * No password hash reaches this screen, and there are two independent reasons for that:
 * `passwordHash` is `select: false` on the model, and `toUser` names the fields it copies rather
 * than spreading the document.
 */
export default function UsersPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Users"
        description="Everyone with access to this admin. Nobody here can set another person's password."
        actions={
          <Button asChild>
            <Link href="/admin/users/invite">
              <Plus aria-hidden />
              Invite an admin
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<TableSkeleton />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}

async function UsersTable() {
  const current = await requireSuperAdmin();
  const users = await listUsers();

  return (
    <div className="mt-6 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="w-36">Role</TableHead>
            <TableHead className="w-28">Access</TableHead>
            <TableHead className="w-44">Last signed in</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="max-w-xs">
                <span className="text-foreground block truncate text-sm font-medium">
                  {user.name}
                  {user.id === current.id ? (
                    <span className="text-muted-foreground font-normal"> (you)</span>
                  ) : null}
                </span>
                <span className="text-muted-foreground block truncate text-xs">{user.email}</span>
              </TableCell>

              <TableCell>
                <Badge variant={user.role === "super_admin" ? "default" : "outline"}>
                  {user.role === "super_admin" ? "Super admin" : "Admin"}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge variant={user.isActive ? "outline" : "destructive"}>
                  {user.isActive ? "Active" : "Deactivated"}
                </Badge>
              </TableCell>

              <TableCell className="text-muted-foreground text-sm">
                {user.lastLoginAt
                  ? dateFormat.format(new Date(user.lastLoginAt))
                  : "Not yet, invitation still open"}
              </TableCell>

              <TableCell>
                <UserActions
                  id={user.id}
                  name={user.name}
                  role={user.role}
                  isActive={user.isActive}
                  isSelf={user.id === current.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="mt-6 space-y-3" aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}
