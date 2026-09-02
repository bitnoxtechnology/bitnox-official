"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * The single place GSAP is configured.
 *
 * Registering a plugin twice is harmless, but registering it in five component files means
 * five files that can forget to. Every motion primitive imports `gsap` from here instead of
 * from the package, so the plugins are guaranteed to be attached.
 *
 * `useGSAP` is registered as a plugin as well. That is not decorative: it is what stops a
 * production bundler from tree-shaking the hook's internals when the only reference to it is
 * inside a callback.
 */
gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The reduced-motion guard, written once.
 *
 * Every primitive builds its timeline inside `gsap.matchMedia().add(MOTION_OK, ...)`. When
 * the visitor has asked for reduced motion the callback never runs, so the timeline is never
 * created and the element simply stays as the server rendered it. When the setting changes
 * mid-session GSAP reverts or builds the timeline on its own, without a reload.
 *
 * This is why no primitive takes a `disableAnimation` prop and no page checks the media
 * query itself. The CSS half of the guard lives in `globals.css`.
 */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * The easing vocabulary.
 *
 * The legacy components used a different ease per component: `power3.out` in the hero,
 * `power2.out` in the portfolio, `back.out(1.4)` on the hero image, `back.out(2)` on badges.
 * The result was that nothing on the site moved the same way twice. Three curves cover it.
 */
export const EASE = {
  /** Entrances. Fast at the start, long settle. */
  enter: "power3.out",
  /** Scrubbed movement tied to scroll position. Anything else fights the scroll wheel. */
  scrub: "none",
  /** Small elements that benefit from a slight overshoot. Used sparingly. */
  pop: "back.out(1.4)",
} as const;

/**
 * Defaults shared by the entrance primitives, so `<Reveal>` and `<StaggerGroup>` produce
 * movement of the same size and speed rather than two similar-looking guesses.
 */
export const ENTER = {
  /** Travel distance in pixels. Far enough to read as movement, near enough not to lurch. */
  y: 24,
  duration: 0.7,
  /** The viewport line an element crosses before its entrance fires. */
  start: "top 85%",
  /** Gap between staggered items. Below 0.06 a group reads as one block. */
  stagger: 0.08,
} as const;

export { gsap, ScrollTrigger, useGSAP };
