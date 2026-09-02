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

/**
 * Was this a unique-index collision?
 *
 * Two write paths can hit one. An upsert on a key that does not exist yet is not atomic
 * across concurrent callers: MongoDB lets one insert win and hands the other `E11000`. And a
 * check-then-insert, such as looking for an existing email before creating a user, has a gap
 * between the two statements that a second request can slip through.
 *
 * Neither shows up on a single-process dev server. Both show up eventually across concurrent
 * serverless instances, which is why the callers handle this rather than assuming it away.
 */
export function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const code = (error as { code?: unknown }).code;
  if (code === 11000) return true;

  // Mongoose wraps driver errors in some paths, so the original is worth a look.
  const cause = (error as { cause?: unknown }).cause;
  return (
    typeof cause === "object" && cause !== null && (cause as { code?: unknown }).code === 11000
  );
}
