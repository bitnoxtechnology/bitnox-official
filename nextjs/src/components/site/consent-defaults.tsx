import Script from "next/script";

import { analyticsContainerId } from "@/components/site/google-tag-manager";
import { CONSENT_STORAGE_KEY } from "@/lib/consent";

/**
 * Google Consent Mode v2 defaults, set before Tag Manager loads.
 *
 * `beforeInteractive` and nothing else will do. Consent Mode works by the tags reading a
 * default that was already on the `dataLayer` when they initialised; a default that arrives
 * after `gtm.js` has run is not a default, it is an update, and everything that fired in
 * between has already stored what it wanted to. This is the one script on the site that is
 * allowed into the critical path, and it is four lines of inline JavaScript with no network
 * request behind it.
 *
 * Everything non-essential starts denied. `functionality_storage` and `security_storage` are
 * granted, which is what they are for: the signed session cookie behind the admin sign-in is
 * strictly necessary, and asking permission to keep somebody signed in to a page they had to
 * sign in to reach would be theatre.
 *
 * `wait_for_update` gives the stored answer half a second to arrive before a tag decides it
 * is working without consent. The read below is synchronous, so it is never needed on a
 * normal page load; it covers the case where a tag races the script.
 *
 * The stored answer is read here rather than only in the banner, because a returning visitor
 * who granted consent last week must not spend the first half second of every visit denied.
 * By the time the banner has mounted, hydration has already happened and the first page view
 * has already been sent.
 *
 * `gtag` is defined here and used from `src/lib/consent.ts`. It has to push the `arguments`
 * object itself rather than an array, which is the one detail of this snippet that cannot be
 * tidied: Tag Manager identifies a consent call by that shape.
 *
 * Rendered only when a container id is configured. With no container there is nothing to
 * consent to, and a banner asking permission to run nothing is worse than no banner.
 */
export async function ConsentDefaults() {
  const id = await analyticsContainerId();

  if (!id) return null;

  return (
    // The rule below is a Pages Router rule: it wants `beforeInteractive` inside
    // `pages/_document.js`. In the App Router the documented home for it is the root layout,
    // which is where this component is rendered from, and Next injects it into the head
    // wherever in that tree it appears.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="consent-defaults" strategy="beforeInteractive">
      {`window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});try{var c=window.localStorage.getItem('${CONSENT_STORAGE_KEY}');if(c==='granted'||c==='denied'){gtag('consent','update',{ad_storage:c,ad_user_data:c,ad_personalization:c,analytics_storage:c})}}catch(e){}`}
    </Script>
  );
}
