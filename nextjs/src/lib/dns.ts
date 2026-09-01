import { setServers as setCallbackServers } from "node:dns";
import { setServers } from "node:dns/promises";

/**
 * Point DNS at public resolvers in development.
 *
 * A `mongodb+srv://` URI is not a hostname. Before connecting, the driver looks up
 * `_mongodb._tcp.<host>`, and this machine's resolver refuses SRV queries, which surfaces as
 * `querySrv ECONNREFUSED` and reads like a network outage rather than a DNS problem.
 *
 * Production is left alone. A hosting platform's resolver is its own concern.
 */

const PUBLIC_RESOLVERS = ["1.1.1.1", "8.8.8.8"];

/** Call before connecting. Safe to call more than once. */
export function applyDevelopmentDns(): void {
  if (process.env.NODE_ENV === "production") return;

  // Node keeps a separate default resolver for each API. The driver resolves SRV through the
  // promises one, so that is the line that matters, but setting only half of it would be a
  // trap for anything added later.
  setServers(PUBLIC_RESOLVERS);
  setCallbackServers(PUBLIC_RESOLVERS);
}
