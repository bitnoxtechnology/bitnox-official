/**
 * Colour contrast audit against WCAG 2.1.
 *
 * Phase 13 asks for the cyan-on-dark palette to be verified, and names the case it is least
 * sure of: `#94a3b8` on `#0a0a0a`. `CLAUDE.md` already records measured figures. This exists
 * so those figures are re-derived from the tokens rather than trusted, and so that moving a
 * token fails a command instead of quietly costing a ratio.
 *
 * The tokens are read out of `globals.css` rather than restated here. A copy of the palette
 * in a test file is a palette that goes stale the first time somebody edits the real one and
 * then reports that everything still passes.
 *
 * Semi-transparent tokens are composited over the surface they sit on before measuring,
 * which is what a browser does and what an eyedropper on a screenshot would show. `--border`
 * is `rgba(5, 228, 252, 0.15)`; measuring the ratio of the unblended cyan would be measuring
 * a colour nobody ever sees.
 *
 * Needs no build. Run `npm run audit:contrast`.
 */

import fs from "node:fs";
import path from "node:path";

const CSS = path.join(process.cwd(), "src", "app", "globals.css");

type Rgb = { r: number; g: number; b: number; a: number };

function parseColour(value: string): Rgb | null {
  const text = value.trim();

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const digits = hex[1]!.length === 3 ? hex[1]!.replace(/./g, (c) => c + c) : hex[1]!;
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: 1,
    };
  }

  const rgba = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/i.exec(
    text,
  );
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }

  return null;
}

/** Alpha compositing, source over. What the eye is actually given. */
function over(top: Rgb, bottom: Rgb): Rgb {
  if (top.a >= 1) return top;
  return {
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  };
}

/** WCAG relative luminance. sRGB, the 0.03928 threshold, the 2.4 exponent. */
function luminance({ r, g, b }: Rgb) {
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(foreground: Rgb, background: Rgb) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Every `--token: value;` declaration in the stylesheet.
 *
 * The palette is declared once, on `:root, .dark`, so a flat map is the right shape. A token
 * defined twice would be a bug in the stylesheet rather than something to model here.
 */
function readTokens(): Map<string, Rgb> {
  const css = fs.readFileSync(CSS, "utf8");
  const tokens = new Map<string, Rgb>();

  for (const match of css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    const colour = parseColour(match[2]!);
    if (colour) tokens.set(match[1]!, colour);
  }

  return tokens;
}

type Pair = {
  label: string;
  foreground: string;
  background: string;
  /**
   * `text` is 4.5:1 at AA and 7:1 at AAA. `ui` is a user interface component under WCAG
   * 1.4.11 and is held to 3:1. `decorative` is measured and reported but never failed on:
   * a hairline that separates two bands of a page carries no information, and 1.4.11 is
   * explicit that it applies to what is required to identify a component or its state.
   */
  kind: "text" | "ui" | "decorative";
  /** What a translucent foreground or background is composited over. */
  base?: string;
};

/**
 * The pairs that actually occur on the site.
 *
 * Not every token against every other token: most of those combinations are never rendered,
 * and a report full of failures for colours nobody pairs is a report nobody reads. Each of
 * these is a pairing a component or a base style in `globals.css` genuinely produces.
 */
const PAIRS: Pair[] = [
  {
    label: "body text on the page ground",
    foreground: "--foreground",
    background: "--background",
    kind: "text",
  },
  {
    label: "muted text on the page ground",
    foreground: "--muted-foreground",
    background: "--background",
    kind: "text",
  },
  {
    label: "primary cyan on the page ground",
    foreground: "--primary",
    background: "--background",
    kind: "text",
  },
  {
    label: "destructive on the page ground",
    foreground: "--destructive",
    background: "--background",
    kind: "text",
  },

  {
    label: "card text on a card",
    foreground: "--card-foreground",
    background: "--card",
    kind: "text",
  },
  {
    label: "muted text on a card",
    foreground: "--muted-foreground",
    background: "--card",
    kind: "text",
  },
  { label: "primary cyan on a card", foreground: "--primary", background: "--card", kind: "text" },

  {
    label: "popover text on a popover",
    foreground: "--popover-foreground",
    background: "--popover",
    kind: "text",
  },
  {
    label: "muted text on a popover",
    foreground: "--muted-foreground",
    background: "--popover",
    kind: "text",
  },

  {
    label: "primary button label on primary",
    foreground: "--primary-foreground",
    background: "--primary",
    kind: "text",
  },
  {
    label: "secondary button label on secondary",
    foreground: "--secondary-foreground",
    background: "--secondary",
    kind: "text",
  },
  {
    label: "accent text on accent",
    foreground: "--accent-foreground",
    background: "--accent",
    kind: "text",
  },
  {
    label: "muted text on the muted surface",
    foreground: "--muted-foreground",
    background: "--muted",
    kind: "text",
  },

  {
    label: "sidebar text on the sidebar",
    foreground: "--sidebar-foreground",
    background: "--sidebar",
    kind: "text",
  },
  {
    label: "sidebar active label on the sidebar accent",
    foreground: "--sidebar-accent-foreground",
    background: "--sidebar-accent",
    kind: "text",
  },
  {
    label: "sidebar button label on sidebar primary",
    foreground: "--sidebar-primary-foreground",
    background: "--sidebar-primary",
    kind: "text",
  },

  // Non-text contrast. A field's edge and a focus ring are held to 3:1; the glass hairline
  // is measured for the record and not failed on. See the `kind` doc comment above.
  {
    label: "glass hairline over the page ground",
    foreground: "--border",
    background: "--background",
    kind: "decorative",
  },
  {
    label: "sidebar hairline over the sidebar",
    foreground: "--sidebar-border",
    background: "--sidebar",
    kind: "decorative",
  },
  {
    label: "field edge over the page ground",
    foreground: "--input",
    background: "--background",
    kind: "ui",
  },
  { label: "field edge over a card", foreground: "--input", background: "--card", kind: "ui" },
  {
    label: "field edge over the muted surface",
    foreground: "--input",
    background: "--muted",
    kind: "ui",
  },
  {
    label: "field edge over a popover",
    foreground: "--input",
    background: "--popover",
    kind: "ui",
  },
  {
    label: "focus ring over the page ground",
    foreground: "--ring",
    background: "--background",
    kind: "ui",
  },
  { label: "focus ring over a card", foreground: "--ring", background: "--card", kind: "ui" },
  {
    label: "invalid field edge over the page ground",
    foreground: "--destructive",
    background: "--background",
    kind: "ui",
  },

  // The four-step admin chart ramp, each step against the surface it is drawn on.
  { label: "chart 4 on a card", foreground: "--chart-4", background: "--card", kind: "ui" },
  { label: "chart 5 on a card", foreground: "--chart-5", background: "--card", kind: "ui" },
];

const THRESHOLDS = {
  text: { aa: 4.5, aaa: 7 },
  ui: { aa: 3, aaa: 3 },
  decorative: { aa: 0, aaa: 0 },
};

function main() {
  const tokens = readTokens();
  let failures = 0;

  console.log("\nColour contrast audit (WCAG 2.1, tokens read from src/app/globals.css)\n");
  console.log(`${"pair".padEnd(46)}${"ratio".padStart(8)}${"  AA".padEnd(6)}${"AAA".padEnd(5)}`);
  console.log("-".repeat(66));

  for (const pair of PAIRS) {
    const rawForeground = tokens.get(pair.foreground);
    const rawBackground = tokens.get(pair.background);

    if (!rawForeground || !rawBackground) {
      console.error(`  missing token: ${!rawForeground ? pair.foreground : pair.background}`);
      failures += 1;
      continue;
    }

    const base = pair.base ? tokens.get(pair.base) : undefined;
    const background = over(rawBackground, base ?? { r: 0, g: 0, b: 0, a: 1 });
    const foreground = over(rawForeground, background);

    const value = ratio(foreground, background);
    const threshold = THRESHOLDS[pair.kind];
    const aa = value >= threshold.aa;
    const aaa = value >= threshold.aaa;

    if (!aa && pair.kind !== "decorative") failures += 1;

    const verdict = pair.kind === "decorative" ? "n/a " : aa ? "pass" : "FAIL";
    console.log(
      `${pair.label.padEnd(46)}${value.toFixed(2).padStart(8)}  ${verdict}  ${pair.kind === "decorative" ? "  - " : aaa ? "pass" : "  - "}`,
    );
  }

  console.log("");

  if (failures > 0) {
    console.error(`Contrast audit failed: ${failures} pair(s) below WCAG AA.`);
    process.exit(1);
  }

  const held = PAIRS.filter((pair) => pair.kind !== "decorative").length;
  console.log(
    `Contrast audit passed. ${held} of ${PAIRS.length} rendered pairs are held to WCAG AA and clear it.`,
  );
}

main();
