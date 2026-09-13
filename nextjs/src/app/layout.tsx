import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { ConsentDefaults } from "@/components/site/consent-defaults";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/site/google-tag-manager";
import { SkipToContent } from "@/components/site/skip-to-content";
import { Toaster } from "@/components/ui/sonner";
import { BUSINESS } from "@/content/business";
import { clientEnv, serverEnv } from "@/lib/env";
import { cn } from "@/lib/utils";
import "./globals.css";

/**
 * Three faces, loaded through `next/font/local` from files committed under `src/assets/fonts/`.
 *
 * They are the same faces Google Fonts serves, latin subset, variable weight axis, one woff2
 * each. Holding the files in the repository rather than fetching them from
 * `fonts.googleapis.com` at build time means a build never depends on that host being
 * reachable: behind a proxy, on a restricted network or offline, `next/font/google` silently
 * falls back to a system face and the site ships in the wrong type. The output is otherwise
 * identical, since `next/font/google` self-hosts the files it downloads anyway.
 *
 * Replacing a face means replacing the file. The latin `woff2` URL for a family comes from
 * `https://fonts.googleapis.com/css2?family=<Family>&display=swap` requested with a browser
 * user agent, which is what pins the version in the filename above it.
 *
 * `display: "swap"` renders the fallback immediately and swaps when the face arrives, so a
 * slow font never blocks first paint. `preload` is on for the two faces that appear above
 * the fold on every page. Geist Mono only shows inside blog code blocks, so preloading it
 * would spend bandwidth on most visits for nothing.
 */
const sans = localFont({
  src: "../assets/fonts/Geist-Variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-sans-src",
  display: "swap",
  preload: true,
});

const heading = localFont({
  src: "../assets/fonts/Sora-Variable.woff2",
  weight: "100 800",
  style: "normal",
  variable: "--font-heading-src",
  display: "swap",
  preload: true,
});

const mono = localFont({
  src: "../assets/fonts/GeistMono-Variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-mono-src",
  display: "swap",
  preload: false,
  // The metric adjustment Next.js applies to a fallback is measured against Arial, which is
  // proportional. Matching a monospace face to it would misreport the advance width of every
  // glyph, so the fallback here is the plain ui-monospace stack from globals.css.
  adjustFontFallback: false,
});

const SITE_DESCRIPTION =
  "Bitnox Technology Solutions builds software, websites and business systems, advises on technology, and runs professional training for clients in Nigeria, the United Kingdom and beyond. The Bitnox Event Space in Abeokuta seats 60.";

/**
 * The root metadata.
 *
 * `metadataBase` is the one that matters most and the one that is easiest to leave out.
 * Without it every Open Graph image, canonical and alternate that a page declares as a
 * relative path is emitted as a relative path, which no crawler and no social preview can
 * resolve. Every other page's metadata is merged over this, so the title template, the
 * locale and the Open Graph defaults are stated once.
 *
 * `robots` is permissive here and overridden to `noindex` in the admin layout, which is the
 * right way round: a new public route is indexable by default and a new admin route inherits
 * the block from the segment above it.
 *
 * One thing this file cannot decide on its own: `twitter.card`. A page that declares a
 * `twitter` object replaces this one rather than merging into it, so a page setting only a
 * title and a description would silently drop back to X's small square card and crop a
 * 1200x630 image into a thumbnail. Every page therefore restates
 * `card: "summary_large_image"` alongside its title. The same is true of `openGraph`, which
 * is why each page repeats `url`, `title` and `description` there.
 */
export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${BUSINESS.legalName} | Software, Web and IT`,
    template: `%s | ${BUSINESS.legalName}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: BUSINESS.legalName,
  authors: [{ name: BUSINESS.legalName, url: clientEnv.NEXT_PUBLIC_SITE_URL }],
  creator: BUSINESS.legalName,
  publisher: BUSINESS.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: BUSINESS.legalName,
    locale: "en_NG",
    url: "/",
    title: `${BUSINESS.legalName} | Software, Web and IT`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.legalName} | Software, Web and IT`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Absent until the token is supplied, which is what the optional type expresses. Next.js
  // omits the tag rather than emitting an empty one.
  verification: { google: serverEnv.GOOGLE_SITE_VERIFICATION },
  formatDetection: { telephone: false },
};

/**
 * The browser chrome colour.
 *
 * A separate export because `themeColor` and `colorScheme` moved out of `metadata` in
 * Next 14. It is the ground colour, so the address bar on a phone continues the page instead
 * of drawing a white strip above a near-black site.
 */
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The site has one appearance, so `dark` is fixed on <html> rather than toggled. The
    // shadcn primitives carry `dark:` variants internally and the class is what makes them
    // resolve; the palette in globals.css is defined on both `:root` and `.dark` so the
    // colours are right either way.
    //
    // `suppressHydrationWarning` covers the <html> element only, one level deep. Extensions
    // such as password managers and reader tools stamp attributes on it before React
    // hydrates, and the resulting mismatch warning is about the visitor's browser rather
    // than about this markup. Nothing inside the document is suppressed.
    <html
      lang="en"
      className={cn("dark font-sans", sans.variable, heading.variable, mono.variable)}
      suppressHydrationWarning
    >
      <body>
        {/*
          Before Tag Manager, and before anything else. Consent Mode defaults that arrive
          after the container has initialised are not defaults. See `consent-defaults.tsx`.
        */}
        <ConsentDefaults />
        <GoogleTagManagerNoScript />
        <SkipToContent />
        {children}
        {/* Bottom right, out of the way of the sticky header and the mobile sheet trigger. */}
        <Toaster position="bottom-right" richColors={false} />
        <GoogleTagManager />
      </body>
    </html>
  );
}
