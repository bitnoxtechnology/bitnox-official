import "server-only";

import {
  ADMIN_PER_PAGE,
  connectForRequest,
  paginate,
  searchPattern,
  type Paginated,
} from "@/lib/queries/admin/shared";
import type { EnquiryStatus, EnquiryType } from "@/lib/constants";
import { toEnquiry, type EnquiryDTO } from "@/lib/dto";
import type { EnquiryListQuery } from "@/lib/validations/admin-schema";
import { Enquiry, type IEnquiry } from "@/models";

/**
 * The inbox.
 *
 * One list across contact, Event Space and cleaning rather than three, because they arrive
 * in one collection with a `type` discriminator and because the person answering them works
 * through the day's messages, not through a folder. The filter narrows it when that is what
 * is wanted.
 *
 * Newest first, always. An enquiry is a message: the order is the arrival order and there is
 * nothing to sort it by that a reader of an inbox would recognise.
 */
export async function listEnquiries(query: EnquiryListQuery): Promise<Paginated<EnquiryDTO>> {
  await connectForRequest();

  const filter: Record<string, unknown> = {};

  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;

  if (query.q) {
    const pattern = searchPattern(query.q);
    filter.$or = [
      { name: pattern },
      { email: pattern },
      { subject: pattern },
      { message: pattern },
      { phone: pattern },
    ];
  }

  const total = await Enquiry.countDocuments(filter).exec();
  const { page, pageCount, skip, limit } = paginate(total, query.page);

  const enquiries = await Enquiry.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean<IEnquiry[]>()
    .exec();

  return { rows: enquiries.map(toEnquiry), total, page, pageCount, perPage: ADMIN_PER_PAGE };
}

export async function getEnquiry(id: string): Promise<EnquiryDTO | null> {
  await connectForRequest();

  const enquiry = await Enquiry.findById(id).lean<IEnquiry | null>().exec();

  return enquiry ? toEnquiry(enquiry) : null;
}

/**
 * How many are unanswered, by type, for the sidebar badge and the dashboard.
 *
 * One aggregation rather than a count per filter combination. The badge is on every admin
 * page, so this runs constantly and a query per type would be six round trips for a number.
 */
export interface EnquiryCounts {
  total: number;
  new: number;
  byType: Record<EnquiryType, number>;
  byStatus: Record<EnquiryStatus, number>;
}

export async function countEnquiries(): Promise<EnquiryCounts> {
  await connectForRequest();

  const rows = await Enquiry.aggregate<{
    _id: { type: EnquiryType; status: EnquiryStatus };
    count: number;
  }>([{ $group: { _id: { type: "$type", status: "$status" }, count: { $sum: 1 } } }]).exec();

  const counts: EnquiryCounts = {
    total: 0,
    new: 0,
    byType: { contact: 0, event_space: 0, cleaning: 0 },
    byStatus: { new: 0, read: 0, responded: 0 },
  };

  for (const row of rows) {
    counts.total += row.count;
    counts.byType[row._id.type] = (counts.byType[row._id.type] ?? 0) + row.count;
    counts.byStatus[row._id.status] = (counts.byStatus[row._id.status] ?? 0) + row.count;
  }

  counts.new = counts.byStatus.new;

  return counts;
}
