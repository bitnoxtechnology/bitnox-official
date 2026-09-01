import { Schema, type Types } from "mongoose";

import { registerModel, type Timestamped } from "@/models/shared";

/**
 * Server-side sessions.
 *
 * The cookie carries a signed session id and nothing else. That replaces the legacy access
 * and refresh token pair, and the browser fingerprint that was used to bind them, both of
 * which are gone.
 */

export interface ISession extends Timestamped {
  _id: Types.ObjectId;
  sessionId: string;
  userId: Types.ObjectId;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
  revokedAt?: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userAgent: { type: String, maxlength: 512 },
    ip: { type: String, maxlength: 64 },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
  },
  { timestamps: true },
);

// MongoDB removes the document once `expiresAt` passes, so dead sessions need no cleanup job.
// Expiry runs on a background sweep roughly every minute, so session reads still check
// `expiresAt` themselves rather than treating presence as proof of validity.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = registerModel<ISession>("Session", sessionSchema);
