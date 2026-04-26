# Bitnox Admin Revamp — Implementation Plan

Track implementation progress here. Check off items as they are completed.

---

## Phase 1 — Server: New Models, Modules, Auth Addition ✅ COMPLETE

### New Models
- [x] `server/src/database/models/project.model.ts`
- [x] `server/src/database/models/testimonial.model.ts`

### Zod Validation (Server)
- [x] `server/src/lib/validation/portfolio.validation.ts`
- [x] `server/src/lib/validation/testimonial.validation.ts`

### Portfolio Module
- [x] `server/src/modules/portfolio/portfolio.service.ts`
- [x] `server/src/modules/portfolio/portfolio.controller.ts`
- [x] `server/src/modules/portfolio/portfolio.route.ts`

### Testimonial Module
- [x] `server/src/modules/testimonial/testimonial.service.ts`
- [x] `server/src/modules/testimonial/testimonial.controller.ts`
- [x] `server/src/modules/testimonial/testimonial.route.ts`

### Auth Addition
- [x] `server/src/modules/auth/auth.service.ts` — added `getMe(userId)`
- [x] `server/src/modules/auth/auth.controller.ts` — added `getMe` handler
- [x] `server/src/modules/auth/auth.route.ts` — added `GET /me`

### Route Registration
- [x] `server/src/index.ts` — registered `/portfolio` and `/testimonial` routers

---

## Phase 2 — Client: Services, Validators, Skeleton Components ✅ COMPLETE

### Global Types
- [x] `client/src/@Types/type.d.ts` — added `IProject`, `ITestimonial` interfaces

### Validators
- [x] `client/src/lib/validations/portfolio-validator.ts`
- [x] `client/src/lib/validations/testimonial-validator.ts`

### Services
- [x] `client/src/lib/services/portfolio-service.ts`
- [x] `client/src/lib/services/testimonial-service.ts`

### Skeleton Components
- [x] `client/src/components/skeleton/PortfolioCardSkeleton.tsx`
- [x] `client/src/components/skeleton/TestimonialSkeleton.tsx`

---

## Phase 3 — Client: Landing Page Components (API Integration) ✅ COMPLETE

- [x] `client/src/components/Portfolio.tsx` — replaced static array with API fetch + loading skeletons + GSAP refactor
- [x] `client/src/components/Testimonial.tsx` — replaced static data with API fetch + loading skeletons

---

## Phase 4 — Client: Admin Dashboard UI Revamp ✅ COMPLETE

### Layout & Routing
- [x] `client/src/layout/AdminLayout.tsx` — sidebar with brand identity, mobile-responsive
- [x] `client/src/styles/AdminLayout.css` — brand-consistent sidebar/nav styles
- [x] `client/src/protected/ProtectedRoutes.tsx` — now uses `AdminLayout`, improved loading state
- [x] `client/src/App.tsx` — added `/admin`, `/admin/manage-portfolio`, `/admin/manage-testimonials` routes
- [x] `client/src/pages/auth/Login.tsx` — fixed post-login redirect to `/admin` (was `/admin/manage-blog`)

### Dashboard
- [x] `client/src/pages/admin/Dashboard.tsx` — stats cards + recent blogs + quick actions
- [x] `client/src/styles/Dashboard.css` — glassmorphic stat cards, responsive grid

### Portfolio Management
- [x] `client/src/pages/admin/ManagePortfolio.tsx` — Create/Update/Delete tabs with search
- [x] `client/src/pages/admin/components/CreatePortfolioForm.tsx`
- [x] `client/src/pages/admin/components/UpdatePortfolioForm.tsx`

### Testimonials Management
- [x] `client/src/pages/admin/ManageTestimonials.tsx` — Create/Update/Delete tabs
- [x] `client/src/pages/admin/components/CreateTestimonialForm.tsx`
- [x] `client/src/pages/admin/components/UpdateTestimonialForm.tsx`

---

## Phase 5 — SEO and Analytics ✅ COMPLETE

- [x] `client/src/components/Meta.tsx` — added OG tags, Twitter Card tags, JSON-LD support
- [x] `client/src/components/GoogleTagManager.tsx` — GTM script injector (reads `VITE_GTM_ID`)
- [x] `client/src/pages/LandingPage.tsx` — added Organization JSON-LD schema
- [x] `client/index.html` — fixed favicon path, added OG/Twitter meta tags, canonical link
- [x] `client/public/robots.txt` — disallows `/admin/` and `/auth/`
- [x] `client/public/sitemap.xml` — all static pages listed with priorities
- [x] `client/.env.example` — added `VITE_GTM_ID`

---

## Phase 6 — Documentation ✅ COMPLETE

- [x] `CLAUDE.md` — comprehensive project memory (stack, auth, API, conventions, decisions)
- [x] `implementation-plan.md` — this file

---

## Post-Implementation Notes

### Things to do after deployment
1. **Set `VITE_GTM_ID`** in production env vars (e.g., Vercel dashboard) once you have a GTM container
2. **Add favicon** — copy your logo PNG/ICO to `client/public/favicon.ico`
3. **Add OG image** — create a 1200×630px brand image and deploy it to `https://bitnoxsolution.com/og-image.png`
4. **Dynamic sitemap** — for `/blog/:slug` URLs to appear in sitemap, implement a server endpoint `GET /sitemap.xml` that queries all published blog slugs from MongoDB
5. **Seed portfolio projects** — use the admin panel (`/admin/manage-portfolio`) to re-add the 8 existing projects that were previously hardcoded (with Cloudinary-hosted images)
6. **Seed testimonials** — use the admin panel (`/admin/manage-testimonials`) to re-add the 4 existing testimonials from `lib/data.ts`
7. **Verify TypeScript** — run `cd server && npx tsc --noEmit` and `cd client && npx tsc --noEmit` to catch any type errors before deploying

### Architecture decisions preserved
- No server-side file uploads (Cloudinary handles this client-side)
- In-memory token storage (XSS-safe)
- CSS-per-component pattern maintained alongside Tailwind
- All admin CRUD follows the existing tab-based pattern from ManageBlog
