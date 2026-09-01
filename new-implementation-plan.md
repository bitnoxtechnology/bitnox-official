# Bitnox Official: Next.js 16 Rebuild Implementation Plan

Rebuild of the Vite/React `client/` and Express `server/` stack as a single Next.js 16 App Router
application in `nextjs/`, with SEO as the primary driver.

---

## Reference

This document is the build sequence only. Standing information lives elsewhere and is not repeated
here, so that there is one place to correct each fact:

- **`CLAUDE.md`** for conventions: the four services, the Event Space naming rule, business NAP,
  sister properties, the route map, architectural conventions, folder structure, naming, the
  content and UI standards, and brand identity.
- **`tech-stack.md`** for the stack: libraries, environment variables, the legacy-to-new env
  mapping, scripts, how to run, and the Next.js 16 details that differ from earlier versions.

Read both before starting any phase below.

---
## Phase 0: Inputs and Prerequisites

Items only you can supply. Everything not dependent on these proceeds without them.

- [ ] Event Space photographs. Any number, more than four is expected. Blocks the Phase 8 gallery, placeholders used until supplied.
- [ ] Opening hours for the `LocalBusiness` and `EventVenue` schema, which the current site does not publish
- [ ] Event Space amenities and available days: projector, Wi-Fi, air conditioning, parking, catering, seating layouts, and which days the space is free of classes
- [ ] Google Tag Manager container ID (`GTM-XXXXXXX`) and Search Console verification token
- [ ] Cloudinary API secret. Needed for signed uploads, the current setup only has the public preset.
- [ ] Confirm `cleaning.bitnoxsolution.com` is live before launch. If it is not, `/cleaning` ships without the canonical tag and gains it once the subdomain is up, so the overview is not orphaned behind a canonical pointing at a dead URL.
- [ ] Production `MONGO_URI` for a clean database, and the email address for the first super_admin account
- [ ] Portfolio projects and testimonials to enter before launch. The clean database means none carry over, and the landing page renders both.

---

## Phase 1: Scaffold and Foundations

- [x] Scaffold Next.js 16 in `nextjs/` (App Router, TypeScript, Tailwind v4, `src/` dir, `@/*` alias, Turbopack)
- [x] Configure `tsconfig.json` in strict mode with `noUncheckedIndexedAccess`
- [x] Set up ESLint and Prettier. Note that `next lint` is gone in 16, so wire ESLint directly in `package.json` scripts.
- [x] Enable `cacheComponents: true` in `next.config.ts` for `use cache` and `cacheTag` support
- [x] Configure `next/image` remote patterns for `res.cloudinary.com`
- [x] Initialise shadcn/ui (`npx shadcn@latest init`) against the Tailwind v4 setup
- [x] Create `.env.example` consolidating both old apps' variables (mapping in `tech-stack.md`) and a typed `src/lib/env.ts` that validates `process.env` with Zod at boot
- [x] Add `src/lib/utils.ts` (`cn`), the base folder skeleton, and a README section on running the app
- [x] Add `src/content/copy-standards.md` restating the Content and UI Standards from `CLAUDE.md`, so anyone editing copy later has them to hand
- [x] Verify `npm run dev` and `npm run build` both pass on the empty scaffold

---

## Phase 2: Data Layer and Schema

No migration. Development and production both start empty, so every model is designed for what the
new site needs rather than inherited from the legacy shape. Content is entered through the admin
after launch.

- [x] Write `src/lib/db.ts`, a Mongoose connection with a `globalThis` cache to survive serverless invocations and HMR
- [x] Write `scripts/reset-db.ts`, which drops every collection in the target database. Guarded behind `--confirm` and a check that `MONGO_URI` is not pointing somewhere unexpected. Refuses to run against a database whose name is not in an allowlist.
- [x] Write `scripts/seed.ts`, which creates the first `super_admin` with a password read from argv or env, and seeds the `SiteSettings` singleton. Without this, nobody can log in to a clean database.
- [x] Add `db:reset` and `db:seed` npm scripts, plus a combined `db:fresh` for development

**Blog.** `title`, `slug` (unique, generated from title with collision handling), `excerpt`,
`contentJson` (Tiptap doc, source of truth), `contentHtml` (rendered snapshot), `coverImage`,
`coverImageAlt`, `status` (`draft` | `scheduled` | `published` | `archived`), `publishedAt`,
`scheduledFor`, `tags`, `category`, `author`, `readingMinutes`, `seoTitle`, `seoDescription`,
`ogImage`, `canonicalUrl`, `featured`, `viewCount`, timestamps.

- [x] Build the Blog model. `status` replaces the legacy `isPublished` boolean, because draft, scheduled and archived are three different states that a boolean cannot express.
- [x] Slug generation runs on validate, stays stable once published, and never silently changes under an edited title

**Project (portfolio).** Improvements over the legacy model, which had no slug, no detail content
and no client context:

- [x] Add `slug` (unique) so projects get their own indexable URLs
- [x] Add `summary` (card copy) separate from `content` (Tiptap JSON plus HTML for the detail page)
- [x] Add `client`, `industry`, `services` (referencing the four service slugs), `techStack`, `completedAt`
- [x] Add `liveUrl` and `repoUrl` in place of the single untyped `link`
- [x] Add `coverImageAlt` and change `images` from `string[]` to `{ url, alt, caption, sortOrder }[]`, since bare URL strings cannot carry the alt text that image SEO and accessibility both need
- [x] Keep `featured`, `order`, `tags`, and replace `isPublished` with the same `status` enum as Blog

**Testimonial.** Improvements over the legacy model:

- [x] Make `position` and `company` optional, since not every testimonial has both, and required fields here block real entries
- [x] Add `relatedProject` (optional reference) so a testimonial can be shown on the project it refers to
- [x] Add `service` (optional, one of the four slugs) so testimonials can be surfaced on the matching service page
- [x] Add `imageAlt`, `sortOrder` and the same `status` enum as Blog and Project. Only `draft` and `published` are used in practice, but one status model across the admin means one filter component and one mental model.
- [x] Keep `clientName`, `testimonialText`, `rating`, `featured`

**User.** `name`, `email` (unique), `passwordHash` (argon2id), `role` (`super_admin` | `admin`),
`isActive`, `lastLoginAt`, `passwordChangedAt`, timestamps.

- [x] Drop `accountId`. It generated a random six-digit ID in a retry loop on every insert and nothing consumes it.
- [x] `passwordHash` is required, since the seed and invite flows both set one at creation. No user ever exists without a password.
- [x] Never select `passwordHash` by default. Use `select: false` and opt in explicitly at the one call site that verifies it.

**Session.** `sessionId` (unique), `userId`, `userAgent`, `ip`, `expiresAt`, `revokedAt`, timestamps.

- [x] Drop `refreshToken` and `deviceFp`. The cookie session replaces the access and refresh token pair, and the browser fingerprint dependency goes with it.
- [x] Add a TTL index on `expiresAt` so MongoDB expires dead sessions without a cleanup job

**Newsletter subscriber.** `email` (unique), `status` (`subscribed` | `unsubscribed`), `source`,
`confirmedAt`, `unsubscribedAt`, `unsubscribeToken`, timestamps.

- [x] Replace `isActive` with `status`, and add `source` so it is visible which page drove each signup
- [x] Add `unsubscribeToken` for one-click unsubscribe links, which bulk senders increasingly require

**New models.**

- [x] `OtpToken`: `identifier`, `codeHash`, `purpose` (`login` | `password_reset`), `expiresAt`, `attempts`, `consumedAt`, with a TTL index on `expiresAt`
- [x] `Enquiry`: `type` (`contact` | `event_space` | `cleaning`), `status` (`new` | `read` | `responded`), `name`, `email`, `phone`, `message`, plus a typed `details` sub-document for the Event Space fields (event type, preferred date, expected attendees), `source`, timestamps
- [x] `EventSpaceImage`: `url`, `alt` (required, not optional), `caption`, `sortOrder`, `isCover`. Unbounded length, admin-ordered.
- [x] `SiteSettings` singleton: NAP, opening hours, social links, sister-site URLs, default OG image, Event Space capacity, amenities and availability copy

**Shared.**

- [x] Indexes: `blog {status, publishedAt}`, unique `blog.slug`, `blog.tags`, unique `project.slug`, `project {status, order}`, `enquiry {type, status, createdAt}`, unique `newsletter.email`, `eventSpaceImage.sortOrder`, TTL on `session.expiresAt` and `otpToken.expiresAt`
- [x] Guard every model against Next.js HMR re-registration with the `models.X || model(...)` pattern, or hot reload throws `OverwriteModelError`
- [x] Write `src/lib/dto.ts`, serializers converting Mongoose documents to plain objects safe to cross the server and client boundary
- [ ] Run `db:fresh` and confirm the app boots, the seeded super_admin can log in, and every admin list renders its empty state
  - Reset and seed both ran against `bitnox-official`, the app builds and boots, and a
    verification pass confirmed the seeded super_admin, the `SiteSettings` singleton, slug
    collision handling, the DTO boundary and the indexes. Logging in cannot be checked until
    Phase 3 builds the login flow, and the admin empty states until Phase 10, so this box
    stays open until then.

---

## Phase 3: Auth and Sessions

- [ ] Implement `src/lib/auth/password.ts`, argon2id hash and verify with sane cost parameters
- [ ] Implement `src/lib/auth/session.ts`, create, read and destroy sessions in the `sessions` collection, referenced by a signed httpOnly, `sameSite=lax`, `secure` cookie
- [ ] Build the login server action: validate credentials, issue a short-lived pending-OTP token, email a 6-digit code via Resend
- [ ] Build the OTP verification action: constant-time compare, 5-attempt lockout, 10-minute expiry, single-use consumption, then upgrade to a full session
- [ ] Build the invite flow for new admins: super_admin invites by email, invitee sets their own password via a one-time link. No admin ever sets another user's password, and the seeded super_admin is the only account created outside this flow.
- [ ] Build password reset (request, emailed token, set new password) and change-password from the admin profile
- [ ] Add rate limiting on login, OTP request and OTP verify, per IP and per email, sliding window
- [ ] Add `proxy.ts` (Next 16's renamed middleware) guarding `/admin/*`, redirecting unauthenticated users to `/admin/login`
- [ ] Implement `requireUser()` and `requireSuperAdmin()` server helpers and call them inside every protected server action. The proxy is defence in depth, not the authorisation boundary.
- [ ] Build the OTP entry UI on top of shadcn's `input-otp`
- [ ] Test: expired OTP, wrong password, locked-out account, deactivated user, session expiry, super-admin route accessed as a plain admin

---

## Phase 4: Design System, UI Kit and Animation

- [ ] Define the brand as Tailwind v4 `@theme` tokens in `globals.css`: background `#0a0a0a`, accent `#05e4fc`, muted `#94a3b8`, card text `#d4e4f0`, glass surface `rgba(0,45,67,0.3)`, glass border `rgba(5,228,252,0.15)`
- [ ] Add a `.glass` utility (background, 1px border, `backdrop-filter: blur(12px)`) replacing the repeated CSS across the old stylesheets
- [ ] Set a deliberate type scale and vertical rhythm before building any page. Restraint in spacing is what separates this from a template.
- [ ] Configure fonts via `next/font` with `display: swap` and preloading
- [ ] Install the shadcn components the app needs: button, input, textarea, label, form, select, switch, dialog, sheet, dropdown-menu, table, tabs, badge, skeleton, sonner, avatar, separator, alert-dialog, pagination, command
- [ ] Restyle every shadcn primitive to the dark cyan brand rather than the default neutral palette
- [ ] Build `src/components/motion/`: `<Reveal>`, `<StaggerGroup>`, `<Parallax>` wrappers over GSAP ScrollTrigger, all client components with proper cleanup
- [ ] Honour `prefers-reduced-motion` globally, one guard inside the motion primitives rather than per usage
- [ ] Port the existing hero and scroll timelines from the current components and stylesheets, improving easing and stagger where they are rough
- [ ] Build shared page-level pieces: `<SectionHeading>`, `<GlassCard>`, `<CTABand>`, `<StatCounter>`, `<Gallery>`
- [ ] Build the skeleton set for blog cards, portfolio cards and testimonials as `loading.tsx` fallbacks
- [ ] Design review against the UI standards: no gradient blobs, no glow-on-everything, no icon-title-filler cards

---

## Phase 5: Shared Chrome and Cross-Cutting Infrastructure

- [ ] Build the root layout: `metadataBase`, GTM, theme colour, skip-to-content link, `<Toaster>`
- [ ] Build the public `Navbar`: sticky, responsive sheet menu, four services in a dropdown, Event Space, Blog, About, Contact, and a Courses call to action pointing at `edu.bitnoxsolution.com`
- [ ] Build the cross-property switcher for nav and footer: Bitnox Technology, Bitnox Education (`edu.bitnoxsolution.com`), Bitnox Cleaning (`cleaning.bitnoxsolution.com`)
- [ ] Build the `Footer`: NAP block, the four services, Event Space, sister properties, legal links, newsletter form
- [ ] Build `src/lib/mail/`: Resend client plus React Email templates for OTP, password reset, contact acknowledgement, Event Space booking acknowledgement, and internal new-enquiry notification. Email copy follows the same standards as page copy.
- [ ] Build the shared form stack: Zod schemas in `src/lib/validations/` consumed by both the react-hook-form resolver on the client and the server action on the server. One schema, two consumers.
- [ ] Build the signed Cloudinary upload: an `/api/uploads/sign` route handler returning a signature, plus an `<ImageUpload>` client component that posts directly to Cloudinary with it
- [ ] Build a `<MultiImageUpload>` variant with drag-to-reorder, per-image alt text and captions, used by the Event Space gallery and portfolio
- [ ] Establish `src/lib/actions/` conventions: a typed `ActionResult<T>`, a `withAuth()` wrapper, and consistent field-level error mapping back into react-hook-form
- [ ] Implement newsletter subscribe as a server action with duplicate-email handling and a confirmation email
- [ ] Add a honeypot field and a timing check on all public forms. No third-party captcha unless spam actually appears.
- [ ] Build `not-found.tsx` and `error.tsx` at the root and in each route group

---

## Phase 6: Landing Page

Covers all four services. No laundry or cleaning content on this page at all.

- [ ] Hero: headline, sub-headline, two calls to action (start a project, browse courses), GSAP entrance. Headline names what Bitnox builds, not an abstraction.
- [ ] Services grid: four cards, one per service, each linking to its dedicated page
- [ ] About and who we are, condensed, linking to `/about`
- [ ] Why Bitnox: differentiators, ported and tightened from the current `WhyUs`, rewritten to remove filler
- [ ] **Event Space section**: 60 capacity, teaser gallery pulled from the first images in the gallery collection, call to action to `/event-space`
- [ ] Technology Training band: a distinct, unmissable route to `edu.bitnoxsolution.com` for course seekers
- [ ] Portfolio: server-fetched, statically generated, cached under a `portfolio` tag
- [ ] Testimonials: server-fetched, same caching treatment
- [ ] Latest blog posts: the three most recent published posts
- [ ] FAQ section using the existing `data.ts` FAQs, rewritten to standard, marked up with `FAQPage` JSON-LD
- [ ] Closing call to action and contact band
- [ ] Verify: no laundry or cleaning copy, imagery or links anywhere on this page
- [ ] Copy review pass against the Content and UI Standards in `CLAUDE.md`

---

## Phase 7: Services Information Architecture

- [ ] Define the four services in a typed content module (`src/content/services.ts`): slug, name, summary, hero copy, deliverables, process steps, FAQs, related services, SEO metadata
- [ ] Build the `/services` hub page listing all four with internal links
- [ ] Build the `/services/[slug]` template: hero, the problem and the outcome, what is included, how the engagement runs, relevant portfolio work, service-specific FAQ, call to action
- [ ] Write Software Development: custom software, business management systems, web applications. Cloud infrastructure named here as a capability.
- [ ] Write Web Development: professional websites, e-commerce, portals. Digital marketing named here as a capability.
- [ ] Write IT Consulting: technology advisory, digital transformation, IT strategy. Cybersecurity named here as a capability.
- [ ] Write Technology Training: professional technology and digital skills training, with the course catalogue call to action pointing at `edu.bitnoxsolution.com`
- [ ] Add `Service` and `BreadcrumbList` JSON-LD per page, and unique title and description metadata
- [ ] Cross-link services to each other and to relevant blog posts. Internal linking is a ranking input, not decoration.
- [ ] `generateStaticParams` over the four slugs
- [ ] Copy review pass on all four pages

---

## Phase 8: Event Space

The highest-leverage SEO asset here, and the only page with a physical location to rank on locally.

- [ ] Build `/event-space`. Title targets local booking intent, for example "Event Space in Abeokuta for Conferences, Training and Meetings, 60 Capacity".
- [ ] Dynamic gallery driven by the `EventSpaceImage` collection, any number of images, ordered by `sortOrder`. `next/image`, priority on the cover, lightbox on the rest, descriptive alt text on every image.
- [ ] Capacity and layouts (theatre, classroom, boardroom, U-shape), amenities grid, availability explanation covering non-class days
- [ ] Use cases section: conferences, tech meetups, workshops, seminars, corporate meetings, training sessions, product launches
- [ ] Location block: address, embedded map, directions, parking, nearby landmarks
- [ ] Booking enquiry form: name, email, phone, event type, preferred date, expected attendees, notes. Validated by a shared Zod schema, persisted as an `Enquiry`, acknowledged by email to the sender and notified to the team.
- [ ] Pricing is on request. Publish no rates, no ranges and no "from" figures anywhere on the page. The enquiry form is the pricing mechanism, so it carries the weight that a rate card normally would: make it short, visible above the fold on mobile, and repeated after the gallery.
- [ ] Copy handles the absent price honestly. State that rates depend on date, duration and setup, and that a quote comes back quickly. Do not use "affordable", "competitive" or "budget-friendly" as a substitute for a number.
- [ ] JSON-LD: `EventVenue` and `LocalBusiness` with address, geo coordinates, `maximumAttendeeCapacity: 60`, amenity features and opening hours. Omit `priceRange` and `offers` rather than guessing values, since incorrect price markup is worse than none.
- [ ] `ImageObject` annotations on the gallery so the photographs are eligible for image search
- [ ] H2 headings that capture adjacent search intent (conference hall, meeting room hire, training room) without renaming the space
- [ ] Link here from the landing page section, the nav and the footer
- [ ] Verify the page passes the Rich Results Test
- [ ] Copy review pass

---

## Phase 9: Blog

Starting from an empty collection, so there is no legacy content to accommodate.

- [ ] `/blog` index: paginated, server-rendered, with tag and category filtering
- [ ] `/blog/[slug]`: renders the stored HTML snapshot, shipping zero editor JavaScript to the browser
- [ ] Server-side syntax highlighting for Tiptap code blocks (Shiki), matching the editor's language set
- [ ] `/blog/tag/[tag]` archive pages
- [ ] Reading time, published and updated dates, author byline, share links
- [ ] Related-posts block driven by shared tags
- [ ] `Article` and `BreadcrumbList` JSON-LD, canonical URL, per-post OG and Twitter metadata
- [ ] Dynamic OG image generation via `opengraph-image.tsx` (`next/og`) using the post title and brand
- [ ] `generateStaticParams` over published slugs, `use cache` with `cacheTag('blog')` and a per-slug tag
- [ ] Handle non-published states: 404 for anonymous visitors, previewable by authenticated admins via a preview token
- [ ] Scheduled publishing: a cron route handler that promotes `scheduled` posts whose `scheduledFor` has passed, then revalidates
- [ ] Write three launch posts so the blog does not ship empty

---

## Phase 10: Remaining Public Pages

- [ ] `/about`: ported and rewritten, with `Organization` and `AboutPage` schema
- [ ] `/contact`: contact form (server action to `Enquiry` plus emails), NAP, map, hours
- [ ] `/cleaning`: a short overview page, not a full service page. States that Bitnox offers laundry and cleaning, summarises the offering in a few lines, and hands off to `cleaning.bitnoxsolution.com` as the primary and repeated call to action. No pricing, no quote form, no service detail that competes with the subdomain.
- [ ] `/cleaning` carries `<link rel="canonical">` pointing at `cleaning.bitnoxsolution.com`, so the subdomain accumulates the ranking signal rather than splitting it. Add the canonical only once the subdomain is confirmed live (Phase 0).
- [ ] Keep `/cleaning` in the sitemap and indexable. It exists to route visitors who land on the main domain, and a canonical is sufficient without also removing it from the index.
- [ ] No `Service` or `LocalBusiness` schema on `/cleaning`. That markup belongs on the subdomain, and duplicating it here competes with the page being pointed at.
- [ ] `/portfolio` and `/portfolio/[slug]` project detail pages. Only a landing section exists today, and dedicated pages add indexable URLs.
- [ ] `/terms` and `/privacy`: ported, indexable, with a last-updated date
- [ ] Global 404 page with useful navigation rather than a dead end
- [ ] Copy review pass on all pages in this phase

---

## Phase 11: Admin Dashboard

- [ ] Admin layout: collapsible sidebar, breadcrumb header, current-user menu, mobile drawer, ported from `AdminLayout.css` into Tailwind
- [ ] Dashboard home: content counts, recent posts, recent enquiries, quick actions
- [ ] **Tiptap v3 editor** with headings, bold, italic, underline, strikethrough, lists, blockquote, horizontal rule, link with an edit and unlink bubble, image via signed Cloudinary upload, YouTube embed, table, task list, text align, highlight, subscript and superscript, undo and redo
- [ ] **Code block with language selection**: `CodeBlockLowlight` with an explicit language list (JavaScript, TypeScript, JSX, TSX, Python, Java, PHP, C#, Go, Rust, SQL, HTML, CSS, JSON, YAML, Bash, Dockerfile), a per-block language dropdown and copy to clipboard
- [ ] Editor UX: sticky toolbar, slash command menu, bubble menu on selection, character and word count, autosave draft to localStorage, unsaved-changes guard
- [ ] Blog admin: list with search, filter and pagination, create, edit, duplicate, status transitions across draft, scheduled, published and archived, delete with confirmation, and an SEO panel with a live SERP preview
- [ ] On save, render Tiptap JSON to HTML server-side, store both, then `revalidateTag('blog')` plus the per-slug tag
- [ ] **Event Space admin**: gallery management with upload, drag-to-reorder, alt text, captions, cover selection and delete, plus capacity, amenities and rate copy
- [ ] Portfolio admin: CRUD with multi-image upload and ordering
- [ ] Testimonials admin: CRUD with avatar upload and a featured flag
- [ ] Users admin (super_admin only): invite by email, role assignment, activate and deactivate. No admin ever sets another user's password.
- [ ] Newsletter admin (super_admin only): list, search, unsubscribe, CSV export
- [ ] **Enquiries inbox**: unified list across contact, Event Space and cleaning, filterable by type and status, with new, read and responded states and a detail view
- [ ] Site settings: NAP, social links, sister-site URLs, GTM ID, default OG image, all DB-backed so copy changes do not require a deploy
- [ ] Every admin mutation goes through a server action that calls `requireUser()` or `requireSuperAdmin()` and re-validates with the shared Zod schema

---

## Phase 12: SEO and Analytics Infrastructure

- [ ] Root `metadata` with `metadataBase`, title template, description, OG and Twitter defaults, and `robots` directives
- [ ] Unique, hand-written title and description on every route. No templated filler.
- [ ] `app/sitemap.ts`: static routes, the four service slugs, published blog slugs, portfolio slugs, with real `lastModified` values
- [ ] `app/robots.ts`: allow public routes, disallow `/admin` and `/api`, reference the sitemap
- [ ] Canonical URLs on every page, self-referencing canonicals on paginated routes
- [ ] JSON-LD components in `src/components/seo/`: `Organization`, `WebSite` with `SearchAction`, `LocalBusiness`, `EventVenue`, `Service`, `Article`, `FAQPage`, `BreadcrumbList`
- [ ] Google Tag Manager via `next/script` with `strategy="afterInteractive"`, plus the `<noscript>` iframe in the body
- [ ] Search Console verification via `metadata.verification.google` and the env token
- [ ] A typed `pushDataLayer()` helper wired to form submissions, call-to-action clicks, outbound clicks to `edu.` and `cleaning.`, and Event Space booking submissions
- [ ] Consent-aware GTM loading if you operate in the UK or EU, deferring non-essential tags until consent
- [ ] `opengraph-image.tsx` for the home page, the four services and the Event Space
- [ ] Redirect map in `next.config.ts`. `/blogs` to `/blog`. Old blog slugs to `/blog` and old project URLs to `/portfolio`, since the database is new and none of that content carries over. Pull the live URL list from Search Console rather than guessing.
- [ ] Submit the sitemap in Search Console after launch and confirm indexing of the Event Space and service pages

---

## Phase 13: Performance, Accessibility and QA

- [ ] Audit client and server component boundaries, pushing `"use client"` as far down the tree as possible
- [ ] Verify no editor, GSAP or admin code lands in any public-page bundle, using `@next/bundle-analyzer`
- [ ] All images through `next/image` with explicit sizes, hero images `priority`, everything else lazy
- [ ] Lighthouse at 95 or above on Performance, Accessibility, Best Practices and SEO for the home page, a service page, the Event Space and a blog post
- [ ] Core Web Vitals: LCP under 2.5s, CLS under 0.1, INP under 200ms on a throttled mobile profile
- [ ] Keyboard navigation through nav, forms, editor and admin tables, with visible focus rings throughout
- [ ] Colour contrast check. The cyan-on-dark palette needs verifying against WCAG AA, especially muted `#94a3b8` on `#0a0a0a`.
- [ ] Semantic landmarks, one `h1` per page, descriptive alt text everywhere
- [ ] Test on mobile Safari and Chrome Android, not just a narrow desktop viewport
- [ ] Server-action tests for auth, blog CRUD and the enquiry flows
- [ ] Full manual pass: every form submits, every email arrives, every admin action persists and revalidates
- [ ] Final copy audit across the whole site against the banned-words and banned-characters lists

---

## Phase 14: Deploy and Cutover

- [ ] Deploy `nextjs/` to Vercel as a preview against a staging database
- [ ] Configure all production env vars in Vercel, confirming `NEXT_PUBLIC_SITE_URL` is the canonical apex domain
- [ ] Verify the Mongoose connection pool behaves under serverless cold starts
- [ ] Side-by-side parity review of the preview against the live site: design, animations, forms. Content differs by design, since the database is new.
- [ ] Point the production env at a clean database, run `db:seed` to create the super_admin and settings, then log in and verify
- [ ] Enter launch content through the admin before DNS cutover: portfolio projects, testimonials, Event Space gallery, site settings, and the three blog posts. The site must not go live with empty sections.
- [ ] Point `bitnoxsolution.com` at the Next.js deployment, confirming redirects, sitemap and robots resolve on the live domain
- [ ] Verify GTM fires and Search Console picks up the new sitemap
- [ ] Monitor for 48 hours: error rate, Core Web Vitals field data, Search Console coverage, form deliverability
- [ ] Delete `client/` and `server/`, promote the Next app, and strip the legacy sections from `CLAUDE.md` and `tech-stack.md`
- [ ] Archive `implementation-plan.md` and `rebuild-plan.md`

---

## Known Risks

| Risk | Mitigation |
|---|---|
| `reset-db` pointed at the wrong database | `--confirm` flag plus a database-name allowlist, and the script refuses any name outside it |
| Nobody can log in to a clean database | `db:seed` creates the first super_admin, and Phase 2 ends by verifying that login works |
| Old blog, portfolio and testimonial URLs return 404 and lose their rankings | Redirect map in Phase 12, and launch content entered before DNS cutover in Phase 14 |
| Launching with empty portfolio, testimonial and blog sections | Content entry is an explicit Phase 14 gate, not an afterthought |
| GSAP and React 19 strict mode creating duplicate timelines | All GSAP inside `useGSAP` with `gsap.context()` cleanup |
| Cloudinary API secret not yet available | Phase 5 blocks on it. The unsigned preset is used only in local development, never shipped. |
| Duplicate content between `/cleaning` and `cleaning.bitnoxsolution.com` | `/cleaning` is an overview only, with a canonical pointing at the subdomain and no competing schema |
| Canonical on `/cleaning` pointing at a subdomain that is not live yet | Ship without the canonical, add it once the subdomain is confirmed live |
| No published rates costing enquiries from price-sensitive visitors | Enquiry form placed prominently and repeated, copy sets the expectation of a fast quote |
| Dropping cloud, cybersecurity and marketing as top-level services loses those keywords | Each is named as a capability inside its parent service page, with headings and body copy carrying the terms |
