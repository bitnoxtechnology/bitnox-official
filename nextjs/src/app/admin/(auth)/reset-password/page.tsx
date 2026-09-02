import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AuthCard, AuthCardSkeleton } from "@/app/admin/(auth)/auth-card";
import { SetPasswordForm } from "@/app/admin/(auth)/set-password-form";
import { resetPasswordAction } from "@/lib/actions/auth-actions";
import { inspectAuthToken } from "@/lib/auth/auth-tokens";

export const metadata: Metadata = { title: "Choose a new password" };

/**
 * The page a reset link lands on.
 *
 * Everything on it depends on the token in the URL, including the heading, so the whole card
 * sits behind one boundary and the skeleton holds its shape until the token has been read.
 *
 * The token is checked before the form is drawn and spent only when the form is submitted.
 * Showing somebody a password form and telling them afterwards that the link expired is the
 * wrong order to find that out.
 */
export default function ResetPasswordPage({ searchParams }: PageProps<"/admin/reset-password">) {
  return (
    <Suspense fallback={<AuthCardSkeleton />}>
      <ResetCard searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetCard({
  searchParams,
}: {
  searchParams: PageProps<"/admin/reset-password">["searchParams"];
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  const result = await inspectAuthToken("password_reset", token);

  if (!result.ok) {
    return (
      <AuthCard
        title="This link no longer works"
        description={
          result.reason === "expired"
            ? "Reset links last an hour. Ask for another and use it straight away."
            : "The link has been used already, or part of it was lost on the way. Ask for another."
        }
        footer={
          <Link
            href="/admin/forgot-password"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Request a new link
          </Link>
        }
      >
        <p className="text-muted-foreground text-sm">
          Your current password still works until a new one is set.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description={
        <>
          Setting a password for <span className="text-foreground">{result.email}</span>. Every
          other signed-in device is signed out.
        </>
      }
    >
      <SetPasswordForm
        token={token}
        action={resetPasswordAction}
        submitLabel="Save password"
        pendingLabel="Saving"
      />
    </AuthCard>
  );
}
