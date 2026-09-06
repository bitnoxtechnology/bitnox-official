/**
 * Semantics and accessibility audit, run against the built HTML.
 *
 * Phase 13 asks for semantic landmarks, one `h1` per page and descriptive alt text
 * everywhere. Those are three properties of the document a browser receives, not of the JSX
 * that produced it, so this reads `.next/server/app/**\/*.html` rather than `src/`. A page
 * whose `h1` is composed out of three components is one `h1` or two only after it renders,
 * and that is the number that matters.
 *
 * What it deliberately does not do is replace a manual pass with a screen reader. Nothing
 * static can tell you that an alt text is a useful description rather than a filename, or
 * that the tab order matches the reading order. It catches the failures that are decidable
 * from the markup, so the manual pass can spend its time on the ones that are not.
 *
 * Run `npm run build` first, then `npm run audit:a11y`. Exits 1 on a violation.
 */

import { Parser } from "htmlparser2";
import fs from "node:fs";

import { assertBuilt, collectBuiltPages, isAdminRoute } from "./built-pages";

type Attributes = Record<string, string>;

type Issue = { level: "fail" | "warn"; message: string };

/**
 * Alt text that passes `alt=""` but says nothing.
 *
 * A decorative image is correctly `alt=""`, so an empty alt is not a failure on its own.
 * These are the strings that show a description was attempted and abandoned.
 */
const USELESS_ALT =
  /^(image|photo|picture|img|logo|icon|banner|graphic|untitled|[\w-]+\.(png|jpe?g|webp|avif|svg|gif))$/i;

/**
 * Landmarks, checked by tag or by the equivalent ARIA role.
 *
 * `main` is required on every page including the admin sign-in screens, because the skip
 * link in the root layout targets it and a page without one gives it nothing to skip to.
 * The other three are required only on the public site: an admin auth screen deliberately
 * has no navigation and no footer, and failing it for that would be failing it for being
 * built correctly.
 */
const LANDMARK_ROLES = {
  header: "banner",
  main: "main",
  footer: "contentinfo",
  nav: "navigation",
} as const;
const PUBLIC_LANDMARKS = ["header", "main", "footer", "nav"] as const;
const MINIMUM_LANDMARKS = ["main"] as const;

function auditDocument(html: string, isPublic: boolean, partial: boolean): Issue[] {
  // A partial prerender is cut off at the streaming boundary, so an element that is missing
  // from the file is not necessarily missing from the page: the admin list shells stop above
  // `<main>` entirely, and their `h1` arrives with the session. Anything decidably wrong in
  // what is present is still a failure, because a second `h1`, a skipped heading rank or a
  // duplicated id in the first half of a document is wrong however the second half renders.
  // An absence is reported as a warning instead, which is the strongest thing half a
  // document supports saying.
  const absence = (message: string): Issue => ({
    level: partial ? "warn" : "fail",
    message: partial
      ? `${message} in the prerendered shell, which stops at the streaming boundary`
      : message,
  });
  const required = isPublic ? PUBLIC_LANDMARKS : MINIMUM_LANDMARKS;
  const issues: Issue[] = [];

  const headings: { level: number; text: string }[] = [];
  const landmarks = new Map<string, number>();
  const ids = new Map<string, number>();
  const labelTargets = new Set<string>();
  const controls: { tag: string; attrs: Attributes }[] = [];
  const links: { attrs: Attributes; text: string }[] = [];

  let htmlLang: string | undefined;
  let headingDepth = 0;
  let headingText = "";
  let linkDepth = 0;
  let linkText = "";
  let currentLink: Attributes | null = null;

  const parser = new Parser(
    {
      onopentag(name, attrs: Attributes) {
        if (name === "html") htmlLang = attrs.lang;

        if (attrs.id) ids.set(attrs.id, (ids.get(attrs.id) ?? 0) + 1);

        // A landmark is either the element or the role. Both count, neither is required to
        // be the other, and `role="navigation"` on a div is a legitimate way to write one.
        const role = attrs.role;
        for (const [landmark, roleName] of Object.entries(LANDMARK_ROLES)) {
          if (name === landmark || role === roleName) {
            landmarks.set(landmark, (landmarks.get(landmark) ?? 0) + 1);
          }
        }

        if (/^h[1-6]$/.test(name)) {
          headingDepth = Number(name[1]);
          // An `aria-label` on the heading is what the accessibility tree reads, which is how
          // `SplitText` keeps a split headline readable as one string.
          headingText = attrs["aria-label"] ?? "";
          headings.push({ level: headingDepth, text: headingText });
        }

        if (name === "img") {
          const alt = attrs.alt;
          const src = attrs.src ?? "(no src)";
          const hidden = attrs["aria-hidden"] === "true" || attrs.role === "presentation";

          if (alt === undefined && !hidden) {
            issues.push({
              level: "fail",
              message: `<img> with no alt attribute: ${src.slice(0, 90)}`,
            });
          } else if (alt && USELESS_ALT.test(alt.trim())) {
            issues.push({ level: "fail", message: `<img> alt is not a description: "${alt}"` });
          }
        }

        if (name === "label") {
          if (attrs.for) labelTargets.add(attrs.for);
        }

        if (name === "input" || name === "select" || name === "textarea") {
          // A Radix select renders a real `<select>` beside its combobox trigger so that the
          // value reaches `FormData`, and marks it `aria-hidden` because the trigger is what
          // a screen reader is meant to find. It is out of the accessibility tree, so it
          // needs no name, and demanding one would be demanding a second label for one field.
          if (attrs["aria-hidden"] !== "true") controls.push({ tag: name, attrs });
        }

        if (name === "a") {
          linkDepth = 1;
          linkText = "";
          currentLink = attrs;
        }

        if (attrs.tabindex && Number(attrs.tabindex) > 0) {
          issues.push({
            level: "fail",
            message: `positive tabindex="${attrs.tabindex}" on <${name}>, which reorders the tab sequence`,
          });
        }
      },

      ontext(text) {
        if (headingDepth > 0 && !headingText) headings[headings.length - 1]!.text += text;
        if (linkDepth > 0) linkText += text;
      },

      onclosetag(name) {
        if (/^h[1-6]$/.test(name)) headingDepth = 0;
        if (name === "a" && currentLink) {
          links.push({ attrs: currentLink, text: linkText });
          currentLink = null;
          linkDepth = 0;
        }
      },
    },
    { lowerCaseTags: true, lowerCaseAttributeNames: true, decodeEntities: true },
  );

  parser.write(html);
  parser.end();

  if (!htmlLang) issues.push({ level: "fail", message: "<html> has no lang attribute" });

  const h1s = headings.filter((h) => h.level === 1);
  if (h1s.length === 0) issues.push(absence("no <h1>"));
  if (h1s.length > 1) {
    issues.push({
      level: "fail",
      message: `${h1s.length} <h1> elements: ${h1s.map((h) => `"${h.text.trim().slice(0, 40)}"`).join(", ")}`,
    });
  }

  for (const landmark of required) {
    if (!landmarks.has(landmark)) issues.push(absence(`no <${landmark}> landmark`));
  }
  if ((landmarks.get("main") ?? 0) > 1) {
    issues.push({
      level: "fail",
      message: `${landmarks.get("main")} <main> landmarks, there must be one`,
    });
  }

  // A skipped rank (h2 straight to h4) breaks the document outline a screen reader navigates
  // by. Going back up any number of levels is fine and normal.
  let previous = 0;
  for (const heading of headings) {
    if (previous && heading.level > previous + 1) {
      issues.push({
        level: "fail",
        message: `heading rank jumps h${previous} to h${heading.level} at "${heading.text.trim().slice(0, 50)}"`,
      });
    }
    previous = heading.level;
  }

  for (const [id, count] of ids) {
    if (count > 1) issues.push({ level: "fail", message: `id "${id}" used ${count} times` });
  }

  for (const { tag, attrs } of controls) {
    if (attrs.type === "hidden" || attrs.type === "submit" || attrs.type === "button") continue;
    const named =
      attrs["aria-label"] ||
      attrs["aria-labelledby"] ||
      attrs.title ||
      (attrs.id && labelTargets.has(attrs.id));
    if (!named) {
      issues.push({
        level: "fail",
        message: `<${tag}${attrs.name ? ` name="${attrs.name}"` : ""}> has no label, aria-label or aria-labelledby`,
      });
    }
  }

  for (const { attrs, text } of links) {
    const named = text.trim() || attrs["aria-label"] || attrs["aria-labelledby"] || attrs.title;
    if (!named) {
      issues.push({
        level: "fail",
        message: `<a href="${(attrs.href ?? "").slice(0, 60)}"> has no accessible name`,
      });
    }
  }

  return issues;
}

function main() {
  assertBuilt();

  const pages = collectBuiltPages();
  let failures = 0;

  console.log("\nSemantics and accessibility audit\n");

  for (const { route, file, partial } of pages) {
    const html = fs.readFileSync(file, "utf8");
    const issues = auditDocument(html, !isAdminRoute(route), partial);
    const fails = issues.filter((i) => i.level === "fail");
    failures += fails.length;

    if (issues.length === 0) {
      console.log(`  ok    ${route}`);
      continue;
    }

    console.log(`  ${fails.length > 0 ? "FAIL" : "warn"}  ${route}`);
    for (const issue of issues)
      console.log(`          ${issue.level === "fail" ? "×" : "!"} ${issue.message}`);
  }

  console.log("");

  if (failures > 0) {
    console.error(
      `Accessibility audit failed with ${failures} issue(s) across ${pages.length} pages.`,
    );
    process.exit(1);
  }

  console.log(`Accessibility audit passed across ${pages.length} rendered pages.`);
}

main();
