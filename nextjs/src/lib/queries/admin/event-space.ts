import "server-only";

import { connectForRequest } from "@/lib/queries/admin/shared";

import { toEventSpaceImage, type EventSpaceImageDTO } from "@/lib/dto";
import { EventSpaceImage, type IEventSpaceImage } from "@/models";

/**
 * The gallery in its stored order, for the management screen.
 *
 * The public query sorts the cover to the front, because that is what a visitor should see
 * first. This one sorts strictly by `sortOrder`, because an admin dragging rows around needs
 * the list to be in the order they are editing rather than in the order it will be shown. The
 * cover is marked on its row instead.
 */
export async function listEventSpaceImages(): Promise<EventSpaceImageDTO[]> {
  await connectForRequest();

  const images = await EventSpaceImage.find()
    .sort({ sortOrder: 1, createdAt: 1 })
    .lean<IEventSpaceImage[]>()
    .exec();

  return images.map(toEventSpaceImage);
}
