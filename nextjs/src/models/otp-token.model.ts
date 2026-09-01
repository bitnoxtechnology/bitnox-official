import { Schema, type Types } from "mongoose";

import { OTP_PURPOSES, type OtpPurpose } from "@/lib/constants";
import { registerModel, type Timestamped } from "@/models/shared";

/**
 * One-time codes for login and password reset.
 *
 * The code itself is never stored. Only a hash of it, for the same reason passwords are
 * hashed: a leaked collection should not hand anyone a working second factor.
 */

export interface IOtpToken extends Timestamped {
  _id: Types.ObjectId;
  /** Lowercased email. */
  identifier: string;
  codeHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attempts: number;
  consumedAt?: Date;
}

const otpTokenSchema = new Schema<IOtpToken>(
  {
    identifier: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: OTP_PURPOSES, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    consumedAt: { type: Date },
  },
  { timestamps: true },
);

// Spent and expired codes remove themselves. Verification still checks `expiresAt`, since
// the TTL sweep runs about once a minute and a code must not survive its stated lifetime.
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpTokenSchema.index({ identifier: 1, purpose: 1, createdAt: -1 });

export const OtpToken = registerModel<IOtpToken>("OtpToken", otpTokenSchema);
