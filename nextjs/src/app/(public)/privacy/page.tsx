import type { Metadata } from "next";

import { LegalPage } from "@/components/site/legal-page";
import { PRIVACY } from "@/content/legal";

/**
 * The privacy policy.
 *
 * Same arrangement as the terms: the document is content, the layout is shared, this file is
 * the route. What is particular to this one is that its accuracy is a legal obligation rather
 * than a matter of taste, so the content module describes the systems this application
 * actually runs and is corrected whenever they change.
 */

export const metadata: Metadata = {
  title: PRIVACY.seo.title,
  description: PRIVACY.seo.description,
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy", title: PRIVACY.seo.title, description: PRIVACY.seo.description },
  twitter: {
    card: "summary_large_image",
    title: PRIVACY.seo.title,
    description: PRIVACY.seo.description,
  },
};

export default function PrivacyPage() {
  return <LegalPage document={PRIVACY} />;
}
