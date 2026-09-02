import Link from "next/link";

import { BUSINESS } from "@/content/business";

/**
 * The frame around sign-in, verification, reset and invitation.
 *
 * One column, one job per screen. Nothing else is on the page, because everything else would
 * be a place for someone to go instead of finishing what they came to do.
 */
export default function AuthLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="text-foreground hover:text-primary mb-10 block text-sm font-semibold tracking-tight transition-colors"
        >
          {BUSINESS.legalName}
        </Link>
        {children}
      </div>
    </div>
  );
}
