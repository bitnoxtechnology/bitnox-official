import { Schema, type Types } from "mongoose";

import { AUTH_TOKEN_PURPOSES, type AuthTokenPurpose } from "@/lib/constants";
import { registerModel, type Timestamped } from "@/models/shared";

/**
 * One-time links: invitations and password resets.
 *
 * The token in the emailed URL is 256 bits of randomness. Only its keyed hash is stored, so
 * a dump of this collection hands nobody a working link. Lookup is by that hash, which is an
 * exact index hit rather than a scan, so there is no timing signal to read either.
 *
 * `email` is recorded alongside `userId` because a reset must fail, not silently move, if the
 * account's address is changed between the request and the click.
 */

export interface IAuthToken extends Timestamped {
  _id: Types.ObjectId;
  tokenHash: string;
  purpose: AuthTokenPurpose;
  userId: Types.ObjectId;
  /** Lowercased address the link was sent to. */
  email: string;
  expiresAt: Date;
  consumedAt?: Date;
  /** The super_admin who sent an invitation. Absent on a password reset. */
  invitedBy?: Types.ObjectId;
}

const authTokenSchema = new Schema<IAuthToken>(
  {
    tokenHash: { type: String, required: true, unique: true },
    purpose: { type: String, enum: AUTH_TOKEN_PURPOSES, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Spent and expired links remove themselves. Consumption is still checked on use, since the
// TTL sweep runs about once a minute and a used link must stop working immediately.
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
authTokenSchema.index({ userId: 1, purpose: 1, createdAt: -1 });

export const AuthToken = registerModel<IAuthToken>("AuthToken", authTokenSchema);
