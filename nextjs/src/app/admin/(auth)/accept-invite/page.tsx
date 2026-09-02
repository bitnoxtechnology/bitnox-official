import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthCard, AuthCardSkeleton } from "@/app/admin/(auth)/auth-card";
import { SetPasswordForm } from "@/app/admin/(auth)/set-password-form";
import { acceptInviteAction } from "@/lib/actions/auth-actions";
import { inspectAuthToken } from "@/lib/auth/auth-tokens";

export const metadata: Metadata = { title: "Set your password" };

/**
 * The page an invitation lands on.
 *
 * This is the only way an admin account gets its first usable password. No super admin sets
 * one on someone else's behalf, so nobody but the account holder has ever known it.
 *
 * As with the reset screen, the whole card depends on the token in the URL, so it streams in
 * behind one boundary.
 */
export default function AcceptInvitePage({ searchParams }: PageProps<"/admin/accept-invite">) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <InviteCard searchParams={searchParams} />
    </Suspense>
  );
}

async function InviteCard({
  searchParams,
}: {
  searchParams: PageProps<"/admin/accept-invite">["searchParams"];
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const result = await inspectAuthToken("invite", token);

  if (!result.ok) {
    return (
      <AuthCard
        title="This invitation no longer works"
        description={
          result.reason === "expired"
            ? "Invitations last three days. Ask whoever invited you to send another."
            : "The invitation has been used already, or part of the link was lost on the way."
        }
        footer={
          <Link href="/admin/login" className="text-brand-muted hover:text-brand transition-colors">
            Back to sign in
          </Link>
        }
      >
        <p className="text-brand-muted text-sm">
          If you have already set a password, sign in with it instead.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={`Welcome, ${result.name.split(" ")[0]}`}
      description={
        <>
          Choose a password for <span className="text-brand-card">{result.email}</span>. You will
          need it and an emailed code each time you sign in.
        </>
      }
    >
      <SetPasswordForm
        token={token}
        action={acceptInviteAction}
        submitLabel="Set password"
        pendingLabel="Saving"
      />
    </AuthCard>
  );
}
