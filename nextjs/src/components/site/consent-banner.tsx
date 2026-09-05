"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { pushDataLayer } from "@/lib/analytics";
import {
  answerConsent,
  consentPromptServerSnapshot,
  consentPromptSnapshot,
  subscribeConsentPrompt,
  CONSENT_SETTINGS_EVENT,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * The analytics consent banner.
 *
 * It appears once, on the first visit, and never again once it has been answered. There is no
 * second banner, no interstitial and nothing covering the page: it sits at the bottom, the
 * page is readable behind it, and both answers are one click. A visitor who ignores it is not
 * tracked, which is the difference between asking and pretending to ask.
 *
 * Whether it is open is read through `useSyncExternalStore` rather than held in state. The
 * answer lives in `localStorage`, which does not exist during prerendering, so the server
 * snapshot is always closed and the client's first commit opens it if there is no answer yet.
 * That is what keeps a statically generated page free of a hydration mismatch, and it is why
 * the footer's settings button can reopen this from the other end of the tree without a
 * context or a state manager between them.
 *
 * The visitor can change their mind. That is the "withdrawable at any time" the privacy
 * policy promises, and it is the reason the store has a reopen path at all.
 *
 * The choice is pushed to the `dataLayer` as well as into Consent Mode, so a container can
 * react to the answer, for example by firing nothing at all rather than firing a cookieless
 * ping.
 */
export function ConsentBanner() {
  const open = useSyncExternalStore(
    subscribeConsentPrompt,
    consentPromptSnapshot,
    consentPromptServerSnapshot,
  );

  if (!open) return null;

  const answer = (choice: ConsentChoice) => {
    answerConsent(choice);
    pushDataLayer({ event: "consent_choice", analytics_consent: choice });
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-heading"
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
    >
      <div className="glass mx-auto max-w-3xl rounded-2xl p-5 sm:p-6">
        <h2 id="consent-heading" className="text-foreground text-base font-semibold">
          Analytics, only if you agree to it
        </h2>

        <p className="text-muted-foreground mt-2 text-sm">
          We use Google Analytics to see which pages people read and which ones they leave. Nothing
          is stored in your browser until you accept, and we do not use advertising or cross-site
          trackers either way. The admin sign-in cookie is separate and always on, because signing
          in needs it.{" "}
          <Link href="/privacy#cookies" className="text-primary underline-offset-4 hover:underline">
            Read the privacy policy
          </Link>
          .
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" onClick={() => answer("granted")}>
            Accept analytics
          </Button>
          <Button type="button" variant="outline" onClick={() => answer("denied")}>
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * The way back to the banner, for the footer.
 *
 * A button rather than a link, because it changes nothing about the address and navigating to
 * a URL that reopened a dialog would put that dialog in the visitor's history.
 */
export function ConsentSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT))}
    >
      Analytics settings
    </button>
  );
}
