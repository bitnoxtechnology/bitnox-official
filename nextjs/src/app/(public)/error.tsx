"use client";

import { useEffect } from "react";

import { ActionButton } from "@/components/site/action-button";
import { StatusPage } from "@/components/site/status-page";

/**
 * The error boundary for the public pages.
 *
 * It has to be a client component: React needs a component that can hold the caught error
 * and re-render when `reset` is called, which is not something a server component can do.
 *
 * The message says nothing about what failed. `error.message` from a server component is
 * replaced by a generic string in production precisely so a stack trace or a connection
 * string cannot reach a visitor, and repeating a digest at them helps nobody. It is logged
 * instead, where it is useful.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public] unhandled error", error);
  }, [error]);

  return (
    <StatusPage
      title="Something went wrong on our side"
      description="This page did not load. Trying again often works, and if it does not, tell us and we will look at it."
      action={{ href: "/", label: "Go to the home page" }}
      secondaryAction={{ href: "/contact", label: "Report the problem" }}
    >
      <ActionButton onClick={reset}>Try again</ActionButton>
    </StatusPage>
  );
}
