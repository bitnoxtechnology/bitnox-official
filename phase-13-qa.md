# Phase 13: Performance, Accessibility and QA

What was measured, what it measured at, what was fixed, and what is left. Measurements are from
a production build (`npm run build`) served by `npx next start -p 3210` on the development
machine, against Chrome 151 headless. Re-run any of them with the commands given.

Written 5 September 2026.

---

## The audit commands

Four of the checks are now scripts rather than one-off inspections, because a check you cannot
re-run is a check that is true once. All four exit non-zero on a violation, so they can go into
CI as they are.

| Command | What it answers | Needs a build |
|---|---|---|
| `npm run audit:copy` | Does any rendered page break the banned-words, banned-patterns or banned-characters lists | yes |
| `npm run audit:contrast` | Does every colour pair the site actually renders clear WCAG AA | no |
| `npm run audit:a11y` | Landmarks, one `h1`, heading rank, alt text, control labels, link names, duplicate ids, positive tabindex | yes |
| `npm run audit:bundles` | Does any public page bundle carry editor, GSAP or admin code, and what does each page weigh | yes |
| `npm run audit` | All four in order | yes |
| `npm run audit:lighthouse` | Lighthouse and Core Web Vitals over the four pages, both form factors | yes, and a running server |
| `npm run analyze` | Next's own Turbopack analyzer, an interactive treemap on port 4000 | writes one |

`analyze` is `next experimental-analyze`, not `@next/bundle-analyzer`. The plan named the
latter, and it was installed and wired into `next.config.ts` before the problem showed up: it
is not compatible with Turbopack builds, which is what this project builds with, so it printed
a notice and produced no report. `next experimental-analyze -o` writes the same information to
`.next/diagnostics/analyze`, and without `-o` it serves an interactive treemap. `audit:bundles`
is the answer to the specific Phase 13 question and the one to run in CI; the analyzer is for
looking at a chunk when the audit says something is in it that should not be.

`audit:lighthouse` drives a Chrome that is already listening on a debugging port rather than
launching its own, because `chrome-launcher` cannot delete its temporary profile on Windows and
fails the run during teardown, after the measurement it just took. Start one with:

```
chrome --headless=new --remote-debugging-port=9222 --user-data-dir=<a scratch directory>
```

Two tests suites cover the server side: `npm run test:auth` (28 tests, unchanged) and
`npm run test:actions` (21 tests, new). `npm test` runs both. Both need `TEST_MONGO_URI`, or
`MONGO_URI` with the database name replaced by `bitnox-official-test`, and both refuse to run
against any other database name.

---

## Results

### Passing

**Client and server boundaries.** 78 modules carry `"use client"`, and every one of them is a
leaf that owns interactivity: the navbar's mobile sheet, the forms, the gallery lightbox, the
motion primitives, the shadcn primitives that wrap Radix, and the admin. No layout and no page
is a client component. `src/app/(public)/layout.tsx` matched a grep for `"use client"` only
because its comment quotes the rule.

**No editor, GSAP or admin code in a public bundle.** Editor and admin were already clean. GSAP
was not, and is now; see the fix below.

**Images.** Every image on the site goes through `next/image`. Every `fill` image declares
`sizes`. Every hero declares `priority` and everything else is lazy. Every image has alt text.
The one raw `<img>` is inside `src/lib/og/card.tsx`, which renders through Satori for the Open
Graph images and where `next/image` does not apply.

**Semantics and accessibility.** 50 rendered pages pass the audit. Lighthouse scores
accessibility 100 on all four sampled pages, on both form factors.

**Colour contrast.** 25 rendered pairs are held to WCAG AA and clear it. Body text on the page
ground is 15.23:1, the cyan is 12.74:1, and the muted grey `#94a3b8` the plan singled out is
7.72:1, which clears AAA for body copy and settles that question. Two hairline pairs are
measured and reported but not failed on; the reasoning is in the script.

**Copy.** 27 public pages carry no banned word, pattern or character. The audit reads rendered
prose rather than source, so it covers the seeded blog posts and the metadata as well as the JSX.

**Best practices and SEO.** Lighthouse 100 on both, on all four pages, on both form factors.

**Server actions.** 21 new tests over the authorisation boundary, blog CRUD and the enquiry
flows, calling the actions the way a form calls them, against a real database.

### Not met

**Lighthouse 95 on mobile.** Desktop is 93 to 97. Mobile is 53 to 69. The cause is measured and
is in "The mobile performance finding" below. This is the one Phase 13 target that is not met,
and it is not met by a wide margin rather than a narrow one.

**Core Web Vitals on a throttled mobile profile.** CLS is 0 everywhere, which is the target.
LCP is 2.9 to 5.3s against a 2.5s target. TBT, the lab stand-in for INP, is 1.46 to 2.78s
against a 200ms target. Desktop meets all three.

| | perf | a11y | best | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| **Mobile** | | | | | | | |
| `/` | 64 | 100 | 100 | 100 | 3.0s | 0 | 2,780ms |
| `/services/software-development` | 66 | 100 | 100 | 100 | 3.1s | 0 | 1,610ms |
| `/event-space` | 53 | 100 | 100 | 100 | 5.3s | 0 | 1,640ms |
| `/blog/why-your-site-is-slow-on-a-real-phone` | 69 | 100 | 100 | 100 | 2.9s | 0 | 1,460ms |
| **Desktop** | | | | | | | |
| `/` | 97 | 100 | 100 | 100 | 0.7s | 0 | 140ms |
| `/services/software-development` | 93 | 100 | 100 | 100 | 0.7s | 0 | 210ms |
| `/event-space` | 96 | 100 | 100 | 100 | 1.0s | 0 | 140ms |
| `/blog/why-your-site-is-slow-on-a-real-phone` | 96 | 100 | 100 | 100 | 0.7s | 0 | 160ms |

These are local numbers on a machine that was also running two other development servers, so
treat the mobile figures as a floor rather than a verdict. They should be taken again against
the Vercel preview in Phase 14, where the CDN, the image optimiser and Brotli all apply. The
gap is far too large to be explained by any of that, though.

### Not testable here

**Mobile Safari and Chrome Android on real devices.** Needs the devices. Lighthouse's mobile
profile is an emulation with CPU and network throttling; it is not iOS Safari, and it will not
find a `backdrop-filter` or `field-sizing` difference. Left for the Phase 14 preview.

**The full manual pass.** Every form submitting, every email arriving, every admin action
persisting and revalidating. The automated half is covered by `npm test`, which exercises the
actions and asserts the revalidation tags, but nothing here can confirm that a Resend email
lands in an inbox or that an admin sees the change on the public page. The checklist below is
what to walk through against the preview.

**Keyboard navigation.** Partly automated: the audit fails on a positive `tabindex`, on a
control with no accessible name and on a link with no accessible name, which are the failures
that are decidable from markup. Whether the tab order matches the reading order, and whether
every focus ring is visible against what is behind it, needs a person with a keyboard.

---

## What was fixed

**GSAP was in the first script tag of every public page.** 114 kB raw, 44 kB over the wire, on
`/privacy` and `/terms` as much as on the landing page. `src/components/motion/gsap.ts` now
loads it through a dynamic import, memoised at module scope so twenty `<Reveal>`s share one
request, and skips the download entirely when the visitor has asked for reduced motion. Nothing
about the animations changed: every one is either a `from` tween whose resting state is what the
server already rendered, or a ScrollTrigger that fires on a viewport crossing, so a late arrival
leaves the page in its finished state rather than in a broken one.

The trade is that `useGSAP` from `@gsap/react` could not be used, because importing a hook at
module scope is what pulls the library back in. `useGsapEffect` replaces it and does the same
work: `useGSAP` is itself a thin wrapper over `gsap.context()`, and the cleanup contract React 19
strict mode needs is now enforced in one place rather than in each primitive. `@gsap/react` has
been removed from the dependencies.

Public pages went from 409.7 kB to 366.6 kB gzipped.

**The skip link did nothing on any admin page.** `SkipToContent` in the root layout targets
`#main-content`; `admin-shell.tsx` rendered `<main id="main">`. Tabbing into an admin page and
pressing enter on the first control moved focus nowhere.

**The admin sign-in, verification, reset and invitation screens had no `<main>`.** They were a
`<div>`, so the skip link had nothing to skip to and a screen reader had nothing to distinguish
the form from the wordmark above it.

**The six-digit sign-in code had no accessible name.** `input-otp` renders one real input across
all six slots and nothing labelled it, so a screen reader reached a nameless box. It now carries
an `aria-label`, and `aria-invalid` and `aria-describedby` tie it to its error message.

**A form field's edge was at 1.59:1 against the page.** `--input` was
`rgba(5, 228, 252, 0.22)`. `Input` and `Textarea` are transparent apart from a `bg-input/30`
wash, so that line is the only thing saying where the box is, which makes it a user interface
component under WCAG 1.4.11 and puts it on a 3:1 floor. It is now `0.45`, which measures 3.23:1
against the page ground and clears 3:1 on the card, muted, secondary, popover and accent
surfaces too. `--border`, the decorative glass hairline named in `CLAUDE.md`, is unchanged.

**Six links inside sentences were distinguished by colour alone.** Lighthouse found it on
`/event-space` as `link-in-text-block`, and it was the only thing keeping that page off 100 for
accessibility. `src/components/site/inline-link.tsx` now carries the underline treatment that
`globals.css` already gave links inside blog prose, and `RichText`, the about page, the contact
page, the services page, the Event Space enquiry section and the 404 page all use it. Links that
stand alone in a cell or a `dd` are deliberately left plain: nothing surrounds them to be
distinguished from.

---

## The mobile performance finding

This one is a decision rather than a fix, which is why it is written out rather than acted on.

Lighthouse attributes main-thread CPU per script. On the landing page, on the throttled mobile
profile:

| Script | CPU |
|---|---|
| GSAP core | 3,002ms |
| react-dom | 2,269ms |
| the page's own code | 2,478ms |
| ScrollTrigger | 133ms |
| Zod | 94ms |

GSAP costs more main-thread time on a mid-range phone than React does. It is the largest single
item on the page and it is spent entirely on decorative entrance animations. Deferring it out of
the initial bundle, which is what the fix above did, removed it from the download critical path
but not from the CPU budget: it still loads immediately after hydration, inside the window TBT
measures.

Zod, which looks like the problem when you read the bundle sizes, is not: 80 kB of download and
94ms of CPU. The "one Zod schema, two consumers" convention is not what is costing the score.

There are three ways forward and the choice is not one to make inside a QA phase:

1. **Accept it.** Mobile Lighthouse lands somewhere around 65, field Core Web Vitals will
   probably fail LCP and INP on mid-range Android, and the animations stay as designed. Given
   that SEO is the reason this application exists in its current form, and that Core Web Vitals
   are a ranking signal, this is the expensive option even though it is the one that changes
   nothing.
2. **Load GSAP at idle rather than at hydration.** Moves the 3s out of the TBT window. It needs
   a rule for what happens when the library arrives after the visitor has already seen the
   content, because a `from` tween applied late makes settled content disappear and re-animate.
   Skipping an entrance whose element is already in view is the right rule and it is a change to
   how the site behaves, not just to when a file loads.
3. **Replace the four primitives.** `Reveal`, `StaggerGroup`, `Parallax` and `SplitText` do fades,
   translations and scroll-linked drift. CSS `animation-timeline: view()` with an
   IntersectionObserver fallback does all of that with no library, no 114 kB and no 3s. It is a
   rewrite of the motion layer and it would need the same `prefers-reduced-motion` guard, which
   CSS handles more cheaply than JavaScript does.

Two smaller items sit underneath, worth taking whichever way the above goes:

- **`/event-space` LCP is 5.3s** because Lighthouse picks a gallery tile as the LCP element, and
  every tile is `loading="lazy"` by a deliberate decision recorded in `gallery-section.tsx`. 27%
  of that LCP is load delay caused by the lazy attribute and 60% is transfer. The source
  photographs in `public/event-space/` are 650 to 730 kB JPEGs each.
- **`/services/software-development` is the weakest desktop page** at 93, on 210ms of TBT against
  the 200ms line. It is the only page that misses on desktop and it misses by 10ms.

---

## The manual checklist

To be walked against the Vercel preview in Phase 14, on a real phone as well as a desktop
browser. Nothing here is checkable from this machine.

### Keyboard

- [ ] Tab from a cold load on `/`: the skip link appears first and moves focus into `<main>`
- [ ] The whole navbar, including the services dropdown, is reachable and operable without a mouse
- [ ] The mobile sheet traps focus while open and returns it to the trigger on close
- [ ] Every focus ring is visible against the surface behind it, including on the glass panels
- [ ] The Event Space gallery opens, moves between photographs and closes on Escape
- [ ] Contact and Event Space forms: every field reachable in reading order, errors announced
- [ ] The admin tables, row menus and dialogs are operable, and the skip link works there too
- [ ] The Tiptap toolbar, slash menu and bubble menu are reachable without a mouse

### Devices

- [ ] Mobile Safari on a real iPhone: the glass surfaces, the sticky navbar, the sheet, the gallery
- [ ] Chrome on a real mid-range Android: the same, plus how the entrance animations actually feel
- [ ] Both at 320px wide, which is the narrowest phone still in use
- [ ] Landscape on a phone, where the sticky header eats a larger share of the viewport

### Forms and email

- [ ] Contact form submits, the enquiry appears in the admin inbox, both emails arrive
- [ ] Event Space enquiry the same, with the date read back as the day that was chosen
- [ ] Newsletter signup from the footer and from the foot of a blog post, both recorded with
      the right source, welcome email arrives
- [ ] The unsubscribe link in a newsletter email works from a cold browser with no session
- [ ] Every acknowledgement email renders correctly in Gmail, Outlook and Apple Mail

### Admin

- [ ] Sign in, the six-digit code arrives, the code works and an expired one does not
- [ ] Create, edit, schedule, publish, archive and delete a blog post, and see the public page
      change each time without a deploy
- [ ] Upload to the Event Space gallery, reorder it, set a cover, and see `/event-space` change
- [ ] Portfolio and testimonials, the same round trip
- [ ] Invite a user, accept from the email, and confirm the new account cannot reach the
      super-admin screens
- [ ] Change site settings and confirm the footer and the structured data follow
