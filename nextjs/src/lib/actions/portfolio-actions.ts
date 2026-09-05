"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import {
  fail,
  ok,
  text,
  toActionState,
  validate,
  type ActionResult,
  type ActionState,
} from "@/lib/actions/action-state";
import { withAuth } from "@/lib/actions/with-auth";
import { renderContentHtml } from "@/lib/blog/render";
import { CACHE_TAGS, itemTag } from "@/lib/cache";
import { SERVICE_SLUGS, type PublishStatus, type ServiceSlug } from "@/lib/constants";
import { connectToDatabase, isDuplicateKeyError } from "@/lib/db";
import { idSchema } from "@/lib/validations/admin-schema";
import { projectSchema, type ProjectData } from "@/lib/validations/project-schema";
import { Project } from "@/models";
import type { TiptapDoc } from "@/models/shared";

/**
 * Portfolio administration.
 *
 * The same shape as the blog actions and for the same reasons: guarded by wrapping rather
 * than by remembering, the case study rendered to HTML on the server so a reader never
 * downloads the editor, and the portfolio tags invalidated on every write because the public
 * pages are static and nothing else will refresh them.
 *
 * What is different is the gallery. A project carries an ordered list of images rather than
 * one cover, so `sortOrder` is rewritten from array position on save and the order in the
 * form is the order on the page.
 */

function revalidatePortfolio(slug: string, previousSlug?: string): void {
  revalidateTag(CACHE_TAGS.portfolio, "max");
  revalidateTag(itemTag(CACHE_TAGS.portfolio, slug), "max");
  if (previousSlug && previousSlug !== slug) {
    revalidateTag(itemTag(CACHE_TAGS.portfolio, previousSlug), "max");
  }
}

function documentFrom(data: ProjectData) {
  return {
    title: data.title,
    summary: data.summary,
    contentJson: data.contentJson as TiptapDoc,
    contentHtml: renderContentHtml(data.contentJson as TiptapDoc),
    coverImage: data.coverImage,
    // Position decides order, so it is rewritten here rather than trusted from the client.
    images: (data.images ?? []).map((image, index) => ({ ...image, sortOrder: index })),
    ogImage: data.ogImage,
    client: data.client,
    industry: data.industry,
    services: data.services,
    techStack: data.techStack,
    completedAt: data.completedAt,
    liveUrl: data.liveUrl,
    repoUrl: data.repoUrl,
    tags: data.tags,
    status: data.status,
    featured: data.featured,
    order: data.order,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
  };
}

/**
 * `services` is the one field that arrives as several entries under one key.
 *
 * A checkbox group posts one `FormData` entry per ticked box, so `getAll` is what reads it.
 * Everything else on this form is a single value.
 */
function parseProjectForm(formData: FormData): ActionResult<ProjectData> {
  const services = formData
    .getAll("services")
    .filter((value): value is string => typeof value === "string")
    .filter((value): value is ServiceSlug => (SERVICE_SLUGS as readonly string[]).includes(value));

  return validate(projectSchema, {
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    summary: text(formData, "summary"),
    contentJson: text(formData, "contentJson"),
    coverImage: text(formData, "coverImage"),
    images: text(formData, "images"),
    ogImage: text(formData, "ogImage"),
    client: text(formData, "client"),
    industry: text(formData, "industry"),
    services,
    techStack: text(formData, "techStack"),
    completedAt: text(formData, "completedAt"),
    liveUrl: text(formData, "liveUrl"),
    repoUrl: text(formData, "repoUrl"),
    tags: text(formData, "tags"),
    status: text(formData, "status"),
    featured: text(formData, "featured"),
    order: text(formData, "order") || "0",
  });
}

const SLUG_TAKEN = "A project already uses that slug. Choose another.";

export const createProjectAction = withAuth<[FormData], { id: string; slug: string }>(
  async (_user, formData) => {
    const parsed = parseProjectForm(formData);
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    try {
      const project = await Project.create({
        ...documentFrom(parsed.data),
        ...(parsed.data.slug ? { slug: parsed.data.slug } : {}),
      });

      revalidatePortfolio(project.slug);

      return ok({ id: String(project._id), slug: project.slug });
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) return fail(SLUG_TAKEN, { slug: [SLUG_TAKEN] });
      throw error;
    }
  },
);

export async function createProjectFormAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await createProjectAction(formData);

  if (!result.ok) return toActionState(result);

  redirect(`/admin/portfolio/${result.data.id}?created=1`);
}

export const updateProjectAction = withAuth<[string, FormData], { slug: string }>(
  async (_user, id, formData) => {
    const identified = validate(idSchema, { id });
    if (!identified.ok) return identified;

    const parsed = parseProjectForm(formData);
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const project = await Project.findById(identified.data.id).exec();
    if (!project) return fail("That project no longer exists.");

    const previousSlug = project.slug;

    project.set(documentFrom(parsed.data));
    if (parsed.data.slug) project.slug = parsed.data.slug;

    try {
      await project.save();
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) return fail(SLUG_TAKEN, { slug: [SLUG_TAKEN] });
      throw error;
    }

    revalidatePortfolio(project.slug, previousSlug);

    return ok({ slug: project.slug }, "Saved.");
  },
);

export async function updateProjectFormAction(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return toActionState(await updateProjectAction(id, formData), "Saved.");
}

export const setProjectStatusAction = withAuth<[string, PublishStatus], { status: PublishStatus }>(
  async (_user, id, status) => {
    const parsed = validate(idSchema, { id });
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const project = await Project.findByIdAndUpdate(
      parsed.data.id,
      { $set: { status } },
      { new: true },
    )
      .lean()
      .exec();

    if (!project) return fail("That project no longer exists.");

    revalidatePortfolio(project.slug);

    return ok({ status: project.status });
  },
);

export const deleteProjectAction = withAuth<[string], { slug: string }>(async (_user, id) => {
  const parsed = validate(idSchema, { id });
  if (!parsed.ok) return parsed;

  await connectToDatabase();

  const project = await Project.findByIdAndDelete(parsed.data.id).lean().exec();
  if (!project) return fail("That project no longer exists.");

  revalidatePortfolio(project.slug);

  return ok({ slug: project.slug }, "Project deleted.");
});
