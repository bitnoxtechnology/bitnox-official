import mongoose, { Mongoose } from "mongoose";
import { config } from "../config/app.config";

let mongoInstance: Mongoose;

const connectToDatabase = async () => {
  try {
    mongoInstance = await mongoose.connect(config.MONGO_URI);

    console.info("Connected to the database successfully!");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

export { connectToDatabase, mongoInstance };
