import { Schema, type Types } from "mongoose";

import { USER_ROLES, type UserRole } from "@/lib/constants";
import { registerModel, type Timestamped } from "@/models/shared";

/**
 * Admin users.
 *
 * The legacy `accountId` is gone. It generated a random six-digit number in a retry loop on
 * every insert and nothing ever read it.
 */

export interface IUser extends Timestamped {
  _id: Types.ObjectId;
  name: string;
  email: string;
  /** argon2id. Never selected unless a call site asks for it. */
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    // Required, because both the seed and the invite flow set one at creation. No account
    // ever exists in a passwordless state waiting to be claimed by whoever guesses the email.
    // `select: false` keeps the hash out of every query that does not explicitly ask, so a
    // careless serializer cannot leak it to the client.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "admin", required: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, isActive: 1 });

export const User = registerModel<IUser>("User", userSchema);
