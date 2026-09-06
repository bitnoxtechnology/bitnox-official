/**
 * Bundle audit: what JavaScript does a public page actually download?
 *
 * The Phase 13 requirement is that no editor, GSAP or admin code lands in a public page
 * bundle. `@next/bundle-analyzer` answers that as three treemaps you have to open and read,
 * which is fine once and useless as a regression check. This answers the same question from
 * the build output, in the terminal, with an exit code.
 *
 * It works off the prerendered HTML rather than a manifest, because the HTML is the ground
 * truth: whatever `<script src>` tags Next.js wrote into `/index.html` is exactly what a
 * browser fetches before the page is interactive. Turbopack's production chunks carry
 * numeric module ids and no paths, so a chunk is identified by what is inside it, which is
 * what SIGNATURES below are for. They are deliberately narrow strings that no unrelated
 * dependency emits.
 *
 * Run `npm run build` first, then `npm run audit:bundles`. Exits 1 on a violation.
 */

import { gzipSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";

import { assertBuilt, collectBuiltPages, isAdminRoute } from "./built-pages";

const NEXT_DIR = path.join(process.cwd(), ".next");

/** Bytes to kB, one decimal, so a table of them lines up. */
const kb = (bytes: number) => (bytes / 1024).toFixed(1).padStart(7);

type SignatureGroup = {
  label: string;
  /**
   * Strings that only appear when the library is genuinely bundled. Chosen from internals
   * rather than from package names: a build tool can leave a package name in a comment, but
   * nothing leaves `ScrollTrigger.batch` behind unless ScrollTrigger is in the file.
   */
  needles: string[];
  /** Whether finding this on a public page is a failure or only worth reporting. */
  severity: "fail" | "warn";
};

/**
 * A needle has to be an identifier the library itself emits, never one this codebase writes.
 *
 * The first version of the GSAP group matched `"ScrollTrigger"` and `"gsap.registerPlugin"`,
 * and went on failing after GSAP had been moved behind a dynamic import, because those two
 * strings are in `loadGsap()`. The loader is 30 lines and is meant to be in the page chunk;
 * the 114 kB behind it is not. Everything below is an internal name that only survives
 * minification because the library needs it at runtime.
 */

const SIGNATURES: SignatureGroup[] = [
  {
    label: "editor (Tiptap / ProseMirror)",
    needles: ["ProseMirror", "prosemirror-", "@tiptap/"],
    severity: "fail",
  },
  {
    label: "syntax highlighting (lowlight / highlight.js)",
    needles: ["hljs", "lowlight"],
    severity: "fail",
  },
  {
    label: "GSAP core",
    needles: ["_gsap", "yoyoEase", "CSSPlugin"],
    severity: "fail",
  },
  {
    label: "GSAP ScrollTrigger",
    needles: ["scrollerProxy", "anticipatePin", "pinSpacing"],
    severity: "fail",
  },
  {
    label: "admin shell",
    needles: ["Sign out"],
    severity: "fail",
  },
];

/** Every `<script src>` Next.js wrote into the document, in load order, deduplicated. */
function scriptChunks(htmlPath: string): string[] {
  const html = fs.readFileSync(htmlPath, "utf8");
  const found = html.matchAll(/<script src="(\/_next\/static\/chunks\/[^"]+\.js)"/g);
  return [...new Set([...found].map((match) => match[1]!))];
}

const chunkCache = new Map<string, { raw: number; gzip: number; source: string }>();

function readChunk(url: string) {
  const cached = chunkCache.get(url);
  if (cached) return cached;

  const file = path.join(NEXT_DIR, url.replace("/_next/", ""));
  const buffer = fs.readFileSync(file);
  const entry = {
    raw: buffer.byteLength,
    gzip: gzipSync(buffer).byteLength,
    source: buffer.toString("utf8"),
  };
  chunkCache.set(url, entry);
  return entry;
}

function main() {
  assertBuilt();

  const routes = collectBuiltPages();
  const publicRoutes = routes.filter((route) => !isAdminRoute(route.route));
  const violations: string[] = [];

  console.log("\nPublic page bundles (initial <script> payload)\n");
  console.log(
    `${"route".padEnd(52)}${"chunks".padStart(7)}${"raw kB".padStart(9)}${"gzip kB".padStart(9)}`,
  );
  console.log("-".repeat(77));

  for (const { route, file: html } of publicRoutes) {
    const chunks = scriptChunks(html);
    let raw = 0;
    let gzip = 0;
    const hits = new Map<string, string[]>();

    for (const url of chunks) {
      const chunk = readChunk(url);
      raw += chunk.raw;
      gzip += chunk.gzip;

      for (const group of SIGNATURES) {
        if (!group.needles.some((needle) => chunk.source.includes(needle))) continue;
        const list = hits.get(group.label) ?? [];
        list.push(url.replace("/_next/static/chunks/", ""));
        hits.set(group.label, list);
      }
    }

    console.log(`${route.padEnd(52)}${String(chunks.length).padStart(7)}${kb(raw)}  ${kb(gzip)}`);

    for (const [label, chunkNames] of hits) {
      const severity = SIGNATURES.find((g) => g.label === label)!.severity;
      const line = `  ${severity === "fail" ? "FAIL" : "warn"}  ${label} in ${chunkNames.join(", ")}`;
      console.log(line);
      if (severity === "fail") violations.push(`${route}: ${label}`);
    }
  }

  // The admin is allowed all of it. Reported so the numbers exist, never failed on.
  const adminRoutes = routes.filter((route) => isAdminRoute(route.route));
  console.log("\nAdmin page bundles (not audited, reported for reference)\n");
  for (const { route, file: html } of adminRoutes) {
    const chunks = scriptChunks(html);
    let raw = 0;
    let gzip = 0;
    for (const url of chunks) {
      const chunk = readChunk(url);
      raw += chunk.raw;
      gzip += chunk.gzip;
    }
    console.log(`${route.padEnd(52)}${String(chunks.length).padStart(7)}${kb(raw)}  ${kb(gzip)}`);
  }

  console.log("");

  if (violations.length > 0) {
    console.error(`Bundle audit failed. ${violations.length} violation(s):`);
    for (const violation of violations) console.error(`  ${violation}`);
    process.exit(1);
  }

  console.log(
    `Bundle audit passed. ${publicRoutes.length} public routes carry no editor, GSAP or admin code.`,
  );
}

main();
