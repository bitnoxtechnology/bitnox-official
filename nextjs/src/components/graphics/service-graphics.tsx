import type { ReactNode } from "react";

import { AuditFindings } from "@/components/graphics/audit-findings";
import { CohortPlan } from "@/components/graphics/cohort-plan";
import { OpsDashboard } from "@/components/graphics/ops-dashboard";
import { PlanTimeline } from "@/components/graphics/plan-timeline";
import { ScopeSheet } from "@/components/graphics/scope-sheet";
import { SiteWireframe } from "@/components/graphics/site-wireframe";
import { SkillsBrief } from "@/components/graphics/skills-brief";
import { VitalsMeters } from "@/components/graphics/vitals-meters";
import { GraphicCaption } from "@/components/graphics/window-frame";
import type { ServiceSlug } from "@/lib/constants";

/**
 * Which drawing belongs to which service.
 *
 * Two per service, and they do different jobs. The `lead` one sits under the hero and shows
 * the thing itself: the system, the site, the report, the course. The `detail` one sits beside
 * the process rail further down and shows the artefact the engagement produces along the way:
 * the signed scope, the numbers a page is measured against, the order of work, the training
 * brief.
 *
 * The mapping lives here rather than in `src/content/services.ts` for the same reason the
 * icons do. That module is text, read by the navbar, the footer and the sitemap, and a
 * component reference in it would pull all eight of these into all three.
 *
 * Each entry carries its own caption. The frames themselves are `aria-hidden`, so the caption
 * is the only description a screen reader gets, and it has to say what the picture shows
 * rather than repeat the heading above it.
 */

interface ServiceGraphic {
  graphic: ReactNode;
  caption: string;
}

const GRAPHICS: Record<ServiceSlug, { lead: ServiceGraphic; detail: ServiceGraphic }> = {
  "software-development": {
    lead: {
      graphic: <OpsDashboard />,
      caption:
        "An order and stock system of the kind we build: one record, read by dispatch, invoicing and the weekly figures.",
    },
    detail: {
      graphic: <ScopeSheet />,
      caption:
        "The scope document you sign before the build starts, including the list of what is not in it.",
    },
  },
  "web-development": {
    lead: {
      graphic: <SiteWireframe />,
      caption:
        "The same store at both widths. What a customer sees on a phone is the design, not a cut-down version of it.",
    },
    detail: {
      graphic: <VitalsMeters />,
      caption:
        "Google's Core Web Vitals thresholds, which are the numbers your site is ranked and judged against.",
    },
  },
  "it-consulting": {
    lead: {
      graphic: <AuditFindings />,
      caption:
        "A page of the report: every finding ordered by what it is costing you now, not by how hard it is to fix.",
    },
    detail: {
      graphic: <PlanTimeline />,
      caption:
        "The order of work that comes with the findings, so the plan can be started rather than only agreed with.",
    },
  },
  "technology-training": {
    lead: {
      graphic: <CohortPlan />,
      caption:
        "Eight weeks of a course. Teaching stops in week five and everyone starts building something of their own.",
    },
    detail: {
      graphic: <SkillsBrief />,
      caption:
        "The brief behind a team booking: what the group can already do, and what is left to teach.",
    },
  },
};

export function ServiceGraphic({
  slug,
  variant,
  className,
}: {
  slug: ServiceSlug;
  variant: "lead" | "detail";
  className?: string;
}) {
  const entry = GRAPHICS[slug][variant];

  return (
    <figure className={className}>
      {entry.graphic}
      <GraphicCaption>{entry.caption}</GraphicCaption>
    </figure>
  );
}
