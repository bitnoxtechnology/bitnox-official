import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache";
import type { ServiceSlug } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { toProjectCard, type ProjectCardDTO } from "@/lib/dto";
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
 * The `services` field on a project is constrained to the four slugs, so this is an index
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
