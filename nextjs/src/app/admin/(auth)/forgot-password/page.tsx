import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/app/admin/(auth)/auth-card";
import { ForgotPasswordForm } from "@/app/admin/(auth)/forgot-password/forgot-password-form";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Give us the address on your account and we will email a link for setting a new password."
      footer={
        <Link
          href="/admin/login"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          Back to sign in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
