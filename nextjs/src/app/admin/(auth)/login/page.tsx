import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/app/admin/(auth)/auth-card";
import { LoginForm } from "@/app/admin/(auth)/login/login-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ADMIN_ROOT } from "@/lib/auth/config";
import { getCurrentUser } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Sign in" };

/**
 * The sign-in screen.
 *
 * The card and the form are static, so they are in the prerendered shell and are usable the
 * moment the page arrives. The two things that need the request, the notice after a reset and
 * the redirect for somebody who is already signed in, sit behind a boundary above the form
 * and stream in. Neither of them changes the height of the form, so nothing moves under the
 * cursor when they resolve.
 *
 * The signed-in redirect is made here rather than in `proxy.ts` because it needs the
 * database. A cookie with a valid signature can still belong to a revoked session, and
 * bouncing that visitor to a dashboard that would bounce them straight back is a loop.
 */
export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <AuthCard
      title="Sign in"
      description="Enter your password, then the six-digit code we email you."
    >
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
        <Notice searchParams={searchParams} />
      </Suspense>

      <LoginForm />
    </AuthCard>
  );
}

async function RedirectIfSignedIn() {
  if (await getCurrentUser()) redirect(ADMIN_ROOT);
  return null;
}

/** The one-line confirmation after a completed reset or an accepted invitation. */
async function Notice({
  searchParams,
}: {
  searchParams: PageProps<"/admin/login">["searchParams"];
}) {
  const params = await searchParams;

  const message =
    params.reset === "done"
      ? "Your password has been changed. Sign in with it now."
      : params.invited === "done"
        ? "Your account is ready. Sign in with your new password."
        : null;

  if (!message) return null;

  return (
    <Alert className="border-primary/30 text-foreground mb-6">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
