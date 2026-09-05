import "server-only";

import {
  ADMIN_PER_PAGE,
  connectForRequest,
  paginate,
  searchPattern,
  type Paginated,
} from "@/lib/queries/admin/shared";
import {
  toProjectCard,
  toProjectEditor,
  type ProjectCardDTO,
  type ProjectEditorDTO,
} from "@/lib/dto";
import type { ListQuery } from "@/lib/validations/admin-schema";
import { Project, type IProject } from "@/models";

/**
 * Every project, in every state.
 *
 * Sorted the way the portfolio itself is, `featured` then `order`, rather than by when it was
 * edited. The manual ordering is the thing being managed on this screen, so a list that does
 * not show it is a list you cannot reorder from.
 */
export async function listProjects(query: ListQuery): Promise<Paginated<ProjectCardDTO>> {
  await connectForRequest();

  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;

  if (query.q) {
    const pattern = searchPattern(query.q);
    filter.$or = [
      { title: pattern },
      { slug: pattern },
      { summary: pattern },
      { client: pattern },
      { tags: pattern },
    ];
  }

  const total = await Project.countDocuments(filter).exec();
  const { page, pageCount, skip, limit } = paginate(total, query.page);

  const projects = await Project.find(filter)
    .sort({ featured: -1, order: 1, updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-contentJson -contentHtml -images")
    .lean<IProject[]>()
    .exec();

  return { rows: projects.map(toProjectCard), total, page, pageCount, perPage: ADMIN_PER_PAGE };
}

export async function getProjectForEditor(id: string): Promise<ProjectEditorDTO | null> {
  await connectForRequest();

  const project = await Project.findById(id).lean<IProject | null>().exec();

  return project ? toProjectEditor(project) : null;
}

/**
 * Titles and ids only, for the "related project" select on the testimonial form.
 *
 * Every project rather than only the published ones, because a testimonial is often written
 * while the case study behind it is still a draft, and the two are published together.
 */
export async function listProjectOptions(): Promise<{ id: string; title: string }[]> {
  await connectForRequest();

  const projects = await Project.find()
    .sort({ title: 1 })
    .select("title")
    .lean<{ _id: unknown; title: string }[]>()
    .exec();

  return projects.map((project) => ({ id: String(project._id), title: project.title }));
}
