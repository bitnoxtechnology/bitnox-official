import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS, itemTag } from "@/lib/cache";
import type { ServiceSlug } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { toProject, toProjectCard, type ProjectCardDTO, type ProjectDTO } from "@/lib/dto";
import { Project, type IProject } from "@/models";

/**
 * Published projects, newest and featured first.
 *
 * Featured comes before `order` so that a project an admin has starred leads the landing
 * page without having to be dragged to the top of the manual ordering as well.
 */
export async function getPublishedProjects(limit?: number): Promise<ProjectCardDTO[]> {
  "use cache";
  cacheTag(CACHE_TAGS.portfolio);
  cacheLife("max");

  await connectToDatabase();

  const query = Project.find({ status: "published" })
    .sort({ featured: -1, order: 1, completedAt: -1, createdAt: -1 })
    .select("-contentJson -contentHtml -images");

  if (limit) query.limit(limit);

  const projects = await query.lean<IProject[]>().exec();

  return projects.map(toProjectCard);
}

/**
 * Published projects tagged with one service, for that service's page.
 *
 * The `services` field on a project is constrained to the service slugs, so this is an index
 * lookup rather than a text match on a free-form field, and `{ services: 1, status: 1 }` is
 * the compound index the model declares for exactly this query.
 *
 * Same `portfolio` tag as the list above. A service page and the portfolio index show the
 * same rows from different angles, and publishing a project should update both in one
 * `revalidateTag` call rather than needing the admin to know which pages exist.
 */
export async function getProjectsByService(
  service: ServiceSlug,
  limit = 3,
): Promise<ProjectCardDTO[]> {
  "use cache";
  cacheTag(CACHE_TAGS.portfolio);
  cacheLife("max");

  await connectToDatabase();

  const projects = await Project.find({ status: "published", services: service })
    .sort({ featured: -1, order: 1, completedAt: -1, createdAt: -1 })
    .limit(limit)
    .select("-contentJson -contentHtml -images")
    .lean<IProject[]>()
    .exec();

  return projects.map(toProjectCard);
}

/**
 * One published project, with its case study and gallery.
 *
 * Two tags, the same arrangement the blog uses: `portfolio` invalidates every project at
 * once, and the per-slug tag lets the admin republish one without discarding the rest.
 *
 * Returns null rather than throwing on a slug that does not exist or is not published, and
 * the page turns that into `notFound()`. A draft and a typo get the same answer, which is
 * deliberate: the response must not tell an anonymous visitor which unpublished slugs exist.
 */
export async function getProjectBySlug(slug: string): Promise<ProjectDTO | null> {
  "use cache";
  cacheTag(CACHE_TAGS.portfolio, itemTag(CACHE_TAGS.portfolio, slug));
  cacheLife("max");

  await connectToDatabase();

  const project = await Project.findOne({ slug, status: "published" })
    .select("-contentJson")
    .lean<IProject | null>()
    .exec();

  return project ? toProject(project) : null;
}

/**
 * Every published slug, for `generateStaticParams`.
 *
 * Only the slug is selected, for the same reason the blog does it: this runs once per build
 * over the whole collection, and pulling every case study and image array into memory to read
 * one string from each is a query that is fine at ten projects and not at two hundred.
 */
export async function getPublishedProjectSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(CACHE_TAGS.portfolio);
  cacheLife("max");

  await connectToDatabase();

  const projects = await Project.find({ status: "published" })
    .sort({ featured: -1, order: 1 })
    .select("slug")
    .lean<{ slug: string }[]>()
    .exec();

  return projects.map((project) => project.slug);
}

/** Slug and `updatedAt` for every published project, for the sitemap's `lastModified`. */
export async function getPublishedProjectIndex(): Promise<{ slug: string; updatedAt: string }[]> {
  "use cache";
  cacheTag(CACHE_TAGS.portfolio);
  cacheLife("max");

  await connectToDatabase();

  const projects = await Project.find({ status: "published" })
    .sort({ featured: -1, order: 1 })
    .select("slug updatedAt")
    .lean<IProject[]>()
    .exec();

  return projects.map((project) => ({
    slug: project.slug,
    updatedAt: project.updatedAt.toISOString(),
  }));
}

/**
 * Other published projects, for the row at the foot of a project page.
 *
 * Projects sharing a service come first, then anything else, so the suggestion is related
 * where it can be and still fills the row where it cannot. A portfolio is small enough that
 * showing an unrelated project is better than showing an empty section.
 */
export async function getRelatedProjects(
  slug: string,
  services: readonly ServiceSlug[],
  limit = 3,
): Promise<ProjectCardDTO[]> {
  "use cache";
  cacheTag(CACHE_TAGS.portfolio);
  cacheLife("max");

  await connectToDatabase();

  const select = "-contentJson -contentHtml -images";

  const related =
    services.length > 0
      ? await Project.find({
          status: "published",
          slug: { $ne: slug },
          services: { $in: services },
        })
          .sort({ featured: -1, order: 1, completedAt: -1 })
          .limit(limit)
          .select(select)
          .lean<IProject[]>()
          .exec()
      : [];

  if (related.length >= limit) return related.map(toProjectCard);

  // Topped up rather than replaced, and the ones already chosen are excluded by slug so the
  // same project cannot appear twice in the row.
  const chosen = new Set([slug, ...related.map((project) => project.slug)]);

  const filler = await Project.find({ status: "published", slug: { $nin: [...chosen] } })
    .sort({ featured: -1, order: 1, completedAt: -1 })
    .limit(limit - related.length)
    .select(select)
    .lean<IProject[]>()
    .exec();

  return [...related, ...filler].map(toProjectCard);
}

/**
 * The services that published work actually exists for, for the portfolio index filter.
 *
 * Read from the projects rather than from `src/content/services.ts`, so the filter never
 * offers a service with nothing behind it.
 */
export async function getPortfolioServices(): Promise<ServiceSlug[]> {
  "use cache";
  cacheTag(CACHE_TAGS.portfolio);
  cacheLife("max");

  await connectToDatabase();

  const services = await Project.distinct("services", { status: "published" }).exec();

  return services as ServiceSlug[];
}
