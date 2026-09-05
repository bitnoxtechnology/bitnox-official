import { Schema, type Types } from "mongoose";

import { BUSINESS } from "@/content/business";
import { EVENT_SPACE_CAPACITY } from "@/lib/constants";
import { imageSchema, registerModel, type SiteImage, type Timestamped } from "@/models/shared";

/**
 * One document, holding the values an admin should be able to correct without a deploy.
 *
 * The singleton is enforced by a unique `key` fixed to a single allowed value, so a second
 * insert fails at the database rather than leaving two settings documents and a coin toss
 * over which one the site reads.
 */

export interface IOpeningHours {
  /** ISO weekday, 1 for Monday through 7 for Sunday. */
  dayOfWeek: number;
  /** 24-hour `HH:mm`. */
  opens: string;
  closes: string;
  closed: boolean;
}

export interface ISiteSettings extends Timestamped {
  _id: Types.ObjectId;
  key: "site";
  nap: {
    legalName: string;
    streetAddress: string;
    locality: string;
    region: string;
    country: string;
    countryCode: string;
    phone: string;
    email: string;
    latitude: number;
    longitude: number;
  };
  /** Empty until the real hours are supplied. The schema omits what is not known. */
  openingHours: IOpeningHours[];
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    x?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  sisterSites: {
    education: string;
    cleaning: string;
  };
  defaultOgImage?: SiteImage;
  /**
   * The Tag Manager container, held here as well as in the environment so an analytics
   * change does not need a deploy. The environment value is the fallback, which is what
   * keeps a preview deployment reporting into the container its own env names.
   */
  gtmId?: string;
  eventSpace: {
    capacity: number;
    amenities: string[];
    availabilityCopy: string;
  };
}

const openingHoursSchema = new Schema<IOpeningHours>(
  {
    dayOfWeek: { type: Number, required: true, min: 1, max: 7 },
    opens: { type: String, default: "09:00" },
    closes: { type: String, default: "17:00" },
    closed: { type: Boolean, default: false },
  },
  { _id: false },
);

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    key: { type: String, default: "site", enum: ["site"], unique: true, required: true },
    nap: {
      legalName: { type: String, default: BUSINESS.legalName },
      streetAddress: { type: String, default: BUSINESS.streetAddress },
      locality: { type: String, default: BUSINESS.locality },
      region: { type: String, default: BUSINESS.region },
      country: { type: String, default: BUSINESS.country },
      countryCode: { type: String, default: BUSINESS.countryCode },
      phone: { type: String, default: BUSINESS.phone },
      email: { type: String, default: BUSINESS.email },
      latitude: { type: Number, default: BUSINESS.latitude },
      longitude: { type: Number, default: BUSINESS.longitude },
    },
    openingHours: { type: [openingHoursSchema], default: [] },
    socialLinks: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      x: { type: String, trim: true },
      youtube: { type: String, trim: true },
      tiktok: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
    },
    sisterSites: {
      education: { type: String, default: "https://edu.bitnoxsolution.com" },
      cleaning: { type: String, default: "https://cleaning.bitnoxsolution.com" },
    },
    defaultOgImage: { type: imageSchema },
    // Validated against `GTM-XXXXXXX` before it is written. It is interpolated into a script
    // URL on every page, so a free-text field here would be a script injection site wide.
    gtmId: { type: String, trim: true, maxlength: 20 },
    eventSpace: {
      capacity: { type: Number, default: EVENT_SPACE_CAPACITY, min: 1 },
      amenities: { type: [String], default: [] },
      // No rates, ranges or "from" figures. The enquiry form is the pricing mechanism.
      availabilityCopy: { type: String, default: "", maxlength: 1000 },
    },
  },
  { timestamps: true },
);

export const SiteSettings = registerModel<ISiteSettings>("SiteSettings", siteSettingsSchema);
