import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

// Placeholder metadata. The full root metadata, metadataBase, GTM and chrome land in Phase 5.
export const metadata: Metadata = {
  title: "Bitnox Technology Solutions",
  description:
    "Software development, web development, IT consulting and technology training in Abeokuta, Nigeria.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `suppressHydrationWarning` covers the <html> element only, one level deep. Extensions
    // such as password managers and reader tools stamp attributes on it before React
    // hydrates, and the resulting mismatch warning is about the visitor's browser rather
    // than about this markup. Nothing inside the document is suppressed.
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
