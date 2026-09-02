import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { InviteForm } from "@/app/admin/users/invite/invite-form";
import { Skeleton } from "@/components/ui/skeleton";
import { requireSuperAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Invite an admin" };

/**
 * Super admins only.
 *
 * The guard is here as well as in `inviteUserAction`. The page guard stops a plain admin
 * seeing the form; the action guard is the one that matters, because the action can be posted
 * to without the page ever being loaded.
 *
 * Because the guard decides whether any of this should be on screen, the content waits behind
 * it rather than rendering first and being redirected away a moment later.
 */
export default function InviteUserPage() {
  return (
    <main className="mx-auto w-full max-w-xl px-6 py-16">
      <Link
        href="/admin"
        className="text-muted-foreground hover:text-primary text-sm transition-colors"
      >
        Back to dashboard
      </Link>

      <Suspense fallback={<InviteSkeleton />}>
        <InvitePanel />
      </Suspense>
    </main>
  );
}

async function InvitePanel() {
  await requireSuperAdmin();

  return (
    <>
      <h1 className="text-foreground mt-6 text-2xl font-semibold tracking-tight">
        Invite an admin
      </h1>
      <p className="text-muted-foreground mt-2 mb-10 text-sm leading-6">
        The account is created now and the invitation link expires in three days. They set their own
        password from that link, so nobody else ever knows it.
      </p>

      <InviteForm />
    </>
  );
}

function InviteSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="mt-6 h-8 w-56" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <div className="mt-10 space-y-5">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}
