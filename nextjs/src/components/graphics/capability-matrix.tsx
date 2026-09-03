import Link from "next/link";

import { SERVICES, servicePath } from "@/content/services";
import { cn } from "@/lib/utils";

/**
 * The whole offer on one grid.
 *
 * This replaced three cards explaining where cloud infrastructure, digital marketing and
 * cybersecurity live. Cards were the wrong shape for it: the question a visitor has is
 * comparative ("which of these four is mine?"), and a comparison is a table.
 *
 * It reads from `SERVICES`, so it cannot drift from the nav, the footer or the service pages,
 * and it happens to work as a grid because each service carries exactly five capabilities.
 * That is a coincidence worth keeping rather than relying on, so a service with a sixth would
 * simply extend its own column: the rows are built from the longest list.
 *
 * The three accented cells are the terms that are not pages of their own. Somebody who
 * arrived searching for one of them can find it in the column that owns it, in one glance,
 * which is the only job this section has.
 *
 * It scrolls sideways on a phone rather than stacking. Four columns collapsed into four lists
 * is the card layout again, and a comparison a reader cannot see side by side is not a
 * comparison.
 */

/** The capabilities that carry search terms with no page of their own. */
const HIGHLIGHTED = new Set([
  "Cloud infrastructure and deployment",
  "Digital marketing and search optimisation",
  "Cybersecurity review and hardening",
]);

export function CapabilityMatrix() {
  const rows = Math.max(...SERVICES.map((service) => service.capabilities.length));

  return (
    <div className="-mx-gutter px-gutter overflow-x-auto lg:mx-0 lg:px-0">
      <table className="w-full min-w-3xl border-collapse text-left">
        <caption className="sr-only">The four Bitnox services and the work each one covers</caption>
        <thead>
          <tr>
            {SERVICES.map((service) => (
              <th key={service.slug} scope="col" className="border-border w-1/4 border-b p-0">
                <Link
                  href={servicePath(service.slug)}
                  className="hover:bg-muted/50 block px-4 py-4 transition-colors sm:px-5"
                >
                  <span className="text-foreground block text-base font-semibold">
                    {service.name}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs font-normal">
                    {service.tagline}
                  </span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {SERVICES.map((service) => {
                const capability = service.capabilities[row];
                const accented = capability !== undefined && HIGHLIGHTED.has(capability);

                return (
                  <td
                    key={service.slug}
                    className={cn(
                      "border-border/60 border-b px-4 py-3.5 align-top text-sm sm:px-5",
                      accented ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {capability ?? ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
