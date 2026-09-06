"use client";

import * as React from "react";
import type { gsap as GsapNamespace } from "gsap";

/**
 * The single place GSAP is configured, and the single place it is loaded.
 *
 * It used to import `gsap`, `gsap/ScrollTrigger` and `@gsap/react` at the top of the file.
 * That is the obvious way to write it and it put 114 kB of JavaScript, 44 kB over the wire,
 * into the first script tag of every public page, including `/privacy` and `/terms`, which
 * animate almost nothing. The Phase 13 bundle audit is what surfaced it: run
 * `npm run audit:bundles` after a build and the old arrangement fails on every public route.
 *
 * So the import is dynamic and the primitives wait for it. Nothing about the animations
 * changes, because none of them need to run at first paint: every one is either a `from`
 * tween, whose resting state is what the server already rendered, or a ScrollTrigger that
 * fires when the element crosses the viewport. If GSAP arrives a moment after hydration the
 * page is simply already in its finished state, which is the same thing a visitor with
 * reduced motion or with JavaScript off sees. There is no flash of hidden content to guard
 * against, because nothing is ever hidden in the markup.
 *
 * The trade is that `useGSAP` from `@gsap/react` cannot be used: a hook has to be imported at
 * module scope, and importing it is what pulls GSAP back into the bundle. `useGsapEffect`
 * below is the replacement and it does what that hook does, since `useGSAP` is itself a thin
 * wrapper over `gsap.context()`. The `gsap.context()` cleanup contract that React 19 strict
 * mode requires is unchanged and is enforced here rather than in each primitive.
 */

type Gsap = typeof GsapNamespace;

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

/**
 * Whether the visitor has asked for less movement.
 *
 * Checked before the import rather than only inside `matchMedia`, because a timeline that
 * will never be built is not worth 114 kB to decide against. Someone who turns the setting
 * off mid-session gets no animation until the next navigation, which is the correct trade
 * for the one visitor in a session who does that.
 */
function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

let gsapPromise: Promise<Gsap> | null = null;

/**
 * Load GSAP and register its plugins, once per page.
 *
 * The promise is memoised at module scope, so twenty `<Reveal>`s on a page share one network
 * request and one `registerPlugin` call. `ScrollTrigger` is the only plugin the site uses;
 * `useGSAP` is no longer registered because it is no longer imported.
 */
export function loadGsap(): Promise<Gsap> {
  gsapPromise ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([core, scrollTrigger]) => {
      core.gsap.registerPlugin(scrollTrigger.ScrollTrigger);
      return core.gsap;
    },
  );

  return gsapPromise;
}

type GsapEffectOptions = {
  /**
   * The element the context is scoped to. Selector strings inside the setup function resolve
   * within it, and every tween created inside is reverted when it unmounts.
   */
  scope: React.RefObject<HTMLElement | null>;
  /** Re-run the setup when any of these change, as `useGSAP`'s `dependencies` did. */
  dependencies: React.DependencyList;
};

/**
 * The deferred equivalent of `useGSAP`.
 *
 * Waits for the dynamic import, then runs `setup` inside a `gsap.context()` scoped to the
 * ref, and reverts that context on unmount or when the dependencies change. `setup` may
 * return its own cleanup, which `context.revert()` calls; that is how the primitives dispose
 * of their `matchMedia` instances, and it is the same contract the hook it replaces had.
 *
 * `cancelled` matters more here than in an ordinary effect. The import resolves on a later
 * tick, so a component that unmounts during the fetch would otherwise build a timeline
 * against a detached element and leave a ScrollTrigger behind on every route change.
 */
export function useGsapEffect(
  setup: (gsap: Gsap) => void | (() => void),
  { scope, dependencies }: GsapEffectOptions,
) {
  // `setup` is an inline closure, so it is a new function on every render and would re-run
  // this effect on every render if it were a dependency. `useEffectEvent` is the sanctioned
  // way to read the latest one without depending on it; the older trick of assigning to a ref
  // during render is what it replaces, and the lint rules now reject that.
  const runSetup = React.useEffectEvent((gsap: Gsap) => setup(gsap));

  React.useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;
    let context: ReturnType<Gsap["context"]> | null = null;

    void loadGsap().then((gsap) => {
      if (cancelled || !scope.current) return;
      context = gsap.context(() => runSetup(gsap), scope);
    });

    return () => {
      cancelled = true;
      context?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
