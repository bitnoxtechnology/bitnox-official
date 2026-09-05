"use client";

import { useEffect } from "react";

import { pushDataLayer } from "@/lib/analytics";
import { clientEnv } from "@/lib/env";

/**
 * One click listener for the whole public site.
 *
 * Calls to action and outbound links are everywhere: in the header, in the hero, at the foot
 * of every page, inside body copy on the contact and services pages. Making each of them
 * report a click the ordinary way would mean an `onClick` handler, which would mean
 * `"use client"` on every component that contains one, which would mean the entire page tree
 * turning into client components to satisfy analytics. That is the opposite of the rule this
 * codebase is built on.
 *
 * So the tracking is inverted. The server-rendered markup carries a `data-cta` attribute,
 * which costs nothing and ships no JavaScript, and this one listener on `document` reads it
 * from whatever was clicked. Outbound links need no attribute at all, because an origin that
 * is not this one is visible from the href.
 *
 * Capture phase, so a click is recorded before any handler further down can stop it
 * propagating. `defaultPrevented` is still respected: a click that was cancelled did not
 * navigate anywhere and is not an outbound click.
 *
 * Middle clicks and modified clicks are included. They open the link in a new tab, which is
 * the visitor following it, and dropping them would quietly under-report every link somebody
 * opens in the background. Right clicks are not a click event, so they never arrive here.
 */
export function AnalyticsListener() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button > 1) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const cta = target.closest<HTMLElement>("[data-cta]");
      const anchor = target.closest<HTMLAnchorElement>("a[href]");

      if (cta) {
        pushDataLayer({
          event: "cta_click",
          cta_label: label(cta),
          // The destination rather than the label, because two pages use "Talk to us" for
          // one target and "Start a project" for the same one.
          cta_destination: anchor?.getAttribute("href") ?? "",
          cta_variant: cta.dataset.cta === "secondary" ? "secondary" : "primary",
        });
      }

      if (anchor) {
        const property = outboundProperty(anchor.href);

        if (property) {
          pushDataLayer({
            event: "outbound_click",
            outbound_property: property,
            outbound_url: anchor.href,
            link_text: label(anchor) || undefined,
          });
        }
      }
    };

    document.addEventListener("click", onClick, { capture: true });

    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

/**
 * Which property a link leaves for, or nothing if it does not leave at all.
 *
 * Compared by host rather than by prefix, so `edu.bitnoxsolution.com/courses/data-analysis`
 * is recognised and a link to a page whose query string happens to contain the URL is not. A
 * link this parser cannot read, such as `mailto:` or `tel:`, throws and is treated as
 * internal, which is what it is: nothing left the site.
 */
function outboundProperty(href: string): "education" | "cleaning" | "other" | null {
  try {
    const { host } = new URL(href, window.location.href);

    if (host === window.location.host) return null;
    if (host === new URL(clientEnv.NEXT_PUBLIC_EDU_URL).host) return "education";
    if (host === new URL(clientEnv.NEXT_PUBLIC_CLEANING_URL).host) return "cleaning";

    return "other";
  } catch {
    return null;
  }
}

/**
 * The visible text of the thing clicked, trimmed and capped.
 *
 * A call to action holds an arrow badge as well as a label, and the arrow is an SVG, so
 * `textContent` is the label and nothing else. The cap is there because a report is easier to
 * read than a paragraph that happened to contain a link.
 */
function label(element: Element): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}
