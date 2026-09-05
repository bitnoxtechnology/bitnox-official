import "server-only";

import {
  ADMIN_PER_PAGE,
  connectForRequest,
  paginate,
  searchPattern,
  type Paginated,
} from "@/lib/queries/admin/shared";
import { toSubscriber, type SubscriberDTO } from "@/lib/dto";
import type { SubscriberListQuery } from "@/lib/validations/admin-schema";
import { NewsletterSubscriber, type INewsletterSubscriber } from "@/models";

export async function listSubscribers(
  query: SubscriberListQuery,
): Promise<Paginated<SubscriberDTO>> {
  await connectForRequest();

  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;
  if (query.q) filter.email = searchPattern(query.q);

  const total = await NewsletterSubscriber.countDocuments(filter).exec();
  const { page, pageCount, skip, limit } = paginate(total, query.page);

  const subscribers = await NewsletterSubscriber.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean<INewsletterSubscriber[]>()
    .exec();

  return { rows: subscribers.map(toSubscriber), total, page, pageCount, perPage: ADMIN_PER_PAGE };
}

/**
 * The whole list, for the CSV export.
 *
 * Unpaginated on purpose, and streamed straight into a file by the route that calls it. The
 * unsubscribe token is not selected: it is a credential that removes somebody from the list
 * without a sign-in, and a spreadsheet emailed between two people is the wrong place for it.
 */
export async function exportSubscribers(
  status?: "subscribed" | "unsubscribed",
): Promise<SubscriberDTO[]> {
  await connectForRequest();

  const subscribers = await NewsletterSubscriber.find(status ? { status } : {})
    .sort({ createdAt: -1 })
    .select("-unsubscribeToken")
    .lean<INewsletterSubscriber[]>()
    .exec();

  return subscribers.map(toSubscriber);
}

export async function countSubscribers(): Promise<{ subscribed: number; total: number }> {
  await connectForRequest();

  const [subscribed, total] = await Promise.all([
    NewsletterSubscriber.countDocuments({ status: "subscribed" }).exec(),
    NewsletterSubscriber.estimatedDocumentCount().exec(),
  ]);

  return { subscribed, total };
}
