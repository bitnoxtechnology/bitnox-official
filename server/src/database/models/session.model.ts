import mongoose, { Document, Schema } from "mongoose";
import { daysFromNow } from "../../lib/utils";

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: string;
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  deviceFp: string; // encoded fingerprint from client
  userAgent?: string;
  ip?: string;
  valid: boolean;
  createdAt: Date;
  expiredAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    refreshToken: { type: String, required: true },
    deviceFp: { type: String, required: true },
    userAgent: { type: String },
    ip: { type: String },
    valid: { type: Boolean, default: true },
    expiredAt: { type: Date, default: daysFromNow(10) },
  },
  { timestamps: true, toJSON: {} }
);

const SessionModel = mongoose.model<ISession>("Session", sessionSchema);
export default SessionModel;
