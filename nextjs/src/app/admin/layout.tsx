import type { Metadata } from "next";

/**
 * The admin shell.
 *
 * Deliberately thin. The dashboard chrome, navigation and data screens are Phase 11. What
 * belongs here now is the dark ground and the `noindex` directive.
 *
 * There is no Suspense boundary here on purpose. Cache Components validates client
 * navigations as well as page loads, and on a navigation into an admin route this layout is
 * already mounted, so a boundary at this level sits above everything that re-renders and
 * catches nothing. Each page owns the boundary around its own session and URL reads.
 */

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Bitnox Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <div className="dark bg-brand-bg text-brand-card min-h-dvh">{children}</div>;
}
