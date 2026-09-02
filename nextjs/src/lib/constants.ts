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

/**
 * Six-digit emailed codes. Login is the only one.
 *
 * Password reset and invitations use a one-time link instead, because the person following
 * one has already proved they can read the mailbox and a link removes a step. Their purposes
 * are in AUTH_TOKEN_PURPOSES below.
 */
export const OTP_PURPOSES = ["login"] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[number];

/** One-time links: 256 bits of randomness in a URL, single use, short lived. */
export const AUTH_TOKEN_PURPOSES = ["invite", "password_reset"] as const;

export type AuthTokenPurpose = (typeof AUTH_TOKEN_PURPOSES)[number];

/**
 * Minimum password length.
 *
 * Here rather than beside the hashing code, because the sign-in forms need it to say so and a
 * client component that imports from `auth/password.ts` drags the argon2 native binding into
 * the browser bundle, where it does not exist.
 */
export const MIN_PASSWORD_LENGTH = 12;

/** The Event Space seats 60. Overridable in SiteSettings, but this is the fallback. */
export const EVENT_SPACE_CAPACITY = 60;

/**
 * Where an upload is allowed to land in the Cloudinary account.
 *
 * Here rather than beside the signing code, because the client-side upload component needs
 * the union type and `src/lib/cloudinary.ts` carries `server-only`: it holds the API secret,
 * so nothing in a browser bundle may import from it, not even a type.
 */
export const UPLOAD_FOLDERS = ["blog", "portfolio", "event-space", "testimonials", "site"] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

/** Ten megabytes. Above this the browser is asked to pick a smaller file rather than wait. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
