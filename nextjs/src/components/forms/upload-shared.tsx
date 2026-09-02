"use client";

import { CircleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * What went wrong during an upload, said in the form rather than in a toast.
 *
 * Shared by the single and multiple upload components. An upload failure is about one field,
 * so it belongs beside that field: a toast that has already faded is no help to somebody
 * who looks back at the form a minute later wondering why the picture is missing.
 */
export function UploadError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <Alert variant="destructive" role="status" aria-live="polite">
      <CircleAlert />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
