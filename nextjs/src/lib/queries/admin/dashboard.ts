import "server-only";

import { connectForRequest } from "@/lib/queries/admin/shared";

import { countEnquiries, type EnquiryCounts } from "@/lib/queries/admin/enquiries";
import { countSubscribers } from "@/lib/queries/admin/newsletter";
import { toBlogCard, toEnquiry, type BlogCardDTO, type EnquiryDTO } from "@/lib/dto";
import {
  Blog,
  Enquiry,
  EventSpaceImage,
  Project,
  Testimonial,
  type IBlog,
  type IEnquiry,
} from "@/models";
// Registers User on the connection, so populating the byline does not throw.
import "@/models";

/**
 * What the dashboard shows.
 *
 * Counts, the last few posts, the last few enquiries. Deliberately not a chart: there is no
 * traffic data in this database, and a graph of how many blog posts exist over time is a
 * decoration rather than a fact anybody acts on.
 *
 * Every count is `countDocuments` on an indexed filter and they are issued together rather
 * than one after another, so the whole screen is one round trip's worth of latency instead of
 * eight.
 */

export interface ContentCounts {
  blogPublished: number;
  blogDrafts: number;
  blogScheduled: number;
  projectsPublished: number;
  projectsDrafts: number;
  testimonials: number;
  galleryImages: number;
  subscribers: number;
}

export interface DashboardData {
  counts: ContentCounts;
  enquiries: EnquiryCounts;
  recentPosts: BlogCardDTO[];
  recentEnquiries: EnquiryDTO[];
}

export async function getDashboardData(): Promise<DashboardData> {
  await connectForRequest();

  const [
    blogPublished,
    blogDrafts,
    blogScheduled,
    projectsPublished,
    projectsDrafts,
    testimonials,
    galleryImages,
    subscribers,
    enquiries,
    recentPosts,
    recentEnquiries,
  ] = await Promise.all([
    Blog.countDocuments({ status: "published" }).exec(),
    Blog.countDocuments({ status: "draft" }).exec(),
    Blog.countDocuments({ status: "scheduled" }).exec(),
    Project.countDocuments({ status: "published" }).exec(),
    Project.countDocuments({ status: "draft" }).exec(),
    Testimonial.countDocuments({ status: "published" }).exec(),
    EventSpaceImage.estimatedDocumentCount().exec(),
    countSubscribers(),
    countEnquiries(),
    Blog.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("author", "name")
      .select("-contentJson -contentHtml")
      .lean<IBlog[]>()
      .exec(),
    Enquiry.find().sort({ createdAt: -1 }).limit(5).lean<IEnquiry[]>().exec(),
  ]);

  return {
    counts: {
      blogPublished,
      blogDrafts,
      blogScheduled,
      projectsPublished,
      projectsDrafts,
      testimonials,
      galleryImages,
      subscribers: subscribers.subscribed,
    },
    enquiries,
    recentPosts: recentPosts.map(toBlogCard),
    recentEnquiries: recentEnquiries.map(toEnquiry),
  };
}
