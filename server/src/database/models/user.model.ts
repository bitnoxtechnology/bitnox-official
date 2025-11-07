import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  accountId: string;
  name: string;
  email: string;
}

const userSchema = new Schema<IUser>(
  {
    accountId: { type: String, unique: true, required: true },
    name: { type: String, required: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true, toJSON: {} }
);

userSchema.pre("validate", async function (next) {
  if (this.isNew && !this.accountId) {
    let unique = false;
    let generatedId;

    while (!unique) {
      // Generate a random 6-digit number
      generatedId =
        new Date().getFullYear().toString() +
        Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await (this as mongoose.Document).model("User").findOne({
        accountId: generatedId,
      });
      if (!existing) unique = true;
    }

    this.accountId = generatedId as string;
  }

  next();
});

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
