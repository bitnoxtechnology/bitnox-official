import Script from "next/script";

import { clientEnv } from "@/lib/env";

/**
 * Google Tag Manager, loaded once from the root layout.
 *
 * `afterInteractive` rather than `beforeInteractive`. Tag Manager is a container that loads
 * further scripts of its own, and putting that in the critical path costs the Largest
 * Contentful Paint that the whole static-generation strategy exists to protect. Analytics
 * measures the page; it does not get to slow it down.
 *
 * The container id is optional in the environment, so this renders nothing at all until the
 * real one is supplied. That keeps development traffic out of the production container and
 * means a missing id is a quiet no-op rather than a script tag pointing at nowhere.
 *
 * The noscript iframe is part of Tag Manager's documented snippet and is what records a
 * visit from a browser running with JavaScript disabled. `dangerouslySetInnerHTML` is how
 * the inline script is written; there is no interpolation of anything a visitor controls,
 * only the container id from the build environment.
 */
export function GoogleTagManager() {
  const containerId = clientEnv.NEXT_PUBLIC_GTM_ID;

  if (!containerId) return null;

  return (
    <Script id="gtm" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${containerId}');`}
    </Script>
  );
}

export function GoogleTagManagerNoScript() {
  const containerId = clientEnv.NEXT_PUBLIC_GTM_ID;

  if (!containerId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
