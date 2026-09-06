/**
 * Copy audit: the banned-words and banned-characters lists, checked against the built pages.
 *
 * It reads the rendered HTML rather than `src/`, and that is the whole design. The standards
 * in `src/content/copy-standards.md` are about what a reader sees, and what a reader sees is
 * assembled from typed content, page JSX, database records and metadata. A source scan would
 * miss the blog posts entirely and would flag `CLAUDE.md`, this file and every code comment
 * that names a banned word in order to ban it. Reading the output has neither problem: text
 * inside `<script>`, `<style>` and `<template>` is skipped, so what is left is prose.
 *
 * Titles and meta descriptions are audited too. They are copy, they are the copy most people
 * read first, and a search result is not exempt from the house style.
 *
 * Run `npm run build` first, then `npm run audit:copy`. Exits 1 on a violation.
 */

import { Parser } from "htmlparser2";
import fs from "node:fs";

import { assertBuilt, collectBuiltPages, isAdminRoute } from "./built-pages";

type Rule = { label: string; pattern: RegExp };

/**
 * The banned words and phrases, verbatim from the standards.
 *
 * `\b` on each end, so "unlocked" in a sentence about a door is not a hit and neither is
 * "helpful" for "elevate". British and American spellings are both listed where the word has
 * both, because a draft written in either still breaks the rule.
 */
const BANNED_WORDS: Rule[] = [
  { label: "elevate", pattern: /\belevat(e|es|ed|ing)\b/gi },
  { label: "unlock", pattern: /\bunlock(s|ed|ing)?\b/gi },
  { label: "empower", pattern: /\bempower(s|ed|ing|ment)?\b/gi },
  { label: "seamless", pattern: /\bseamless(ly)?\b/gi },
  { label: "cutting-edge", pattern: /\bcutting[- ]edge\b/gi },
  { label: "state-of-the-art", pattern: /\bstate[- ]of[- ]the[- ]art\b/gi },
  { label: "revolutionise", pattern: /\brevolutionis|\brevolutioniz/gi },
  { label: "game-changer", pattern: /\bgame[- ]chang(er|ers|ing)\b/gi },
  { label: "transform your business", pattern: /\btransform(ing|s)? your business\b/gi },
  { label: "take it to the next level", pattern: /\bto the next level\b/gi },
  { label: "robust", pattern: /\brobust(ness)?\b/gi },
  { label: "leverage", pattern: /\bleverag(e|es|ed|ing)\b/gi },
  { label: "delve", pattern: /\bdelv(e|es|ed|ing)\b/gi },
  { label: "navigate the landscape", pattern: /\bnavigat\w* the \w*\s?landscape\b/gi },
  { label: "in today's fast-paced world", pattern: /\bfast[- ]paced world\b/gi },
  { label: "ever-evolving", pattern: /\bever[- ]evolving\b/gi },
  { label: "dive into", pattern: /\bdiv(e|es|ing) into\b/gi },
  { label: "harness the power of", pattern: /\bharness the power\b/gi },
  { label: "at the forefront", pattern: /\bat the forefront\b/gi },
  { label: "tailored to your unique needs", pattern: /\btailored to your\b/gi },
  { label: "bespoke solutions", pattern: /\bbespoke\b/gi },
  { label: "holistic", pattern: /\bholistic(ally)?\b/gi },
  { label: "synergy", pattern: /\bsynerg(y|ies|istic)\b/gi },
  { label: "best-in-class", pattern: /\bbest[- ]in[- ]class\b/gi },
  { label: "world-class", pattern: /\bworld[- ]class\b/gi },
  { label: "one-stop shop", pattern: /\bone[- ]stop shop\b/gi },
];

/**
 * The banned copy patterns.
 *
 * These are shapes rather than words, so they are the ones most likely to produce a false
 * positive and the ones worth the regex anyway, because they are exactly the constructions
 * that creep back into a draft written in a hurry.
 */
const BANNED_PATTERNS: Rule[] = [
  { label: '"we don\'t just X, we Y"', pattern: /\bwe (do ?n[o']t|don’t) just\b/gi },
  { label: "\"it's not just X, it's Y\"", pattern: /\b(it ?is|it['’]s) not just\b/gi },
  { label: '"whether you\'re X or Y"', pattern: /\bwhether you(['’]re| are)\b/gi },
];

/**
 * The banned characters.
 *
 * Em dash and en dash by code point, so a hyphen in "cutting-edge" is never confused for
 * one. Arrows cover the Unicode arrows block plus the handful that live outside it. The
 * emoji ranges are the pictographic blocks; the site uses `lucide-react` for every icon, so
 * a pictograph in the text means one was pasted into copy.
 */
const BANNED_CHARACTERS: Rule[] = [
  { label: "em dash (—)", pattern: /—/g },
  { label: "en dash (–)", pattern: /–/g },
  { label: "arrow glyph", pattern: /[←-⇿⟰-⟿⬀-⯿]/g },
  { label: "emoji or pictograph", pattern: /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}☀-➿️]/gu },
  { label: "box drawing or block element", pattern: /[─-▟]/g },
];

/**
 * The visible prose of a document, plus the title and meta description.
 *
 * `<script>` holds the flight payload, which is a serialised copy of the same text and would
 * double every count. `<style>` and `<template>` are not prose either. Everything else is.
 */
function extractProse(html: string): string {
  const parts: string[] = [];
  const skipped = new Set(["script", "style", "template", "noscript"]);
  let skipDepth = 0;

  const parser = new Parser(
    {
      onopentag(name, attrs: Record<string, string>) {
        if (skipped.has(name)) skipDepth += 1;
        if (name === "meta" && attrs.name === "description" && attrs.content) {
          parts.push(attrs.content);
        }
      },
      ontext(text) {
        if (skipDepth === 0) parts.push(text);
      },
      onclosetag(name) {
        if (skipped.has(name) && skipDepth > 0) skipDepth -= 1;
      },
    },
    { lowerCaseTags: true, lowerCaseAttributeNames: true, decodeEntities: true },
  );

  parser.write(html);
  parser.end();

  return parts.join(" ").replace(/\s+/g, " ");
}

/** The sentence a hit sits in, so a report says enough to act on without opening the page. */
function context(prose: string, index: number) {
  const start = Math.max(0, index - 60);
  const end = Math.min(prose.length, index + 60);
  return `${start > 0 ? "…" : ""}${prose.slice(start, end).trim()}${end < prose.length ? "…" : ""}`;
}

function main() {
  assertBuilt();

  // The admin is a tool, not marketing copy, and nobody reading it is being sold to. The
  // standards are about the public site, so that is what this audits.
  const pages = collectBuiltPages().filter((page) => !isAdminRoute(page.route));
  const rules = [...BANNED_WORDS, ...BANNED_PATTERNS, ...BANNED_CHARACTERS];
  let hits = 0;

  console.log("\nCopy audit: banned words, patterns and characters\n");

  for (const { route, file } of pages) {
    const prose = extractProse(fs.readFileSync(file, "utf8"));
    const found: string[] = [];

    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      for (const match of prose.matchAll(rule.pattern)) {
        found.push(`${rule.label} in "${context(prose, match.index)}"`);
      }
    }

    if (found.length === 0) {
      console.log(`  ok    ${route}`);
      continue;
    }

    hits += found.length;
    console.log(`  FAIL  ${route}`);
    for (const line of found) console.log(`          × ${line}`);
  }

  console.log("");

  if (hits > 0) {
    console.error(`Copy audit failed with ${hits} violation(s).`);
    process.exit(1);
  }

  console.log(`Copy audit passed across ${pages.length} public pages.`);
}

main();
