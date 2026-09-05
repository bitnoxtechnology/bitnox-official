"use client";

import * as React from "react";
import { Check, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/urls";
import { cn } from "@/lib/utils";

/**
 * Share a post.
 *
 * Three destinations and a copy button, which is as far as this is worth taking. LinkedIn
 * and X are where technical writing travels, WhatsApp is how a link is actually passed
 * around here, and everything else is a control nobody presses that still costs a row of
 * visual noise.
 *
 * They are plain links carrying a URL, not embedded platform widgets. A widget would load
 * third-party JavaScript on every post and add a tracker to a page that has none, and it
 * would be the only thing on this site asking a visitor's browser to talk to somebody else.
 *
 * The destinations are named rather than drawn. Lucide dropped its brand marks, and the
 * alternative, pasting three companies' logo paths into this file, would put someone else's
 * trademarked artwork in the repository to save four words. Words also survive a rebrand,
 * which the X mark has already demonstrated once.
 *
 * This is the one client component on a post page. The links need no JavaScript at all; the
 * copy button does, because there is no way to write to the clipboard from markup. The
 * confirmation is state rather than a toast, so it appears on the control that was pressed,
 * and it resets itself after two seconds.
 *
 * The URL is built from `NEXT_PUBLIC_SITE_URL` rather than read from `window.location`, so a
 * link copied from a preview or a proxied origin still points at the canonical address.
 */

const RESET_AFTER = 2000;

export function ShareLinks({
  title,
  path,
  className,
}: {
  title: string;
  /** The post's path from the site root. Made absolute here. */
  path: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const url = absoluteUrl(path);

  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), RESET_AFTER);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // A denied permission, an insecure origin, or a browser without the API. There is
      // nothing useful to say about any of them, and the address bar still holds the link.
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-muted-foreground mr-1 text-sm">Share</span>

      <ShareButton
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        label="Share this post on LinkedIn"
      >
        LinkedIn
      </ShareButton>

      <ShareButton
        href={`https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}`}
        label="Share this post on X"
      >
        X
      </ShareButton>

      <ShareButton
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        label="Share this post on WhatsApp"
      >
        WhatsApp
      </ShareButton>

      <Button
        variant="outline"
        size="lg"
        onClick={copy}
        aria-label={copied ? "Link copied" : "Copy the link to this post"}
      >
        {copied ? <Check className="text-primary" aria-hidden /> : <Link2 aria-hidden />}
        {copied ? "Copied" : "Copy link"}
      </Button>

      {/* Announced when it changes, rather than left as a colour change nobody hears. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied to the clipboard" : ""}
      </span>
    </div>
  );
}

function ShareButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button asChild variant="outline" size="lg">
      {/* `noreferrer` alongside `noopener`, because these leave the site and there is no
          reason to hand a social network the page somebody shared from. */}
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
        {children}
      </a>
    </Button>
  );
}
