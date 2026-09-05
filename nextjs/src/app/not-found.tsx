import type { Metadata } from "next";

import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { NotFoundLinks } from "@/components/site/not-found-links";
import { StatusPage } from "@/components/site/status-page";

/**
 * The 404 for a URL that matched no route in the application.
 *
 * It renders directly inside the root layout, above every route group, so no header or
 * footer has been drawn for it. That is why it brings its own: a visitor who mistyped an
 * address should land on the site rather than on a bare sentence with nothing around it.
 *
 * The public group has its own `not-found.tsx` for `notFound()` calls from inside a page,
 * where the chrome is already there and repeating it would draw two headers.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        <StatusPage
          code="404"
          title="That page is not here"
          description="Nothing on this site answers to that address. The link may be old, or it may have a typo in it."
          action={{ href: "/", label: "Go to the home page" }}
          secondaryAction={{ href: "/contact", label: "Tell us what you were looking for" }}
        />
        <NotFoundLinks />
      </main>
      <Footer />
    </div>
  );
}
