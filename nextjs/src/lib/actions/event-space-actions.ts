"use server";

import { revalidateTag } from "next/cache";

import { ok, text, toActionState, validate, type ActionState } from "@/lib/actions/action-state";
import { withAuth } from "@/lib/actions/with-auth";
import { CACHE_TAGS } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db";
import {
  eventSpaceDetailsSchema,
  eventSpaceGallerySchema,
} from "@/lib/validations/event-space-schema";
import { EventSpaceImage, SiteSettings } from "@/models";

/**
 * The Event Space admin.
 *
 * Two actions, because the gallery and the room's details change on different days. New
 * photographs arrive when the room is redecorated; the capacity is corrected once.
 *
 * Neither writes a price. Rates on this site are on request and the enquiry form is the
 * pricing mechanism, so there is nowhere here to type one and accidentally publish it. The
 * availability copy says how a date is confirmed and how quickly a reply comes, which is the
 * question a visitor is actually asking when they look for a number.
 */

/**
 * The gallery, replaced wholesale rather than diffed.
 *
 * The form posts the complete list in its final order, so the write is "make the collection
 * look like this". A diff would have to match rows by URL, and re-uploading the same
 * photograph produces a different Cloudinary URL, so the match would fail exactly when
 * somebody replaces a picture.
 *
 * The collection is small, tens of rows at most, and the alternative to deleting and
 * inserting is carrying an id per row through a drag-and-drop list for no gain.
 *
 * `isCover` is derived from the chosen index rather than submitted per row, so "exactly one
 * cover" is true by construction. Two rows both claiming it is not a state this can reach.
 */
export const saveEventSpaceGalleryAction = withAuth<[FormData], { count: number }>(
  async (_user, formData) => {
    const parsed = validate(eventSpaceGallerySchema, {
      images: text(formData, "images"),
      coverIndex: text(formData, "coverIndex") || "-1",
    });

    if (!parsed.ok) return parsed;

    const images = parsed.data.images ?? [];
    // Falls back to the first image when nothing was chosen, so a gallery is never coverless
    // and the landing page teaser always has something to show.
    const cover =
      parsed.data.coverIndex >= 0 && parsed.data.coverIndex < images.length
        ? parsed.data.coverIndex
        : 0;

    await connectToDatabase();

    await EventSpaceImage.deleteMany({}).exec();

    if (images.length > 0) {
      await EventSpaceImage.insertMany(
        images.map((image, index) => ({
          url: image.url,
          alt: image.alt,
          caption: image.caption,
          sortOrder: index,
          isCover: index === cover,
        })),
      );
    }

    revalidateTag(CACHE_TAGS.eventSpace, "max");

    return ok({ count: images.length }, "Gallery saved.");
  },
);

export async function saveEventSpaceGalleryFormAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return toActionState(await saveEventSpaceGalleryAction(formData), "Gallery saved.");
}

/**
 * Capacity, amenities and the availability copy, on the settings singleton.
 *
 * They live in `SiteSettings` rather than in a document of their own because there is one
 * room, and a collection with exactly one row in it is a table you have to remember to seed.
 * `upsert` covers the database that has not been seeded yet.
 */
export const saveEventSpaceDetailsAction = withAuth<[FormData], { capacity: number }>(
  async (_user, formData) => {
    const parsed = validate(eventSpaceDetailsSchema, {
      capacity: text(formData, "capacity"),
      amenities: text(formData, "amenities"),
      availabilityCopy: text(formData, "availabilityCopy"),
    });

    if (!parsed.ok) return parsed;

    await connectToDatabase();

    await SiteSettings.updateOne(
      { key: "site" },
      {
        $set: {
          "eventSpace.capacity": parsed.data.capacity,
          "eventSpace.amenities": parsed.data.amenities,
          "eventSpace.availabilityCopy": parsed.data.availabilityCopy,
        },
      },
      { upsert: true },
    ).exec();

    // Both tags. The capacity and the amenities are read through the settings singleton, and
    // the Event Space page renders them beside the gallery.
    revalidateTag(CACHE_TAGS.siteSettings, "max");
    revalidateTag(CACHE_TAGS.eventSpace, "max");

    return ok({ capacity: parsed.data.capacity }, "Saved.");
  },
);

export async function saveEventSpaceDetailsFormAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return toActionState(await saveEventSpaceDetailsAction(formData), "Saved.");
}
