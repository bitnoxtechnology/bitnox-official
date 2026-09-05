import { NextResponse, type NextRequest } from "next/server";

import { isSuperAdmin, getCurrentUser } from "@/lib/auth/guards";
import { exportSubscribers } from "@/lib/queries/admin/newsletter";

/**
 * The subscriber list as a CSV file.
 *
 * A route handler rather than a server action, because this has to be an HTTP response with
 * `Content-Disposition` on it. An action returns a value to React; only a response can make the
 * browser save a file.
 *
 * Guarded here rather than relying on `proxy.ts`, which does not match `/api` and could not
 * check the role if it did. The guard returns a status rather than redirecting: this URL is
 * fetched, not navigated to, and a 302 to the sign-in page would download the sign-in page as
 * a spreadsheet.
 *
 * The unsubscribe token is not in the file. `exportSubscribers` does not select it, because it
 * is a credential that removes somebody from the list without a sign-in, and a spreadsheet
 * emailed between two people is the wrong place for one.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser();

  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!isSuperAdmin(user)) {
    return NextResponse.json({ error: "Super admins only." }, { status: 403 });
  }

  const filter = request.nextUrl.searchParams.get("status");
  const status = filter === "subscribed" || filter === "unsubscribed" ? filter : undefined;

  const subscribers = await exportSubscribers(status);

  const rows = [
    ["email", "status", "source", "subscribed", "unsubscribed"],
    ...subscribers.map((subscriber) => [
      subscriber.email,
      subscriber.status,
      subscriber.source ?? "",
      subscriber.confirmedAt ?? subscriber.createdAt,
      subscriber.unsubscribedAt ?? "",
    ]),
  ];

  const filename = `bitnox-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(rows.map((row) => row.map(csvCell).join(",")).join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      // Nothing about a subscriber list should sit in a shared cache.
      "cache-control": "no-store",
    },
  });
}

/**
 * One cell, quoted.
 *
 * Every value is quoted rather than only the ones that need it, because deciding per value is
 * where CSV writers go wrong, and a quoted cell is valid either way. Internal quotes are
 * doubled, which is how the format escapes them.
 *
 * The leading apostrophe on a value starting with `=`, `+`, `-` or `@` is not decoration. A
 * spreadsheet treats such a cell as a formula, and an address crafted to begin with one is a
 * command that runs when somebody opens the file.
 */
function csvCell(value: string): string {
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${guarded.replace(/"/g, '""')}"`;
}
