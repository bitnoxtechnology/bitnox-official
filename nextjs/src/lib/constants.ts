/**
 * Values that more than one layer needs and that must not drift between them.
 *
 * The service slugs live here rather than in `src/content/services.ts` because the models
 * validate against them before that content module exists, and two copies of the list would
 * eventually disagree.
 */

export const SERVICE_SLUGS = [
  "software-development",
  "web-development",
  "it-consulting",
  "technology-training",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/**
 * Draft, scheduled, published and archived are four distinct states. A boolean collapses
 * them, which is why the legacy `isPublished` field is gone.
 */
export const PUBLISH_STATUSES = ["draft", "scheduled", "published", "archived"] as const;

export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const USER_ROLES = ["super_admin", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ENQUIRY_TYPES = ["contact", "event_space", "cleaning"] as const;

export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const ENQUIRY_STATUSES = ["new", "read", "responded"] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const SUBSCRIBER_STATUSES = ["subscribed", "unsubscribed"] as const;

export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number];

export const OTP_PURPOSES = ["login", "password_reset"] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[number];

/** The Event Space seats 60. Overridable in SiteSettings, but this is the fallback. */
export const EVENT_SPACE_CAPACITY = 60;
