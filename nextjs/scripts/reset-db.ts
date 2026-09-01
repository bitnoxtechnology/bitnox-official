import { RESETTABLE_DATABASES, databaseNameFromUri, fail, heading, info } from "./bootstrap";

import { parseArgs } from "node:util";

import mongoose from "mongoose";

import { applyDevelopmentDns } from "@/lib/dns";

/**
 * Drops every collection in the target database.
 *
 * Three guards stand between running this and losing real content: an explicit `--confirm`
 * flag, a database-name allowlist, and a refusal to run under `NODE_ENV=production`. Each one
 * catches a different mistake, which is why all three are here rather than only the flag.
 *
 *   npm run db:reset -- --confirm
 */

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      confirm: { type: "boolean", default: false },
      "allow-production": { type: "boolean", default: false },
    },
    allowPositionals: false,
  });

  const uri = process.env.MONGO_URI;
  if (!uri) fail("MONGO_URI is not set. Copy .env.example to .env and fill it in.");

  const databaseName = databaseNameFromUri(uri);
  if (!databaseName) {
    fail(
      "MONGO_URI does not name a database. Add one to the connection string, for example " +
        "mongodb://127.0.0.1:27017/bitnox-official-dev",
    );
  }

  heading("Reset database");
  info(`Target: ${databaseName}`);

  if (!RESETTABLE_DATABASES.includes(databaseName)) {
    fail(
      `Refusing to reset "${databaseName}". It is not in the allowlist in ` +
        `scripts/bootstrap.ts (${RESETTABLE_DATABASES.join(", ")}).`,
    );
  }

  if (process.env.NODE_ENV === "production" && !values["allow-production"]) {
    fail("Refusing to reset with NODE_ENV=production.");
  }

  if (!values.confirm) {
    fail("This drops every collection. Re-run with --confirm if that is what you want.");
  }

  applyDevelopmentDns();
  await mongoose.connect(uri);

  // The URI was parsed by hand above. Check what the driver actually connected to, in case
  // the connection string carried a database somewhere the parser did not look.
  const connected = mongoose.connection.name;
  if (connected !== databaseName) {
    await mongoose.disconnect();
    fail(`Connected to "${connected}" but expected "${databaseName}". Nothing was dropped.`);
  }

  const db = mongoose.connection.db;
  if (!db) {
    await mongoose.disconnect();
    fail("Connected without a database handle. Nothing was dropped.");
  }

  const collections = await db.listCollections().toArray();

  if (collections.length === 0) {
    info("Already empty. Nothing to drop.");
  } else {
    for (const collection of collections) {
      await db.dropCollection(collection.name);
      info(`Dropped ${collection.name}`);
    }
  }

  await mongoose.disconnect();

  heading(`Done. "${databaseName}" is empty.`);
  info("Run `npm run db:seed` before trying to log in.\n");
}

main().catch(async (error: unknown) => {
  await mongoose.disconnect().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
