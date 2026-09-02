import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";

import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/site/google-tag-manager";
import { SkipToContent } from "@/components/site/skip-to-content";
import { Toaster } from "@/components/ui/sonner";
import { BUSINESS } from "@/content/business";
import { clientEnv, serverEnv } from "@/lib/env";
import { cn } from "@/lib/utils";
import "./globals.css";

/**
 * Three faces, loaded through `next/font` so the files are self-hosted, hashed and served
 * from this origin. No connection to fonts.googleapis.com is made at runtime, which removes
 * a third-party round trip from the critical path and a consent question from the privacy
 * page.
 *
 * `display: "swap"` renders the fallback immediately and swaps when the face arrives, so a
 * slow font never blocks first paint. `preload` is on for the two faces that appear above
 * the fold on every page. Geist Mono only shows inside blog code blocks, so preloading it
 * would spend bandwidth on most visits for nothing.
 */
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans-src",
  display: "swap",
  preload: true,
});

const heading = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading-src",
  display: "swap",
  preload: true,
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-src",
  display: "swap",
  preload: false,
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
