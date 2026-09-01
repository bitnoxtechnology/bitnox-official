# Bitnox Official: Tech Stack

Libraries, environment and setup for the Next.js 16 application in `nextjs/`.
Conventions live in `CLAUDE.md`. The build sequence lives in `new-implementation-plan.md`.

---

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16+, App Router | Turbopack is the default bundler for dev and build |
| Runtime | React 19 | Server components by default |
| Language | TypeScript, strict | `noUncheckedIndexedAccess` enabled |
| Styling | Tailwind CSS v4 | `@theme` tokens in `globals.css`, no per-component CSS files |
| Components | shadcn/ui on Radix | Every primitive restyled to the brand, not left neutral |
| Icons | Lucide React | |
| Forms | react-hook-form v7 with `@hookform/resolvers` | |
| Validation | Zod v4 | One schema per form, used on client and server |
| Database | MongoDB with Mongoose 8 | New, empty database. No migration from the legacy app. |
| Auth | Custom: argon2 password plus Resend OTP | httpOnly signed cookie session, no auth library |
| Editor | Tiptap v3 | With `CodeBlockLowlight` for multi-language code blocks |
| Code highlighting | lowlight in the editor, Shiki on the public page | Public rendering is server-side |
| Email | Resend with React Email | |
| Uploads | Cloudinary, signed server-side | |
| Scroll animation | GSAP 3 with ScrollTrigger and `useGSAP` | |
| UI animation | Motion (formerly Framer Motion) | |
| Toasts | Sonner | |
| Analytics | Google Tag Manager via `next/script` | |
| Hosting | Vercel | |

**Dropped from the legacy stack.** Express 5, React Router, Axios, jsonwebtoken, Helmet, CORS,
`get-browser-fingerprint`, react-helmet, MDX editor, react-markdown, rehype-highlight. Next.js
covers routing, metadata, security headers and data fetching, so the equivalents are removed rather
than ported.

---

## Environment Variables

Single `.env` at `nextjs/.env`. Validated at boot by `src/lib/env.ts` with Zod, so a missing or
malformed variable fails the build rather than surfacing at runtime.

| Variable | Scope | Purpose |
|---|---|---|
| `MONGO_URI` | server | MongoDB connection string. Separate databases for development and production. |
| `SESSION_SECRET` | server | Signs the session cookie |
| `RESEND_API_KEY` | server | Transactional email |
| `CLOUDINARY_API_KEY` | server | Upload signing |
| `CLOUDINARY_API_SECRET` | server | Upload signing |
| `CLOUDINARY_UPLOAD_PRESET` | server | Upload target |
| `GOOGLE_SITE_VERIFICATION` | server | Search Console token |
| `CRON_SECRET` | server | Authorises the scheduled-publish route handler |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | public | Image delivery URLs |
| `NEXT_PUBLIC_SITE_URL` | public | `metadataBase`, canonicals, sitemap |
| `NEXT_PUBLIC_EDU_URL` | public | `https://edu.bitnoxsolution.com` |
| `NEXT_PUBLIC_CLEANING_URL` | public | `https://cleaning.bitnoxsolution.com` |
| `NEXT_PUBLIC_GTM_ID` | public | Tag Manager container |

Anything prefixed `NEXT_PUBLIC_` ships to the browser. The Cloudinary API key and secret are
server-only, which is the change that makes signed uploads possible.

---

## Environment Mapping From the Legacy Apps

This maps configuration only. No data is migrated, and the database starts empty.

| Legacy | New |
|---|---|
| `client/VITE_APP_API_URL` | dropped, same-origin server actions and route handlers |
| `client/VITE_CLOUDINARY_CLOUD_NAME` | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |
| `client/VITE_CLOUDINARY_API_KEY` | `CLOUDINARY_API_KEY`, now server-only |
| `client/VITE_CLOUDINARY_UPLOAD_PRESET` | `CLOUDINARY_UPLOAD_PRESET` plus new `CLOUDINARY_API_SECRET` |
| `client/VITE_GTM_ID` | `NEXT_PUBLIC_GTM_ID` |
| `server/MONGO_URI` | `MONGO_URI`, pointing at a **new, empty** database rather than the legacy one |
| `server/RESEND_API_KEY` | `RESEND_API_KEY`, value unchanged |
| `server/JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_*_EXPIRES_IN` | replaced by `SESSION_SECRET` |
| `server/CLIENT_ORIGIN`, `PORT`, `HOST`, `API_BASE_PATH`, `NODE_ENV` | dropped, single origin |
| `server/REDIS_*` | dropped, unused |

---

## How to Run

```bash
cd nextjs
cp .env.example .env    # fill in the values above
npm install
npm run dev             # http://localhost:3000
```

No proxy configuration and no second process. The API and the site are one application on one
origin, which is the main operational difference from the legacy setup.

**Scripts.**

| Command | Does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint directly, since `next lint` was removed in Next 16 |
| `npm run db:reset -- --confirm` | Drops every collection. Guarded by a database-name allowlist. |
| `npm run db:seed` | Creates the first super_admin and the SiteSettings singleton |
| `npm run db:fresh` | Reset then seed, for development only |

---

## Notable Next.js 16 Details

Things that differ from Next 14 and 15 and will otherwise cost time:

- **`next lint` is gone.** ESLint is wired directly in `package.json`.
- **`middleware.ts` is now `proxy.ts`.** Route protection lives there.
- **`params` and `searchParams` are promises.** They must be awaited in every page and layout.
- **Cache Components.** `cacheComponents: true` in `next.config.ts` enables `use cache`, `cacheTag`
  and `cacheLife`. This is what makes tag-based revalidation on publish work.
- **Turbopack is the default** for both dev and build.

---

## Legacy Applications

`client/` (Vite, React 19, React Router 7) and `server/` (Express 5, Mongoose 8, JWT) remain in the
repository as reference until cutover, then both are deleted. Their dependency trees are not
maintained and no new work belongs in either. Consult them for existing GSAP timelines, UI detail
and business logic only.
