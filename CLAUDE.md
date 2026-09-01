# Bitnox Technology Solutions: Project Memory

Conventions for the Next.js 16 application in `nextjs/`. This file is the standing reference.
The build sequence lives in `new-implementation-plan.md`. Library and environment detail lives in
`tech-stack.md`.

---

## Project Overview

Bitnox Technology Solutions is a Nigeria and UK based technology company. The live domain is
`bitnoxsolution.com`. The site exists to make four things obvious to a first-time visitor: what
Bitnox builds, that a 60-capacity Event Space can be booked, where the courses are, and how to make
contact. An admin dashboard manages blog posts, portfolio, testimonials, the Event Space gallery,
users, newsletter subscribers and an enquiries inbox.

SEO is the reason this application exists in its current form. Every structural decision, from the
per-service URLs to the static generation strategy, follows from that.

---

## Repository Structure

```
bitnox-official/
├── nextjs/                     # The application. All new work happens here.
├── client/                     # Legacy Vite SPA. Reference only, deleted at cutover.
├── server/                     # Legacy Express API. Reference only, deleted at cutover.
├── CLAUDE.md                   # This file
├── tech-stack.md               # Stack, dependencies, environment, how to run
└── new-implementation-plan.md  # Phased build plan
```

Do not add features to `client/` or `server/`. They are kept only so the new build can consult the
existing UI, GSAP timelines and business logic. Both are removed once the Next.js app is live.

---

## Business Facts

**NAP. Confirmed valid. Use verbatim in structured data, the footer and the contact page.**

```
24 Last Floor, Majek Kembo Plaza, beside Chicken Republic,
Lalubu Street, Oke-Ilewo, Abeokuta, Ogun State, Nigeria
+234 813 719 2766
info@bitnoxsolution.com
approx. 7.1352459, 3.3390846
```

This string must match the Google Business Profile character for character. Divergence between the
site and the profile weakens the local ranking signal that the Event Space page depends on.

**Sister properties.**

| Property | Domain | Role |
|---|---|---|
| Bitnox Technology | `bitnoxsolution.com` | This site |
| Bitnox Education | `edu.bitnoxsolution.com` | Course catalogue and enrolment |
| Bitnox Cleaning | `cleaning.bitnoxsolution.com` | Laundry and cleaning |

A visitor looking for courses must reach `edu.bitnoxsolution.com` without hunting. It appears in
the nav as a call to action, in the hero, on the Technology Training service page, in a dedicated
landing band and in the footer.

---

## The Four Services

Exactly four, everywhere. Service pages, landing cards, nav dropdown, footer and sitemap.

| Service | Slug | Covers |
|---|---|---|
| Software Development | `software-development` | Custom software, business management systems, web applications, digital solutions |
| Web Development | `web-development` | Professional websites, e-commerce platforms, portals, web-based solutions |
| IT Consulting | `it-consulting` | Technology advisory, digital transformation, IT strategy, technology solutions |
| Technology Training | `technology-training` | Professional training in technology and digital skills |

Cloud infrastructure, cybersecurity and digital marketing are **not** top-level services. They are
named capabilities inside a parent service page, so the keywords survive without diluting the
information architecture:

- Cloud infrastructure lives inside Software Development
- Digital marketing lives inside Web Development
- Cybersecurity lives inside IT Consulting

Do not reintroduce them as separate pages, cards or nav entries.

---

## Naming: "Event Space"

The 60-capacity room is called **Event Space**. Never "training room", "workspace", "hub" or
"event centre". The name is fixed in the URL (`/event-space`), the models (`EventSpace*`), the
components, the nav label and every line of copy.

Why: the room is booked for conferences, meetings, workshops, tech gatherings and classes.
"Workspace" implies coworking desks. "Room" undersells 60 seats. "Hub" does not signal that it can
be booked. "Event centre" attracts wedding and party enquiries, which is the wrong audience.

Adjacent search intent (conference hall, meeting room hire, training room hire) is captured in H2
headings and body copy, never by renaming the space.

**Pricing is on request.** No rates, ranges or "from" figures anywhere on the site. The enquiry
form is the pricing mechanism. The `EventVenue` schema omits `priceRange` and `offers` rather than
guessing, because incorrect price markup is worse than absent markup.

---

## Route Map

| Route | Notes |
|---|---|
| `/` | All four services. No cleaning content of any kind. |
| `/services` | Hub |
| `/services/[slug]` | Four pages, statically generated |
| `/event-space` | Gallery, capacity, layouts, amenities, location, enquiry form |
| `/blog`, `/blog/[slug]`, `/blog/tag/[tag]` | Static, revalidated by tag |
| `/portfolio`, `/portfolio/[slug]` | Indexable project pages |
| `/about`, `/contact` | |
| `/cleaning` | Overview only, hands off to the subdomain |
| `/terms`, `/privacy` | Indexable |
| `/admin/*` | Guarded, `noindex` |

**The `/cleaning` rule.** It is a short overview, not a service page. It states that Bitnox offers
laundry and cleaning, summarises in a few lines, and routes to `cleaning.bitnoxsolution.com`. No
pricing, no quote form, no service detail, and no `Service` or `LocalBusiness` schema, since that
markup belongs on the subdomain and duplicating it competes with the page being pointed at. It
carries a canonical pointing at the subdomain, and stays in the sitemap and indexable.

**The landing page rule.** No laundry or cleaning copy, imagery or links on `/`. Cleaning is
reachable from the footer property switcher only.

---

## Architectural Conventions

**Server first.** Pages and data fetching are server components. `"use client"` sits as far down
the tree as possible, on the leaf that actually needs interactivity. No editor, GSAP or admin code
may reach a public page bundle.

**Mutations are server actions**, not route handlers. Route handlers exist only for things that
must be HTTP endpoints: the Cloudinary signature endpoint, the scheduled-publish cron, webhooks.

**Every server action calls `requireUser()` or `requireSuperAdmin()` before touching data.**
`proxy.ts` guarding `/admin/*` is defence in depth, not the authorisation boundary. Never rely on
it alone.

**One Zod schema per form, two consumers.** The schema in `src/lib/validations/` is used by the
react-hook-form resolver on the client and re-validated inside the server action. Never write the
rules twice, and never trust the client-side pass.

**Static by default, invalidated by tag.** Public pages are statically generated. Any admin
mutation that changes public content calls `revalidateTag()` for the affected tag before returning.
Time-based revalidation is not used.

**Mongoose documents never cross the server and client boundary.** Serialize through `src/lib/dto.ts`
into plain objects first.

**Uploads are signed server-side.** The browser posts directly to Cloudinary using a signature from
`/api/uploads/sign`. No unsigned upload preset ships to production.

**Blog content is Tiptap JSON.** `contentJson` is the source of truth. `contentHtml` is a rendered
snapshot written on save and read by the public page, so the reader never downloads editor code.
Rendering happens server-side.

**The database starts empty and nothing is migrated from the legacy app.** Models are designed for
what this site needs, not inherited. `npm run db:reset -- --confirm` drops every collection, guarded
by a database-name allowlist, and `npm run db:seed` creates the first super_admin and the
`SiteSettings` singleton. A clean database cannot be logged into until it has been seeded.

**Publishable content uses a `status` enum, never an `isPublished` boolean.** Blog and Project both
use `draft`, `scheduled`, `published`, `archived`, because those are four distinct states and a
boolean collapses them.

**Images are objects, not URL strings.** Every image field carries `{ url, alt, caption, sortOrder }`.
Alt text is required, since image SEO and accessibility both depend on it and a bare string cannot
hold it.

---

## Folder Structure

```
nextjs/src/
├── app/
│   ├── (public)/            # Public route group, PublicLayout chrome
│   ├── admin/               # Guarded, own layout
│   ├── api/                 # Route handlers only where HTTP is required
│   ├── sitemap.ts, robots.ts
│   └── opengraph-image.tsx
├── components/
│   ├── ui/                  # shadcn primitives, restyled to brand
│   ├── motion/              # Reveal, StaggerGroup, Parallax over GSAP
│   ├── seo/                 # JSON-LD components
│   ├── forms/
│   ├── editor/              # Tiptap, admin only
│   └── skeleton/
├── content/
│   ├── services.ts          # The four services as typed content
│   └── copy-standards.md
├── lib/
│   ├── db.ts                # Cached Mongoose connection
│   ├── env.ts               # Zod-validated process.env
│   ├── dto.ts               # Document to plain object serializers
│   ├── auth/                # password.ts, session.ts, guards
│   ├── actions/             # Server actions by domain
│   ├── validations/         # Shared Zod schemas
│   └── mail/                # Resend client and React Email templates
├── models/                  # Mongoose models
└── proxy.ts                 # Route protection
```

---

## Naming Conventions

- Models: `blog.model.ts`, `event-space-image.model.ts` in `src/models/`, PascalCase export
- Server actions: `<domain>-actions.ts` in `src/lib/actions/`, verb-first exports (`createBlog`, `deleteEnquiry`)
- Validators: `<domain>-schema.ts` in `src/lib/validations/`, exports `<thing>Schema` and an inferred type
- Components: PascalCase files, colocated with the route when route-specific
- Admin pages: `src/app/admin/<domain>/page.tsx`
- JSON-LD: `<Type>Schema.tsx` in `src/components/seo/`
- No `.css` files beyond `globals.css`. All styling is Tailwind v4 utilities and `@theme` tokens.

---

## Content and UI Standards

These apply to every line of copy and every component. Treat violations as bugs. Before any page is
marked done, one pass reads its copy against this list.

**Copy is written the way a working copywriter writes it.** Specific, plain, confident. Short
sentences. Concrete nouns. Claims that could be verified. Every page answers what Bitnox does for
this reader, why it matters, and what to do next.

**Banned words and phrases.** elevate, unlock, empower, seamless, seamlessly, cutting-edge,
state-of-the-art, revolutionise, game-changer, game-changing, transform your business, take it to
the next level, robust, leverage (as a verb), delve, navigate the landscape, in today's fast-paced
world, ever-evolving, dive into, harness the power of, at the forefront, tailored to your unique
needs, bespoke solutions, holistic, synergy, best-in-class, world-class, one-stop shop,
"we don't just X, we Y", "it's not just X, it's Y", "whether you're X or Y".

**Banned characters in body copy.** No em dashes. No en dashes in prose. No arrow glyphs in
sentences. No emoji as bullets or section markers. No decorative unicode. Use commas, colons, full
stops and parentheses.

**Banned copy patterns.** No fabricated social proof: no invented client counts, star ratings or
"trusted by thousands". No rhetorical-question openers. No three-word staccato triads
("Fast. Secure. Reliable."). No headline that is a single abstract noun. No filler intro paragraph
before the real content starts. Where a price is withheld, say rates depend on date, duration and
setup. Do not substitute "affordable" or "competitive" for a number.

**UI standards.** No purple-to-blue gradient blobs. No glow behind everything. No generic hero
illustration of abstract shapes. No icon on every list item. No card that is only an icon, a
two-word title and a sentence of filler. Space, type scale and restraint carry the design. Real
screenshots and real photography over stock abstractions. The brand below is a constraint, not a
starting point to redecorate.

---

## Brand Identity

- Background: `#0a0a0a`
- Accent and primary: `#05e4fc` (cyan)
- Muted text: `#94a3b8`
- Card text: `#d4e4f0`
- Glass surface: `background: rgba(0,45,67,0.3)`, `border: 1px solid rgba(5,228,252,0.15)`, `backdrop-filter: blur(12px)`

Defined once as Tailwind v4 `@theme` tokens in `globals.css`, with a `.glass` utility for the
surface treatment. Muted text on the near-black ground needs checking against WCAG AA before it is
used for body copy.

**Animation.** GSAP with ScrollTrigger for scroll-driven sequences, Motion for UI transitions. All
GSAP runs inside `useGSAP` with `gsap.context()` cleanup, or React 19 strict mode double-invocation
creates duplicate timelines. `prefers-reduced-motion` is honoured once inside the motion
primitives, never per usage.
