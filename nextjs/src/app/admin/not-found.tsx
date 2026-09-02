import type { Metadata } from "next";

import { StatusPage } from "@/components/site/status-page";

/**
 * A 404 inside the admin.
 *
 * Usually a record that has been deleted in another tab, or an id pasted from an old email,
 * so the wording says that rather than talking about broken links.
 */
export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function AdminNotFound() {
  return (
    <StatusPage
      code="404"
      title="That record is not here"
      description="It may have been deleted, or the address may be out of date. The dashboard has the current lists."
      action={{ href: "/admin", label: "Back to the dashboard" }}
    />
  );
}
