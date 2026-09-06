/**
 * The built pages, as the three Phase 13 audits read them.
 *
 * All three answer questions about what a browser receives, so all three work off
 * `.next/server/app` rather than off `src/`, and all three needed the same walk over it.
 * It lives here so a change to how Next.js names its output is one edit rather than three.
 */

import fs from "node:fs";
import path from "node:path";

export const APP_DIR = path.join(process.cwd(), ".next", "server", "app");

export type BuiltPage = {
  /** The URL path, so a report names something you can open. */
  route: string;
  file: string;
  /**
   * True when the file is a partial prerender that was cut off mid-stream, which is how a
   * page with dynamic content below the fold is written out. It still contains the chrome,
   * the hero and the heading structure, so it is worth auditing; it just has no `</body>`
   * and its closing tags are missing, which matters to anything counting nesting.
   */
  partial: boolean;
};

export function assertBuilt() {
  if (fs.existsSync(APP_DIR)) return;
  console.error("No build output found. Run `npm run build` first.");
  process.exit(1);
}

/**
 * Every prerendered document, mapped back to its route.
 *
 * Two kinds of file are dropped. Names starting with `_` are internal shells with no URL of
 * their own (`_not-found`, `_global-error`). Zero-length files are the placeholders Next.js
 * writes for a dynamic route whose paths are all generated on demand; the concrete paths
 * built from the same route are in the list beside them and carry the same components.
 */
export function collectBuiltPages(dir = APP_DIR, prefix = ""): BuiltPage[] {
  const pages: BuiltPage[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      pages.push(...collectBuiltPages(full, `${prefix}/${entry.name}`));
      continue;
    }

    if (!entry.name.endsWith(".html") || entry.name.startsWith("_")) continue;
    if (fs.statSync(full).size === 0) continue;

    const html = fs.readFileSync(full, "utf8");
    if (!html.includes("<body")) continue;

    const base = entry.name.replace(/\.html$/, "");
    pages.push({
      route: base === "index" ? prefix || "/" : `${prefix}/${base}`,
      file: full,
      partial: !html.includes("</body>"),
    });
  }

  return pages.sort((a, b) => a.route.localeCompare(b.route));
}

export const isAdminRoute = (route: string) => route === "/admin" || route.startsWith("/admin/");
