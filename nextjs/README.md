# Bitnox Technology Solutions

The bitnoxsolution.com website and admin dashboard. Next.js 16 App Router, React 19, TypeScript,
Tailwind v4, MongoDB with Mongoose.

The site and the API are one application on one origin. There is no second process and no proxy
configuration, which is the main operational difference from the legacy `client/` and `server/`
apps kept at the repository root for reference.

## Documentation

Three files at the repository root, each owning one thing:

| File                         | Owns                                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                  | Conventions: the four services, the Event Space naming rule, NAP, route map, architecture, folder structure, content and UI standards, brand |
| `tech-stack.md`              | Stack, dependencies, environment variables, scripts                                                                                          |
| `new-implementation-plan.md` | The phased build sequence                                                                                                                    |

Copy rules are also restated in `src/content/copy-standards.md`, next to the content they govern.

## Running the app

```bash
cd nextjs
cp .env.example .env    # then fill in every value
npm install
npm run dev             # http://localhost:3000
```

`src/lib/env.ts` validates the environment with Zod at boot. A missing or malformed variable fails
the build with a named error rather than surfacing as `undefined` at runtime, so fill in `.env`
before the first run. `SESSION_SECRET` needs at least 32 characters:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Scripts

| Command                         | Does                                                                     |
| ------------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`                   | Dev server on port 3000                                                  |
| `npm run build`                 | Production build                                                         |
| `npm run start`                 | Serve the production build                                               |
| `npm run lint`                  | ESLint. `next lint` was removed in Next 16, so ESLint is wired directly. |
| `npm run lint:fix`              | ESLint with `--fix`                                                      |
| `npm run format`                | Prettier over the repository                                             |
| `npm run format:check`          | Prettier in check mode, for CI                                           |
| `npm run typecheck`             | `tsc --noEmit`                                                           |
| `npm run db:reset -- --confirm` | Drops every collection. Guarded by a database-name allowlist.            |
| `npm run db:seed`               | Creates the first super_admin and the SiteSettings singleton             |
| `npm run db:fresh`              | Reset then seed. Development only.                                       |
| `npm run test:auth`             | The auth integration tests. See below.                                   |

## Signing in

A clean database has no accounts. `npm run db:seed -- --email you@bitnoxsolution.com` creates the
first super_admin and prints a generated password once. Every account after that is created by
invitation from `/admin/users/invite`, where the invitee sets their own password from an emailed
link.

Sign-in is two steps: the password, then a six-digit code emailed by Resend. With no working
`RESEND_API_KEY` the send fails and, in development only, the code is printed to the server console
so the admin is still reachable.

## Tests

`npm run test:auth` exercises the auth flows against a real database: expired codes, the
five-attempt lockout, deactivated accounts, session expiry and spent one-time links. It runs
against `TEST_MONGO_URI`, or `MONGO_URI` with the database name replaced by
`bitnox-official-test`, and refuses to run anywhere else. Every document it creates is removed
afterwards.

## Layout

```
src/
├── app/
│   ├── (public)/            # Public route group, PublicLayout chrome
│   ├── admin/               # Guarded, own layout, noindex
│   ├── api/                 # Route handlers only where HTTP is required
│   ├── layout.tsx
│   └── globals.css          # Tailwind v4 @theme tokens, the only stylesheet
├── components/
│   ├── ui/                  # shadcn primitives, restyled to brand
│   ├── motion/              # Reveal, StaggerGroup, Parallax over GSAP
│   ├── seo/                 # JSON-LD components
│   ├── forms/
│   ├── editor/              # Tiptap, admin only
│   └── skeleton/
├── content/                 # Typed content modules and copy standards
├── lib/
│   ├── env.ts               # Zod-validated process.env
│   ├── utils.ts             # cn()
│   ├── auth/                # password, session, guards
│   ├── actions/             # Server actions by domain
│   ├── validations/         # Shared Zod schemas
│   └── mail/                # Resend client and React Email templates
├── models/                  # Mongoose models
└── scripts/                 # db:reset and db:seed
```

## Conventions worth knowing before the first commit

- **Server first.** `"use client"` sits on the leaf that needs interactivity, not the page.
- **Mutations are server actions.** Route handlers exist only where HTTP is required: the
  Cloudinary signature endpoint, the scheduled-publish cron, webhooks.
- **Every server action calls `requireUser()` or `requireSuperAdmin()`** before touching data.
  `proxy.ts` is defence in depth, not the authorisation boundary.
- **One Zod schema per form, two consumers.** The react-hook-form resolver on the client and the
  server action on the server read the same schema in `src/lib/validations/`.
- **Static by default, invalidated by tag.** `cacheComponents` is enabled, so public pages use
  `use cache` with `cacheTag()`. Admin mutations call `revalidateTag()`. No time-based
  revalidation.
- **Mongoose documents never cross the server and client boundary.** Serialize through
  `src/lib/dto.ts` first.

## Next.js 16 details that differ from earlier versions

- `next lint` is gone. ESLint runs directly from `package.json`.
- `middleware.ts` is now `proxy.ts`.
- `params` and `searchParams` are promises and must be awaited.
- `cacheComponents: true` replaces `experimental.ppr`, `experimental.useCache` and
  `experimental.dynamicIO`.
- Turbopack is the default bundler for both dev and build.
