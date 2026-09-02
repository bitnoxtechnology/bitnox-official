import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache";
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
