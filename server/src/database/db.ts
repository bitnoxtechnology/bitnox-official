/* import mongoose, { Mongoose } from "mongoose";
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
*/

import mongoose, { Mongoose, ClientSession } from "mongoose";
import { config } from "../config/app.config";

const MONGO_URI = config.MONGO_URI;
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined");
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn:
    | {
        conn: Mongoose | null;
        promise: Promise<Mongoose> | null;
      }
    | undefined;
}

let cached = global.mongooseConn;

if (!cached) {
  cached = global.mongooseConn = {
    conn: null,
    promise: null,
  };
}

/**
 * Ensure DB connection (Vercel-safe)
 */
export async function connectToDatabase(): Promise<Mongoose> {
  if (cached!.conn) return cached!.conn;

  if (!cached!.promise) {
    cached!.promise = mongoose
      .connect(MONGO_URI, {
        bufferCommands: false,
        dbName: "bitnox-official",
      })
      .then((m) => {
        console.info("Connected to the database successfully!");
        return m;
      });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
}

/**
 * Get a connected mongoose instance (safe to reuse)
 */
export async function getMongooseInstance(): Promise<Mongoose> {
  return connectToDatabase();
}

/**
 * Helper for MongoDB transactions
 */
export async function startSession(): Promise<ClientSession> {
  const mongooseInstance = await connectToDatabase();
  return mongooseInstance.startSession();
}
