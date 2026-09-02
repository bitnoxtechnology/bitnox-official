import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/site/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { logoutAction } from "@/lib/actions/auth-actions";
import { isSuperAdmin, requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * A placeholder dashboard.
 *
 * Phase 11 builds the real one. What it does now is prove the session works end to end and
 * give the two screens Phase 3 owns somewhere to be linked from.
 *
 * The page frame is static and the session-dependent part streams in behind the boundary
 * below. The boundary has to be here rather than in the admin layout: on a navigation from
 * one admin page to another the layout is already mounted, so a boundary up there would sit
 * above everything that re-renders.
 */
export default function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Dashboard({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const superAdmin = isSuperAdmin(user);

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {user.name.split(" ")[0]}, you are signed in
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {user.email} | {superAdmin ? "Super admin" : "Admin"}
          </p>
        </div>

        <form action={logoutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </header>

      {params.denied === "super_admin" ? (
        <Alert variant="destructive" className="mt-8">
          <AlertDescription>
            That page is for super admins. Ask one of them if you need something from it.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <DashboardLink
          href="/admin/profile"
          title="Your profile"
          description="Change your password and see when you last signed in."
        />
        {superAdmin ? (
          <DashboardLink
            href="/admin/users/invite"
            title="Invite an admin"
            description="Send an invitation. They choose their own password from the link."
          />
        ) : null}
      </div>

      <p className="text-muted-foreground mt-10 text-sm">
        Content management arrives in a later phase. This screen exists so the sign-in flow has
        somewhere to land.
      </p>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-hidden>
      <div className="flex items-start justify-between gap-4">
        <div className="w-full max-w-sm">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="mt-3 h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

function DashboardLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <GlassCard asChild interactive padding="sm">
      <Link href={href}>
        <h2 className="text-foreground text-sm font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1.5 text-sm leading-6">{description}</p>
      </Link>
    </GlassCard>
  );
}
