/**
 * Importing this module registers every model on the connection.
 *
 * Scripts and any code that populates references need the referenced model registered before
 * the query runs, and importing one model does not pull in the others.
 */

export { AuthToken, type IAuthToken } from "@/models/auth-token.model";
export { Blog, type IBlog } from "@/models/blog.model";
export { Enquiry, type IEnquiry, type IEnquiryDetails } from "@/models/enquiry.model";
export { EventSpaceImage, type IEventSpaceImage } from "@/models/event-space-image.model";
export {
  NewsletterSubscriber,
  type INewsletterSubscriber,
} from "@/models/newsletter-subscriber.model";
export { OtpToken, type IOtpToken } from "@/models/otp-token.model";
export { Project, type IProject } from "@/models/project.model";
export { RateLimit, type IRateLimit } from "@/models/rate-limit.model";
export { Session, type ISession } from "@/models/session.model";
export { SiteSettings, type IOpeningHours, type ISiteSettings } from "@/models/site-settings.model";
export { Testimonial, type ITestimonial } from "@/models/testimonial.model";
export { User, type IUser } from "@/models/user.model";
export type { SiteImage, TiptapDoc, Timestamped } from "@/models/shared";
