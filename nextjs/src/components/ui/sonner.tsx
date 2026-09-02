"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

/**
 * Toasts, in the brand.
 *
 * The shadcn version read the theme from `next-themes` and defaulted to `"system"`. This
 * site has one appearance and no theme provider, so on a visitor whose operating system is
 * set to light, Sonner applied its light styling on top of a near-black page. `theme` is
 * pinned instead, and the `next-themes` dependency is gone with it.
 *
 * The colours come from the same variables as everything else, so a toast is the same
 * surface as a popover rather than a second, slightly different dark panel. `success` is the
 * cyan: this is the only place the brand colour reports an outcome, and a green tick beside
 * cyan buttons is one accent too many.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--popover)",
          "--success-text": "var(--primary)",
          "--success-border": "var(--border)",
          "--error-bg": "var(--popover)",
          "--error-text": "var(--destructive)",
          "--error-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
