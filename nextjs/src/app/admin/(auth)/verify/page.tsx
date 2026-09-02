import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthCard } from "@/app/admin/(auth)/auth-card";
import { OtpForm } from "@/app/admin/(auth)/verify/otp-form";
import { LOGIN_PATH } from "@/lib/auth/config";
import { readPendingLoginCookie } from "@/lib/auth/cookies";

export const metadata: Metadata = { title: "Enter your code" };

/**
 * Step two of signing in.
 *
 * Only the sentence naming the address is request-dependent, so only that streams. The same
 * component makes the guard: without a pending cookie the password step was never passed,
 * and there is nothing here to verify, so the visitor goes back to the start.
 */
export default function VerifyPage() {
  return (
    <AuthCard
      title="Enter your code"
      description={
        <Suspense fallback="Check your inbox for a six-digit code. It expires in ten minutes.">
          <SentTo />
        </Suspense>
      }
    >
      <OtpForm />
    </AuthCard>
  );
}

async function SentTo() {
  const pending = await readPendingLoginCookie();

  if (!pending) redirect(LOGIN_PATH);

  return (
    <>
      We sent a six-digit code to <span className="text-foreground">{pending.email}</span>. It
      expires in ten minutes.
    </>
  );
}
