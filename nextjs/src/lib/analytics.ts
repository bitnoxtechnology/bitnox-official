/**
 * The one way anything on this site talks to Google Tag Manager.
 *
 * Tag Manager reads a global array called `dataLayer`. Anything pushed onto it before the
 * container has loaded is replayed when it does, which is why the calls below never wait for
 * anything and never check whether a container exists: a push into an array on a page with no
 * container configured is a no-op that costs nothing.
 *
 * The point of this file is the type. `window.dataLayer.push({ event: "form_sumbit" })` is
 * valid JavaScript, ships fine, and produces a tag that never fires and a trigger nobody can
 * find. The union below makes the event names and their parameters a compile error to get
 * wrong, and it doubles as the list a Tag Manager container is configured against: every
 * trigger in the container corresponds to one member of `DataLayerEvent`, and nothing else is
 * ever pushed.
 *
 * Names and parameters follow the GA4 convention of lower snake case, because that is what
 * the tags reading them expect and renaming them in the container is work for nothing.
 */

/** Where a submission or a click happened. The pathname, filled in at push time. */
type PageContext = { page_path?: string };

export type DataLayerEvent = PageContext &
  (
    | {
        /** A form that reached the server and came back successful. Never a failed attempt. */
        event: "form_submit";
        form_name: "contact" | "newsletter";
        /** For a form that appears in more than one place, such as the newsletter. */
        form_location?: string;
      }
    | {
        /**
         * The Event Space booking enquiry, which is the conversion this site is built around
         * and therefore an event of its own rather than a `form_submit` with a label. A
         * container marking one event as a conversion should not have to filter a parameter
         * to find it.
         */
        event: "event_space_enquiry";
      }
    | {
        /** A click on a primary or secondary call to action anywhere on a public page. */
        event: "cta_click";
        cta_label: string;
        cta_destination: string;
        /** Which of the pair was clicked, since every band offers at most two. */
        cta_variant: "primary" | "secondary";
      }
    | {
        /** A click on any link leaving this origin. */
        event: "outbound_click";
        /** The two sister properties are named, so they can be reported on separately. */
        outbound_property: "education" | "cleaning" | "other";
        outbound_url: string;
        link_text?: string;
      }
    | {
        /** The visitor's answer to the consent banner, so the container can react to it. */
        event: "consent_choice";
        analytics_consent: "granted" | "denied";
      }
  );

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Push one typed event.
 *
 * Safe to call from anywhere in the browser, including before Tag Manager has loaded and on a
 * deployment with no container id at all. It does nothing at all on the server, so a shared
 * component that calls it inside an event handler does not have to guard the call itself.
 *
 * `page_path` is filled in here rather than at each call site, because every one of these
 * events wants it and none of them should have to remember.
 */
export function pushDataLayer(event: DataLayerEvent): void {
  if (typeof window === "undefined") return;

  window.dataLayer ??= [];
  window.dataLayer.push({ page_path: window.location.pathname, ...event });
}
