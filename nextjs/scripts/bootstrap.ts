import "dotenv/config";

/**
 * Shared setup for the standalone database scripts.
 *
 * Next.js loads `.env` for the app, but these run outside it, hence the explicit dotenv
 * import above. It must stay the first import in every script that reads the environment.
 */

/**
 * The only database names `db:reset` will drop.
 *
 * The guard is a name allowlist rather than a URI check because a connection string can point
 * anywhere while looking entirely ordinary. A production database is not on this list, so the
 * reset cannot reach one by way of a stale `.env` or a copied terminal command.
 */
export const RESETTABLE_DATABASES = [
  "bitnox-official",
  "bitnox-official-dev",
  "bitnox-official-test",
  "bitnox-dev",
  "bitnox-test",
];

/** The database name out of a connection string, before anything connects to it. */
export function databaseNameFromUri(uri: string): string | undefined {
  try {
    const parsed = new URL(uri);
    const name = decodeURIComponent(parsed.pathname.replace(/^\//, "")).trim();
    return name.length > 0 ? name : undefined;
  } catch {
    return undefined;
  }
}

export function fail(message: string): never {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

export function info(message: string): void {
  console.log(`  ${message}`);
}

export function heading(message: string): void {
  console.log(`\n${message}`);
}
