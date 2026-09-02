import { Schema, type Types } from "mongoose";

import { registerModel, type Timestamped } from "@/models/shared";

/**
 * Sliding-window counters for login, OTP request and OTP verify.
 *
 * The window lives in MongoDB rather than in process memory. Serverless runs many isolated
 * instances, so an in-memory counter would let an attacker reset the limit by being routed
 * to a cold one. Redis was dropped from the stack, and the request volume this guards is
 * small enough that the database is the right place for it.
 *
 * `hits` holds the timestamps inside the current window. A single aggregation-pipeline update
 * drops the expired ones and appends the new one, so counting and recording are one atomic
 * round trip and two simultaneous requests cannot both read the same count.
 */

export interface IRateLimit extends Timestamped {
  _id: Types.ObjectId;
  /** `<action>:<scope>:<value>`, for example `login:email:someone@example.com`. */
  key: string;
  hits: Date[];
  expiresAt: Date;
}

const rateLimitSchema = new Schema<IRateLimit>(
  {
    key: { type: String, required: true, unique: true },
    hits: { type: [Date], default: [] },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// Idle counters remove themselves once their window has passed.
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit = registerModel<IRateLimit>("RateLimit", rateLimitSchema);
