"use client";

import { useEffect } from "react";

import { ActionButton } from "@/components/site/action-button";
import { StatusPage } from "@/components/site/status-page";

/**
 * The admin error boundary.
 *
 * Separate from the public one because the way out is different. A visitor is sent to the
 * home page; an admin is sent back to the dashboard, since the site's home page is not where
 * they were going and signing in again from there is an extra trip.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] unhandled error", error);
  }, [error]);

  return (
    <StatusPage
      title="That screen did not load"
      description="Something failed while loading this part of the admin. Nothing you were editing has been saved, so check the record before trying again."
      action={{ href: "/admin", label: "Back to the dashboard" }}
    >
      <ActionButton onClick={reset}>Try again</ActionButton>
    </StatusPage>
  );
}
