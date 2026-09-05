import Script from "next/script";

import { ConsentBanner } from "@/components/site/consent-banner";
import { clientEnv } from "@/lib/env";
import { getSiteSettings } from "@/lib/queries/site-settings";

/**
 * Google Tag Manager, loaded once from the root layout.
 *
 * `afterInteractive` rather than `beforeInteractive`. Tag Manager is a container that loads
 * further scripts of its own, and putting that in the critical path costs the Largest
 * Contentful Paint that the whole static-generation strategy exists to protect. Analytics
 * measures the page; it does not get to slow it down.
 *
 * The container id comes from site settings first and from the environment second, so an
 * analytics change is an admin edit rather than a deploy, and a preview deployment still
 * reports into whichever container its own environment names. Both are optional, so this
 * renders nothing at all until a real one is supplied: a missing id is a quiet no-op rather
 * than a script tag pointing at nowhere.
 *
 * `getSiteSettings` is a cached read, so awaiting it here does not put the root layout, and
 * with it every public page, back onto a request-time render.
 *
 * Non-essential tags are governed by Consent Mode rather than by withholding this script.
 * `ConsentDefaults` sets `analytics_storage` to denied before this runs, and the banner
 * updates it when the visitor answers, so the container loads on every visit and the tags
 * inside it store nothing until they are allowed to. The reasoning is in `src/lib/consent.ts`.
 *
 * The noscript iframe is part of Tag Manager's documented snippet and is what records a
 * visit from a browser running with JavaScript disabled. `dangerouslySetInnerHTML` is how
 * the inline script is written; there is no interpolation of anything a visitor controls,
 * only the container id from the build environment.
 */
export async function analyticsContainerId(): Promise<string | undefined> {
  const settings = await getSiteSettings();
  return settings?.gtmId ?? clientEnv.NEXT_PUBLIC_GTM_ID;
}

export async function GoogleTagManager() {
  const id = await analyticsContainerId();

  if (!id) return null;

  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`}
      </Script>

      {/*
        The banner is rendered here, and only here, because this is the component that knows
        whether there is a container at all. It is last in the document for the same reason
        the script is: a consent notice is the final thing on the page, not the first thing a
        screen reader reads on arrival.
      */}
      <ConsentBanner />
    </>
  );
}

export async function GoogleTagManagerNoScript() {
  const id = await analyticsContainerId();

  if (!id) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
