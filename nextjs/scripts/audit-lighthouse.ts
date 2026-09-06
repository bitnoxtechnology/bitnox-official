/**
 * Lighthouse over the four pages Phase 13 names, on both form factors.
 *
 * The targets are 95 or above on all four categories, and the Core Web Vitals thresholds:
 * LCP under 2.5s, CLS under 0.1, INP under 200ms. Lighthouse is a lab tool and cannot measure
 * INP, which needs a real interaction from a real person, so it reports Total Blocking Time
 * instead. TBT is the lab proxy the mobile score is largely built from, and the field INP
 * figure comes from Search Console after launch rather than from here.
 *
 * The pages are the four in the plan and each is a different shape: the landing page carries
 * the most components, a service page is the template four URLs are built from, the Event
 * Space page is the one with the gallery and the enquiry form, and a blog post is the longest
 * document with the widest content.
 *
 * Usage. Build first, then serve the build, then run this:
 *
 *   npm run build
 *   npx next start -p 3210
 *   npm run audit:lighthouse
 *
 * It drives a Chrome that is already running with a debugging port rather than launching one,
 * because chrome-launcher cannot remove its temporary profile on Windows and fails the run
 * during teardown, after the measurement it just took. Start one with:
 *
 *   chrome --headless=new --remote-debugging-port=9222 --user-data-dir=<a scratch directory>
 *
 * Override the origin with LIGHTHOUSE_URL and the port with LIGHTHOUSE_PORT.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ORIGIN = process.env.LIGHTHOUSE_URL ?? "http://localhost:3210";
const DEBUG_PORT = process.env.LIGHTHOUSE_PORT ?? "9222";
const OUT_DIR = path.join(os.tmpdir(), "bitnox-lighthouse");

const PAGES = [
  { label: "home", route: "/" },
  { label: "service", route: "/services/software-development" },
  { label: "event-space", route: "/event-space" },
  { label: "blog post", route: "/blog/why-your-site-is-slow-on-a-real-phone" },
];

const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"] as const;

/** The Phase 13 floor for every Lighthouse category. */
const SCORE_FLOOR = 95;

/** The Core Web Vitals thresholds, in the units Lighthouse reports them in. */
const VITALS = {
  "largest-contentful-paint": { label: "LCP", limit: 2_500, unit: "ms" },
  "cumulative-layout-shift": { label: "CLS", limit: 0.1, unit: "" },
  // The lab stand-in for INP. Google's own guidance is that a page under 200ms of TBT in the
  // lab is very unlikely to fail INP in the field, which is the strongest claim a lab run
  // supports.
  "total-blocking-time": { label: "TBT", limit: 200, unit: "ms" },
} as const;

type Report = {
  categories: Record<string, { score: number | null }>;
  audits: Record<string, { numericValue?: number; displayValue?: string }>;
};

function run(route: string, formFactor: "desktop" | "mobile", label: string): Report {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const output = path.join(OUT_DIR, `${label.replace(/\W+/g, "-")}-${formFactor}.json`);

  // `shell: true` because on Windows `npx` is a `.cmd`, and Node refuses to spawn a batch
  // file directly. The arguments are all literals or values from this file, so there is
  // nothing here for a shell to interpret that was not written here.
  execFileSync(
    "npx",
    [
      "--yes",
      "lighthouse@12",
      `${ORIGIN}${route}`,
      `--port=${DEBUG_PORT}`,
      ...(formFactor === "desktop" ? ["--preset=desktop"] : []),
      "--quiet",
      "--output=json",
      `--output-path=${output}`,
    ],
    { stdio: ["ignore", "ignore", "inherit"], shell: true },
  );

  return JSON.parse(fs.readFileSync(output, "utf8")) as Report;
}

function main() {
  const failures: string[] = [];

  for (const formFactor of ["mobile", "desktop"] as const) {
    console.log(`\n${formFactor === "mobile" ? "Mobile (throttled)" : "Desktop"}\n`);
    console.log(
      `${"page".padEnd(16)}${"perf".padStart(6)}${"a11y".padStart(6)}${"best".padStart(6)}${"seo".padStart(6)}` +
        `${"LCP".padStart(10)}${"CLS".padStart(8)}${"TBT".padStart(9)}`,
    );
    console.log("-".repeat(67));

    for (const page of PAGES) {
      const report = run(page.route, formFactor, page.label);

      const scores = CATEGORIES.map((category) => {
        const raw = report.categories[category]?.score;
        const score = raw === null || raw === undefined ? 0 : Math.round(raw * 100);
        if (score < SCORE_FLOOR) {
          failures.push(
            `${page.label} (${formFactor}): ${category} ${score}, floor is ${SCORE_FLOOR}`,
          );
        }
        return score;
      });

      const vitals = Object.entries(VITALS).map(([id, { label, limit }]) => {
        const value = report.audits[id]?.numericValue ?? Number.NaN;
        if (!(value <= limit)) {
          failures.push(
            `${page.label} (${formFactor}): ${label} ${value.toFixed(2)} over ${limit}`,
          );
        }
        return report.audits[id]?.displayValue ?? "?";
      });

      console.log(
        page.label.padEnd(16) +
          scores.map((score) => String(score).padStart(6)).join("") +
          vitals[0]!.padStart(10) +
          vitals[1]!.padStart(8) +
          vitals[2]!.padStart(9),
      );
    }
  }

  console.log(`\nReports written to ${OUT_DIR}\n`);

  if (failures.length > 0) {
    console.error(`Lighthouse audit failed with ${failures.length} result(s) below target:`);
    for (const failure of failures) console.error(`  ${failure}`);
    process.exit(1);
  }

  console.log("Lighthouse audit passed on every page and form factor.");
}

main();
