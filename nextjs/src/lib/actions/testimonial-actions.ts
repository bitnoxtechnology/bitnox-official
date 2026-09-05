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
import { CACHE_TAGS } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db";
import { idSchema, reorderSchema } from "@/lib/validations/admin-schema";
import { testimonialSchema, type TestimonialData } from "@/lib/validations/testimonial-schema";
import { Testimonial } from "@/models";

/**
 * Testimonial administration.
 *
 * Short, because a testimonial is a short thing: a quote, who said it, and where it sits in
 * the order. There is no editor here and no HTML snapshot to render, since the quote is plain
 * text and rendering it through Tiptap would let a testimonial carry a heading.
 *
 * One tag, `testimonials`, and no per-item tag. Nothing on the site links to a testimonial's
 * own page, because it does not have one: they appear in bands on the landing page and the
 * service pages, so any change to one changes every page that shows it.
 */

function documentFrom(data: TestimonialData) {
  return {
    clientName: data.clientName,
    position: data.position,
    company: data.company,
    testimonialText: data.testimonialText,
    rating: data.rating,
    image: data.image,
    relatedProject: data.relatedProject,
    service: data.service,
    status: data.status,
    featured: data.featured,
    sortOrder: data.sortOrder,
  };
}

function parseTestimonialForm(formData: FormData): ActionResult<TestimonialData> {
  return validate(testimonialSchema, {
    clientName: text(formData, "clientName"),
    position: text(formData, "position"),
    company: text(formData, "company"),
    testimonialText: text(formData, "testimonialText"),
    rating: text(formData, "rating"),
    image: text(formData, "image"),
    relatedProject: text(formData, "relatedProject"),
    service: text(formData, "service"),
    status: text(formData, "status"),
    featured: text(formData, "featured"),
    sortOrder: text(formData, "sortOrder") || "0",
  });
}

export const createTestimonialAction = withAuth<[FormData], { id: string }>(
  async (_user, formData) => {
    const parsed = parseTestimonialForm(formData);
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const testimonial = await Testimonial.create(documentFrom(parsed.data));

    revalidateTag(CACHE_TAGS.testimonials, "max");

    return ok({ id: String(testimonial._id) });
  },
);

export async function createTestimonialFormAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await createTestimonialAction(formData);

  if (!result.ok) return toActionState(result);

  redirect("/admin/testimonials?created=1");
}

export const updateTestimonialAction = withAuth<[string, FormData], { id: string }>(
  async (_user, id, formData) => {
    const identified = validate(idSchema, { id });
    if (!identified.ok) return identified;

    const parsed = parseTestimonialForm(formData);
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const testimonial = await Testimonial.findByIdAndUpdate(
      identified.data.id,
      // `$unset` as well as `$set`, because a cleared rating, avatar or related project has to
      // actually leave the document. A `$set` of `undefined` is a no-op in Mongo, so without
      // this a five-star rating removed on the form would still be five stars on the page.
      {
        $set: documentFrom(parsed.data),
        $unset: {
          ...(parsed.data.rating === undefined ? { rating: "" } : {}),
          ...(parsed.data.image === undefined ? { image: "" } : {}),
          ...(parsed.data.relatedProject === undefined ? { relatedProject: "" } : {}),
          ...(parsed.data.service === undefined ? { service: "" } : {}),
        },
      },
      { new: true, runValidators: true },
    )
      .lean()
      .exec();

    if (!testimonial) return fail("That testimonial no longer exists.");

    revalidateTag(CACHE_TAGS.testimonials, "max");

    return ok({ id }, "Saved.");
  },
);

export async function updateTestimonialFormAction(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return toActionState(await updateTestimonialAction(id, formData), "Saved.");
}

export const deleteTestimonialAction = withAuth<[string], { id: string }>(async (_user, id) => {
  const parsed = validate(idSchema, { id });
  if (!parsed.ok) return parsed;

  await connectToDatabase();

  const removed = await Testimonial.findByIdAndDelete(parsed.data.id).lean().exec();
  if (!removed) return fail("That testimonial no longer exists.");

  revalidateTag(CACHE_TAGS.testimonials, "max");

  return ok({ id }, "Testimonial deleted.");
});

/**
 * A featured testimonial leads the band, so the flag is worth a one-click toggle.
 *
 * Read then written rather than toggled in the query, because Mongo has no atomic "flip this
 * boolean" and doing it in two steps here is honest about that. Two admins pressing it at the
 * same moment is not a case worth a transaction for a display order.
 */
export const toggleTestimonialFeaturedAction = withAuth<[string], { featured: boolean }>(
  async (_user, id) => {
    const parsed = validate(idSchema, { id });
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const testimonial = await Testimonial.findById(parsed.data.id).exec();
    if (!testimonial) return fail("That testimonial no longer exists.");

    testimonial.featured = !testimonial.featured;
    await testimonial.save();

    revalidateTag(CACHE_TAGS.testimonials, "max");

    return ok({ featured: testimonial.featured });
  },
);

/**
 * The order, applied from the list the admin dragged into shape.
 *
 * One `bulkWrite` rather than a save per row: a dozen sequential round trips to renumber a
 * dozen testimonials is a visible pause on a list that is meant to feel like dragging.
 */
export const reorderTestimonialsAction = withAuth<[string[]], { count: number }>(
  async (_user, ids) => {
    const parsed = validate(reorderSchema, { ids });
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    await Testimonial.bulkWrite(
      parsed.data.ids.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index } } },
      })),
    );

    revalidateTag(CACHE_TAGS.testimonials, "max");

    return ok({ count: parsed.data.ids.length });
  },
);
