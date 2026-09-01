import type { Model, Types } from "mongoose";

/**
 * URL slugs.
 *
 * A slug is part of a page's identity once search engines have seen it. Changing one costs a
 * redirect and a fresh crawl, so generation happens once at creation and never again from an
 * edited title. An admin who genuinely wants a different URL edits the slug field directly,
 * and that edit is deliberate rather than a side effect of fixing a typo in a heading.
 */

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/g, "");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface SlugOwner {
  _id?: Types.ObjectId | unknown;
}

/**
 * Returns `base`, or `base-2`, `base-3` and so on when the base is taken.
 *
 * One query reads every sibling that could collide, so the suffix is chosen without a retry
 * loop. `excludeId` keeps a document from colliding with itself on update.
 */
export async function generateUniqueSlug(
  model: Model<never> | Model<unknown> | Model<Record<string, unknown>>,
  source: string,
  excludeId?: SlugOwner["_id"],
): Promise<string> {
  const base = slugify(source) || "item";
  const pattern = new RegExp(`^${escapeRegex(base)}(?:-(\\d+))?$`);

  const filter: Record<string, unknown> = { slug: pattern };
  if (excludeId) filter._id = { $ne: excludeId };

  const taken = await (model as Model<Record<string, unknown>>)
    .find(filter)
    .select("slug")
    .lean<{ slug: string }[]>()
    .exec();

  if (taken.length === 0) return base;

  const used = new Set(taken.map((doc) => doc.slug));
  if (!used.has(base)) return base;

  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

/** Rough reading time from rendered HTML, at 200 words a minute, minimum one. */
export function estimateReadingMinutes(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .trim();

  if (!text) return 1;

  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
