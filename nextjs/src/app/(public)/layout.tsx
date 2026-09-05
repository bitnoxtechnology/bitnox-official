import { AnalyticsListener } from "@/components/site/analytics-listener";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";

/**
 * The chrome every public page sits inside.
 *
 * A route group rather than a folder, so `/about` stays `/about` and does not become
 * `/public/about`. The admin has its own layout and shares none of this: no site header, no
 * footer, no newsletter form, and nothing from the editor or the dashboard reaching a public
 * bundle.
 *
 * This is a server component. `Navbar` is the only client component in the chrome, because
 * it owns the mobile sheet and the scrolled state, and `Footer` stays on the server apart
 * from the newsletter form inside it. That is the "use client" as far down the tree as
 * possible rule applied to the two pieces that appear on every page: whatever they ship, the
 * whole site pays for.
 *
 * `AnalyticsListener` renders nothing. It is a single delegated click handler covering every
 * call to action and every outbound link on the public site, which is what keeps those
 * components on the server. It is here rather than in the root layout because the admin has
 * neither.
 *
 * `<main id="main-content">` is the target of the skip link in the root layout.
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
      <AnalyticsListener />
    </div>
  );
}
