/**
 * The motion vocabulary.
 *
 * Four primitives cover every animation on the site. A page composes them; a page never
 * imports `gsap` directly and never checks `prefers-reduced-motion` itself. If something
 * needs movement these do not express, the primitive gets a prop rather than the page
 * reaching for `useGsapEffect` on its own.
 */
export { Reveal } from "./reveal";
export { StaggerGroup } from "./stagger-group";
export { Parallax } from "./parallax";
export { SplitText } from "./split-text";

// `EASE`, `ENTER` and `MOTION_OK` are deliberately not re-exported here. `gsap.ts` is a
// client module, and every export of a client module becomes a client reference that throws
// if a server component touches it. Client code that needs the constants imports
// `./gsap` directly.
