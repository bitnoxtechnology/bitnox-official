import { SERVICE_SLUGS, type ServiceSlug } from "@/lib/constants";

/**
 * The four services, as typed content.
 *
 * Exactly four, everywhere: the nav dropdown, the landing grid, the services hub, the
 * footer and the sitemap all read this array, so the set cannot drift between them.
 *
 * Cloud infrastructure, digital marketing and cybersecurity are deliberately absent as
 * entries and present as capabilities inside their parent service. They are real work and
 * real search terms, but promoting them to top-level services would give the site seven
 * competing pages where four is already the honest number.
 *
 * Icons are not here. This module is text, and the landing grid decides how it is drawn.
 */

export interface Service {
  slug: ServiceSlug;
  /** The name, used in the nav, headings and the sitemap. */
  name: string;
  /** One line under the name in the nav dropdown. Sentence case, no full stop. */
  tagline: string;
  /** Two sentences at most. The card body and the service page's lead paragraph. */
  summary: string;
  /** Named capabilities. These carry the keywords that are not top-level pages. */
  capabilities: string[];
}

export const SERVICES: readonly Service[] = [
  {
    slug: "software-development",
    name: "Software Development",
    tagline: "Custom software and business systems",
    summary:
      "Business management systems, internal tools and custom applications built around the way your team already works. We stay on after launch to fix, extend and host what we built.",
    capabilities: [
      "Business management systems",
      "Custom web applications",
      "API design and systems integration",
      "Cloud infrastructure and deployment",
      "Maintenance and support after launch",
    ],
  },
  {
    slug: "web-development",
    name: "Web Development",
    tagline: "Websites, stores and portals that get found",
    summary:
      "Professional websites, online stores and customer portals that load quickly, read well on a phone and can be edited by your own team without calling us first.",
    capabilities: [
      "Professional business websites",
      "E-commerce platforms and payments",
      "Customer and client portals",
      "Digital marketing and search optimisation",
      "Performance, accessibility and analytics",
    ],
  },
  {
    slug: "it-consulting",
    name: "IT Consulting",
    tagline: "Advice on what to build, replace and secure",
    summary:
      "Technology advisory for organisations deciding what to build, what to replace and what to protect. You get a written plan with costs and an order of work, not a slide deck.",
    capabilities: [
      "Technology strategy and advisory",
      "Digital transformation planning",
      "Cybersecurity review and hardening",
      "Systems audit and vendor selection",
      "IT policy, process and staff onboarding",
    ],
  },
  {
    slug: "technology-training",
    name: "Technology Training",
    tagline: "Professional training in technology and digital skills",
    summary:
      "Practical courses in software development, data and digital skills, taught online and in person at the Bitnox Event Space. Course listings and enrolment are handled by Bitnox Education.",
    capabilities: [
      "Software development and programming",
      "Data analysis and reporting",
      "Digital skills for the workplace",
      "Corporate and team training",
      "In-person classes and online cohorts",
    ],
  },
] as const;

/** Guards against a slug in the array falling out of step with the models. */
export const SERVICE_BY_SLUG: Readonly<Record<ServiceSlug, Service>> = Object.freeze(
  Object.fromEntries(SERVICES.map((service) => [service.slug, service])) as Record<
    ServiceSlug,
    Service
  >,
);

export function servicePath(slug: ServiceSlug): string {
  return `/services/${slug}`;
}

export function serviceName(slug: ServiceSlug): string {
  return SERVICE_BY_SLUG[slug].name;
}

/**
 * The two lists must hold the same four slugs.
 *
 * `SERVICE_SLUGS` is in `lib/constants.ts` because the Mongoose models validate against it
 * before this module exists. Two lists means they can disagree, so the disagreement is made
 * to fail loudly at import time rather than quietly at render time.
 */
if (SERVICES.length !== SERVICE_SLUGS.length) {
  throw new Error("SERVICES and SERVICE_SLUGS have drifted apart. They must hold the same four.");
}
