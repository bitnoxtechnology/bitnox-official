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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
