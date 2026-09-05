import type { Metadata } from "next";
import { Suspense } from "react";

import { ChangePasswordForm } from "@/app/admin/(dashboard)/profile/change-password-form";
import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Your profile" };

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

/**
 * The account's own details and the change-password form.
 *
 * The heading and the form are static. Only the details block reads the session, so only it
 * waits, and the form below is usable while the four lines above it are still arriving.
 *
 * The page frame, the navigation and the breadcrumb trail come from the dashboard shell, so
 * there is no back link here: the trail above already is one.
 */
export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <PageHeader title="Your profile" />

      <Suspense fallback={<AccountSkeleton />}>
        <AccountDetails />
      </Suspense>

      <section className="mt-12">
        <h2 className="text-foreground text-lg font-semibold tracking-tight">Change password</h2>
        <p className="text-muted-foreground mt-2 mb-7 text-sm leading-6">
          Your other signed-in devices are signed out when the password changes. This one stays
          signed in.
        </p>
        <ChangePasswordForm />
      </section>
    </div>
  );
}

async function AccountDetails() {
  const user = await requireUser();

  return (
    <dl className="text-muted-foreground mt-6 space-y-2 text-sm">
      <Row label="Name">{user.name}</Row>
      <Row label="Email">{user.email}</Row>
      <Row label="Role">{user.role === "super_admin" ? "Super admin" : "Admin"}</Row>
      <Row label="Last sign-in">
        {user.lastLoginAt ? dateFormat.format(new Date(user.lastLoginAt)) : "This is the first"}
      </Row>
    </dl>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div className="mt-6 space-y-3" aria-hidden>
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-4 w-52" />
      <Skeleton className="h-4 w-60" />
    </div>
  );
}
