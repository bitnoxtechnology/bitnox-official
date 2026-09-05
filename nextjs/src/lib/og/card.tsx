import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The shared Open Graph card.
 *
 * One design, used by every `opengraph-image.tsx` on the site, so a post, a project and a
 * service all look like they came from the same place when they are pasted into a chat.
 *
 * These are drawn by Satori rather than by a browser, and it supports a small subset of CSS.
 * Two rules follow from that and are worth stating once here rather than being rediscovered:
 * every element holding more than one child needs an explicit `display: "flex"`, and custom
 * properties do not resolve. This file therefore writes the brand colours as literals, which
 * is the same exception the React Email templates make and for the same reason. If a brand
 * colour moves in `globals.css`, it moves here by hand.
 *
 * The faces are read from disk rather than taken from `next/font`, because `next/font`
 * produces CSS and a hashed URL for the browser, and Satori needs the font bytes. They are
 * read once per process at module load: an OG image is generated at build for every post, and
 * re-reading two font files for each one is work done forty times for one result.
 */

const FONT_DIR = join(process.cwd(), "src/assets/fonts");

const [headingFont, bodyFont] = await Promise.all([
  readFile(join(FONT_DIR, "Sora-SemiBold.ttf")),
  readFile(join(FONT_DIR, "Geist-Regular.ttf")),
]);

/** The size every social network crops from. Exported so the routes can re-use it. */
export const OG_SIZE = { width: 1200, height: 630 };

export const OG_CONTENT_TYPE = "image/png";

const BACKGROUND = "#0a0a0a";
const ACCENT = "#05e4fc";
const TEXT = "#d4e4f0";
const MUTED = "#94a3b8";
const HAIRLINE = "rgba(5, 228, 252, 0.15)";

/**
 * A title long enough to overflow the card is cut rather than shrunk.
 *
 * Satori has no line clamp, so an eight-line headline would run off the bottom edge and be
 * silently cropped mid-word by the renderer. Cutting at a word boundary and adding an
 * ellipsis is the same outcome, decided here instead of by the crop.
 */
function clampTitle(title: string, limit = 92): string {
  if (title.length <= limit) return title;

  const cut = title.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");

  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}...`;
}

export interface OgCardProps {
  /** The small uppercase label above the title: the section, or the post's category. */
  eyebrow: string;
  title: string;
  /** The line along the bottom right: a date, a reading time, a client name. */
  meta?: string;
}

export function renderOgCard({ eyebrow, title, meta }: OgCardProps): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BACKGROUND,
        padding: "72px 80px",
        // The one piece of brand furniture on the card: a cyan rule down the left edge,
        // the same hairline that separates every section on the site.
        borderLeft: `10px solid ${ACCENT}`,
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontFamily: "Sora", fontSize: 34, color: TEXT, letterSpacing: "-0.02em" }}>
            Bitnox
          </span>
          <span style={{ fontFamily: "Sora", fontSize: 34, color: ACCENT }}>.</span>
        </div>

        <span
          style={{
            fontSize: 20,
            color: ACCENT,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: "Sora",
            fontSize: title.length > 60 ? 62 : 74,
            lineHeight: 1.12,
            color: TEXT,
            letterSpacing: "-0.03em",
          }}
        >
          {clampTitle(title)}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${HAIRLINE}`,
          paddingTop: 28,
          fontSize: 24,
          color: MUTED,
        }}
      >
        <span>bitnoxsolution.com</span>
        {meta ? <span>{meta}</span> : null}
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Sora", data: headingFont, style: "normal", weight: 600 },
        { name: "Geist", data: bodyFont, style: "normal", weight: 400 },
      ],
    },
  );
}
