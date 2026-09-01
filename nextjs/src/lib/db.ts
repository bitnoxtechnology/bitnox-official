import mongoose from "mongoose";

import { applyDevelopmentDns } from "@/lib/dns";
import { serverEnv } from "@/lib/env";

/**
 * A single Mongoose connection, cached on `globalThis`.
 *
 * Two things make the cache necessary. In development, hot reload re-evaluates modules on
 * every edit, so a module-scoped variable would open a new connection each time until the
 * pool is exhausted. In serverless, an invocation may reuse a warm container, and reconnecting
 * on every request costs more than the query itself.
 *
 * The promise is cached rather than the connection, so concurrent callers arriving during the
 * initial handshake await the same attempt instead of starting their own.
 */

interface MongooseCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  __bitnoxMongoose?: MongooseCache;
};

const cache: MongooseCache = (globalWithMongoose.__bitnoxMongoose ??= {
  connection: null,
  promise: null,
});

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.connection) return cache.connection;

  if (!cache.promise) {
    // Fail fast instead of buffering queries against a connection that may never arrive.
    // A hung request is harder to diagnose than a thrown connection error.
    mongoose.set("bufferCommands", false);
    mongoose.set("strictQuery", true);

    // The SRV lookup a `mongodb+srv://` URI needs fails on this machine's resolver.
    applyDevelopmentDns();

    cache.promise = mongoose
      .connect(serverEnv.MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
        socketTimeoutMS: 45_000,
      })
      .catch((error: unknown) => {
        // Clear the failed attempt so the next caller retries rather than awaiting a
        // permanently rejected promise.
        cache.promise = null;
        throw error;
      });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (!cache.connection && !cache.promise) return;

  await mongoose.disconnect();
  cache.connection = null;
  cache.promise = null;
}
