import type {
  EnquiryStatus,
  EnquiryType,
  PublishStatus,
  ServiceSlug,
  SubscriberStatus,
  UserRole,
} from "@/lib/constants";
import type {
  IBlog,
  IEnquiry,
  IEventSpaceImage,
  INewsletterSubscriber,
  IOpeningHours,
  IProject,
  ISession,
  ISiteSettings,
  ITestimonial,
  IUser,
  SiteImage,
  TiptapDoc,
} from "@/models";

/**
 * Mongoose documents to plain objects.
 *
 * A hydrated document carries getters, virtuals, a change tracker and ObjectId instances,
 * none of which survive the server to client boundary. Rather than discovering that as a
 * serialization error at render time, every query result passes through here first.
 *
 * These functions are also the last gate on what reaches the browser. `toUser` cannot leak a
 * password hash, because it names the fields it copies where a spread would not.
 */

function id(value: unknown): string {
  return String(value);
}

function iso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function requiredIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** A reference is either an id, or the document itself once it has been populated. */
function isPopulated(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length > 1
  );
}

function refId(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (isPopulated(value)) return id((value as { _id: unknown })._id);
  return id(value);
}

// --- Images -----------------------------------------------------------------

export interface ImageDTO {
  url: string;
  alt: string;
  caption?: string;
  sortOrder: number;
}

export function toImage(image: SiteImage | null | undefined): ImageDTO | undefined {
  if (!image?.url) return undefined;
  return {
    url: image.url,
    alt: image.alt,
    caption: image.caption,
    sortOrder: image.sortOrder ?? 0,
  };
}

export function toImages(images: SiteImage[] | null | undefined): ImageDTO[] {
  if (!images?.length) return [];
  return images
    .map((image) => toImage(image))
    .filter((image): image is ImageDTO => image !== undefined)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// --- User -------------------------------------------------------------------

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function toUser(user: IUser): UserDTO {
  return {
    id: id(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: iso(user.lastLoginAt),
    createdAt: requiredIso(user.createdAt),
    updatedAt: requiredIso(user.updatedAt),
  };
}

/** The byline. A reader needs a name, not an account. */
export interface AuthorDTO {
  id: string;
  name: string;
}

function toAuthor(value: unknown): AuthorDTO | undefined {
  if (!isPopulated(value)) return undefined;
  const populated = value as { _id: unknown; name?: string };
  if (typeof populated.name !== "string") return undefined;
  return { id: id(populated._id), name: populated.name };
}

// --- Blog -------------------------------------------------------------------

export interface BlogCardDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: ImageDTO;
  status: PublishStatus;
  publishedAt?: string;
  scheduledFor?: string;
  tags: string[];
  category?: string;
  author?: AuthorDTO;
  authorId: string;
  readingMinutes: number;
  featured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogDTO extends BlogCardDTO {
  contentHtml: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: ImageDTO;
  canonicalUrl?: string;
}

/** Editor payload. Only the admin edit screen needs the Tiptap document. */
export interface BlogEditorDTO extends BlogDTO {
  contentJson: TiptapDoc;
}

export function toBlogCard(blog: IBlog): BlogCardDTO {
  return {
    id: id(blog._id),
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    coverImage: toImage(blog.coverImage),
    status: blog.status,
    publishedAt: iso(blog.publishedAt),
    scheduledFor: iso(blog.scheduledFor),
    tags: blog.tags ?? [],
    category: blog.category,
    author: toAuthor(blog.author),
    authorId: refId(blog.author) ?? "",
    readingMinutes: blog.readingMinutes,
    featured: blog.featured,
    viewCount: blog.viewCount,
    createdAt: requiredIso(blog.createdAt),
    updatedAt: requiredIso(blog.updatedAt),
  };
}

export function toBlog(blog: IBlog): BlogDTO {
  return {
    ...toBlogCard(blog),
    // The rendered snapshot, never the editor JSON. The public page must not ship Tiptap.
    contentHtml: blog.contentHtml,
    seoTitle: blog.seoTitle,
    seoDescription: blog.seoDescription,
    ogImage: toImage(blog.ogImage),
    canonicalUrl: blog.canonicalUrl,
  };
}

export function toBlogEditor(blog: IBlog): BlogEditorDTO {
  return { ...toBlog(blog), contentJson: blog.contentJson ?? {} };
}

// --- Project ----------------------------------------------------------------

export interface ProjectCardDTO {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage?: ImageDTO;
  client?: string;
  industry?: string;
  services: ServiceSlug[];
  techStack: string[];
  completedAt?: string;
  tags: string[];
  status: PublishStatus;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDTO extends ProjectCardDTO {
  contentHtml: string;
  images: ImageDTO[];
  liveUrl?: string;
  repoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: ImageDTO;
}

export interface ProjectEditorDTO extends ProjectDTO {
  contentJson: TiptapDoc;
}

export function toProjectCard(project: IProject): ProjectCardDTO {
  return {
    id: id(project._id),
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    coverImage: toImage(project.coverImage),
    client: project.client,
    industry: project.industry,
    services: project.services ?? [],
    techStack: project.techStack ?? [],
    completedAt: iso(project.completedAt),
    tags: project.tags ?? [],
    status: project.status,
    featured: project.featured,
    order: project.order,
    createdAt: requiredIso(project.createdAt),
    updatedAt: requiredIso(project.updatedAt),
  };
}

export function toProject(project: IProject): ProjectDTO {
  return {
    ...toProjectCard(project),
    contentHtml: project.contentHtml ?? "",
    images: toImages(project.images),
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl,
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
    ogImage: toImage(project.ogImage),
  };
}

export function toProjectEditor(project: IProject): ProjectEditorDTO {
  return { ...toProject(project), contentJson: project.contentJson ?? {} };
}

// --- Testimonial ------------------------------------------------------------

export interface TestimonialDTO {
  id: string;
  clientName: string;
  position?: string;
  company?: string;
  testimonialText: string;
  rating?: number;
  image?: ImageDTO;
  relatedProjectId?: string;
  relatedProjectSlug?: string;
  service?: ServiceSlug;
  status: PublishStatus;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export function toTestimonial(testimonial: ITestimonial): TestimonialDTO {
  const related: unknown = testimonial.relatedProject;

  return {
    id: id(testimonial._id),
    clientName: testimonial.clientName,
    position: testimonial.position,
    company: testimonial.company,
    testimonialText: testimonial.testimonialText,
    rating: testimonial.rating,
    image: toImage(testimonial.image),
    relatedProjectId: refId(related),
    relatedProjectSlug: isPopulated(related)
      ? ((related as { slug?: string }).slug ?? undefined)
      : undefined,
    service: testimonial.service,
    status: testimonial.status,
    featured: testimonial.featured,
    sortOrder: testimonial.sortOrder,
    createdAt: requiredIso(testimonial.createdAt),
    updatedAt: requiredIso(testimonial.updatedAt),
  };
}

// --- Enquiry ----------------------------------------------------------------

export interface EnquiryDTO {
  id: string;
  type: EnquiryType;
  status: EnquiryStatus;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  details?: {
    eventType?: string;
    preferredDate?: string;
    expectedAttendees?: number;
  };
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export function toEnquiry(enquiry: IEnquiry): EnquiryDTO {
  return {
    id: id(enquiry._id),
    type: enquiry.type,
    status: enquiry.status,
    name: enquiry.name,
    email: enquiry.email,
    phone: enquiry.phone,
    subject: enquiry.subject,
    message: enquiry.message,
    details: enquiry.details
      ? {
          eventType: enquiry.details.eventType,
          preferredDate: iso(enquiry.details.preferredDate),
          expectedAttendees: enquiry.details.expectedAttendees,
        }
      : undefined,
    source: enquiry.source,
    createdAt: requiredIso(enquiry.createdAt),
    updatedAt: requiredIso(enquiry.updatedAt),
  };
}

// --- Newsletter -------------------------------------------------------------

export interface SubscriberDTO {
  id: string;
  email: string;
  status: SubscriberStatus;
  source?: string;
  confirmedAt?: string;
  unsubscribedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** The unsubscribe token is deliberately absent. It is a credential, not display data. */
export function toSubscriber(subscriber: INewsletterSubscriber): SubscriberDTO {
  return {
    id: id(subscriber._id),
    email: subscriber.email,
    status: subscriber.status,
    source: subscriber.source,
    confirmedAt: iso(subscriber.confirmedAt),
    unsubscribedAt: iso(subscriber.unsubscribedAt),
    createdAt: requiredIso(subscriber.createdAt),
    updatedAt: requiredIso(subscriber.updatedAt),
  };
}

// --- Event Space ------------------------------------------------------------

export interface EventSpaceImageDTO {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  sortOrder: number;
  isCover: boolean;
}

export function toEventSpaceImage(image: IEventSpaceImage): EventSpaceImageDTO {
  return {
    id: id(image._id),
    url: image.url,
    alt: image.alt,
    caption: image.caption,
    sortOrder: image.sortOrder,
    isCover: image.isCover,
  };
}

// --- Sessions ---------------------------------------------------------------

export interface SessionDTO {
  id: string;
  sessionId: string;
  userId: string;
  userAgent?: string;
  ip?: string;
  expiresAt: string;
  revokedAt?: string;
  createdAt: string;
}

export function toSession(session: ISession): SessionDTO {
  return {
    id: id(session._id),
    sessionId: session.sessionId,
    userId: refId(session.userId) ?? "",
    userAgent: session.userAgent,
    ip: session.ip,
    expiresAt: requiredIso(session.expiresAt),
    revokedAt: iso(session.revokedAt),
    createdAt: requiredIso(session.createdAt),
  };
}

// --- Site settings ----------------------------------------------------------

export interface SiteSettingsDTO {
  nap: ISiteSettings["nap"];
  openingHours: IOpeningHours[];
  socialLinks: ISiteSettings["socialLinks"];
  sisterSites: ISiteSettings["sisterSites"];
  defaultOgImage?: ImageDTO;
  gtmId?: string;
  eventSpace: {
    capacity: number;
    amenities: string[];
    availabilityCopy: string;
  };
}

export function toSiteSettings(settings: ISiteSettings): SiteSettingsDTO {
  return {
    nap: { ...settings.nap },
    openingHours: settings.openingHours.map((hours) => ({ ...hours })),
    socialLinks: { ...settings.socialLinks },
    sisterSites: { ...settings.sisterSites },
    defaultOgImage: toImage(settings.defaultOgImage),
    gtmId: settings.gtmId,
    eventSpace: {
      capacity: settings.eventSpace.capacity,
      amenities: [...settings.eventSpace.amenities],
      availabilityCopy: settings.eventSpace.availabilityCopy,
    },
  };
}
