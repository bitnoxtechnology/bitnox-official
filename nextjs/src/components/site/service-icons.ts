import { Code2, Compass, GraduationCap, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { ServiceSlug } from "@/lib/constants";

/**
 * One icon per service.
 *
 * Deliberately not in `src/content/services.ts`. That module is text and is read by the
 * navbar, the footer and the sitemap, none of which draw anything, and a component reference
 * sitting in it would pull Lucide into all three bundles.
 *
 * Here rather than duplicated in the landing grid and the services hub, because two copies
 * of a mapping is how a service ends up with a compass on one page and a globe on another.
 */
export const SERVICE_ICONS: Record<ServiceSlug, LucideIcon> = {
  "software-development": Code2,
  "web-development": Globe,
  "it-consulting": Compass,
  "technology-training": GraduationCap,
};
