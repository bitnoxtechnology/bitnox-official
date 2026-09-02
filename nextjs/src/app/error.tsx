"use client";

import { useEffect } from "react";

import { ActionButton } from "@/components/site/action-button";
import { StatusPage } from "@/components/site/status-page";

/**
 * The last error boundary below the root layout.
 *
 * It catches what the group boundaries did not, which in practice means a failure in a
 * layout above them. No site chrome here: a header that renders a failing layout would fail
 * again inside the boundary meant to contain it.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root] unhandled error", error);
  }, [error]);

  return (
    <StatusPage
      title="Something went wrong"
      description="This page did not load. Trying again often works."
      action={{ href: "/", label: "Go to the home page" }}
    >
      <ActionButton onClick={reset}>Try again</ActionButton>
    </StatusPage>
  );
}
