import Link from "next/link";

import { BUSINESS } from "@/content/business";

/**
 * The frame around sign-in, verification, reset and invitation.
 *
 * One column, one job per screen. Nothing else is on the page, because everything else would
 * be a place for someone to go instead of finishing what they came to do.
 *
 * `<main>` rather than a `<div>`, which is the one thing "nothing else is on the page" does
 * not excuse. The skip link in the root layout targets `#main-content`, and a page with no
 * main landmark gives a screen reader nothing to jump to and no way to tell the form from
 * the wordmark above it. There is deliberately no `<nav>` and no `<footer>` here: the whole
 * point of the screen is that there is nowhere else to go.
 */
export default function AuthLayout({ children }: LayoutProps<"/admin">) {
  return (
    <main
      id="main-content"
      className="flex min-h-dvh flex-col items-center justify-center px-6 py-16"
    >
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="text-foreground hover:text-primary mb-10 block text-sm font-semibold tracking-tight transition-colors"
        >
          {BUSINESS.legalName}
        </Link>
        {children}
      </div>
    </main>
  );
}
