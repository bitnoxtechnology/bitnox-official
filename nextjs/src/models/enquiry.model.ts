import { Schema, type Types } from "mongoose";

import {
  ENQUIRY_STATUSES,
  ENQUIRY_TYPES,
  type EnquiryStatus,
  type EnquiryType,
} from "@/lib/constants";
import { registerModel, type Timestamped } from "@/models/shared";

/**
 * The admin inbox: contact messages and Event Space booking enquiries in one collection.
 *
 * One collection rather than three, because the fields that differ are few and the admin
 * wants a single chronological inbox. The Event Space extras live in `details`, typed rather
 * than dumped into the message body where nothing can filter or sort on them.
 */

export interface IEnquiryDetails {
  eventType?: string;
  preferredDate?: Date;
  expectedAttendees?: number;
}

export interface IEnquiry extends Timestamped {
  _id: Types.ObjectId;
  type: EnquiryType;
  status: EnquiryStatus;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  details?: IEnquiryDetails;
  /** The page the enquiry came from. */
  source?: string;
}

const enquiryDetailsSchema = new Schema<IEnquiryDetails>(
  {
    eventType: { type: String, trim: true, maxlength: 120 },
    preferredDate: { type: Date },
    expectedAttendees: { type: Number, min: 1, max: 500 },
  },
  { _id: false },
);

const enquirySchema = new Schema<IEnquiry>(
  {
    type: { type: String, enum: ENQUIRY_TYPES, required: true },
    status: { type: String, enum: ENQUIRY_STATUSES, default: "new", required: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 40 },
    subject: { type: String, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    details: { type: enquiryDetailsSchema },
    source: { type: String, trim: true, maxlength: 120 },
  },
  { timestamps: true },
);

// The inbox is filtered by type and status, sorted newest first.
enquirySchema.index({ type: 1, status: 1, createdAt: -1 });
enquirySchema.index({ status: 1, createdAt: -1 });

export const Enquiry = registerModel<IEnquiry>("Enquiry", enquirySchema);
