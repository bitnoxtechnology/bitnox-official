import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
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

// Placeholder metadata. The full root metadata, metadataBase, GTM and chrome land in Phase 5.
export const metadata: Metadata = {
  title: "Bitnox Technology Solutions",
  description:
    "Software development, web development, IT consulting and technology training in Abeokuta, Nigeria.",
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
      <body>{children}</body>
    </html>
  );
}
