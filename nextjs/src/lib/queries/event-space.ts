import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache";
import { connectToDatabase } from "@/lib/db";
import { toEventSpaceImage, type EventSpaceImageDTO } from "@/lib/dto";
import { EventSpaceImage, type IEventSpaceImage } from "@/models";

/**
 * The Event Space gallery, cover image first.
 *
 * `limit` is what the landing page teaser uses to take the first few without pulling the
 * whole collection into a section that shows four of them.
 *
 * The photographs are an outstanding input, so this returns an empty array on a fresh
 * database. Every caller treats that as "draw the section without a gallery" rather than as
 * an error, because the copy around the images is worth publishing before the images are.
 */
export async function getEventSpaceImages(limit?: number): Promise<EventSpaceImageDTO[]> {
  "use cache";
  cacheTag(CACHE_TAGS.eventSpace);
  cacheLife("max");

  await connectToDatabase();

  const query = EventSpaceImage.find().sort({ isCover: -1, sortOrder: 1, createdAt: 1 });

  if (limit) query.limit(limit);

  const images = await query.lean<IEventSpaceImage[]>().exec();

  return images.map(toEventSpaceImage);
}
