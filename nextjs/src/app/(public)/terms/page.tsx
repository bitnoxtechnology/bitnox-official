import type { Metadata } from "next";

import { LegalPage } from "@/components/site/legal-page";
import { TERMS } from "@/content/legal";

/**
 * The terms of service.
 *
 * The document is content in `src/content/legal.ts` and the layout is shared with the
 * privacy policy, so this file is the route and the metadata and nothing else. Correcting a
 * clause is a content edit.
 *
 * Indexable, deliberately. A legal page carries the name and undertakings of the business and
 * is one of the pages a search engine reads to decide the site belongs to a real company.
 */

export const metadata: Metadata = {
  title: TERMS.seo.title,
  description: TERMS.seo.description,
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms", title: TERMS.seo.title, description: TERMS.seo.description },
  twitter: {
    card: "summary_large_image",
    title: TERMS.seo.title,
    description: TERMS.seo.description,
  },
};

export default function TermsPage() {
  return <LegalPage document={TERMS} />;
}
