# Bitnox Technology Solutions — Project Memory

## Project Overview

Bitnox Technology Solutions is a full-stack monorepo website for a UK/Nigeria-based tech company offering web development, cloud infrastructure, cybersecurity, digital marketing, tech training, cleaning services, and more. The live domain is `bitnoxsolution.com`. The admin panel allows the team to manage blog posts, portfolio projects, and client testimonials.

## Repository Structure

```
bitnox-official/
├── client/          # Frontend — Vite + React 19 + TypeScript
├── server/          # Backend — Express 5 + MongoDB + TypeScript
├── CLAUDE.md        # This file
└── implementation-plan.md
```

## Tech Stack

### Client (`client/`)
- **Framework**: React 19, Vite 7, TypeScript
- **Routing**: React Router v7
- **HTTP**: Axios (with Bearer token interceptor in `lib/services/axios-client.ts`)
- **Forms**: react-hook-form v7 + Zod v4 + @hookform/resolvers
- **Styling**: Tailwind CSS 4 + per-component CSS files in `src/styles/`
- **Animations**: GSAP 3 (ScrollTrigger), Framer Motion
- **Image uploads**: Cloudinary (client-side, upload preset in `.env`)
- **Notifications**: Sonner (toasts)
- **Icons**: Lucide React
- **SEO**: react-helmet (per-page meta via `Meta` component)
- **Analytics**: Google Tag Manager via `GoogleTagManager` component (set `VITE_GTM_ID`)

### Server (`server/`)
- **Framework**: Express 5
- **Database**: MongoDB + Mongoose 8
- **Auth**: JWT (jsonwebtoken) — access + refresh token pair
- **Email**: Resend API
- **Validation**: Zod v4
- **Security**: Helmet, CORS

## How to Run

### Server
```bash
cd server
cp .env.example .env   # fill in MONGO_URI, JWT secrets, RESEND_API_KEY
npm run dev            # starts on port 4000
```

Required server env vars: `PORT`, `HOST`, `API_BASE_PATH`, `CLIENT_ORIGIN`, `NODE_ENV`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `RESEND_API_KEY`, `MONGO_URI`

### Client
```bash
cd client
cp .env.example .env   # fill in VITE_CLOUDINARY_* vars; add VITE_GTM_ID for analytics
npm run dev            # starts on port 5173
```

Required client env vars: `VITE_APP_API_URL` (set to `/api/v1`), `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_API_KEY`, `VITE_CLOUDINARY_UPLOAD_PRESET`

The Vite dev server proxies `/api` to `http://localhost:4000` — no CORS issues in development.

## Auth System

- **Login flow**: Email only → OTP via Resend email → JWT issued
- **Tokens**: Access token (1d) stored in-memory (`lib/token.ts`); refresh token stored in MongoDB session; session ID in `localStorage`
- **Silent refresh**: `AuthProvider` attempts refresh on app mount using `session_id` + device fingerprint headers
- **Device fingerprint**: `get-browser-fingerprint` library — mismatched fingerprint invalidates session
- **Protection**: `<ProtectedRoutes>` wraps all `/admin/*` routes; redirects to `/auth/login` if no user

## API Patterns (Server)

All routes under `/api/v1/`. Pattern is:
1. **Model** in `src/database/models/*.model.ts`
2. **Validation** in `src/lib/validation/*.validation.ts` (Zod schemas)
3. **Service** in `src/modules/<domain>/<domain>.service.ts` (business logic)
4. **Controller** in `src/modules/<domain>/<domain>.controller.ts` (request/response, calls service)
5. **Route** in `src/modules/<domain>/<domain>.route.ts` (registered in `src/index.ts`)

`asyncHandler` wraps all controllers. Errors thrown as `AppError` subclasses (`NotFoundException`, `BadRequestException`, `UnauthorizedException`) are caught by `errorHandler` middleware.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | No | Create account + send OTP |
| POST | `/auth/login` | No | Send OTP to existing email |
| POST | `/auth/verify-login-otp` | No | Verify OTP, get tokens |
| POST | `/auth/resend-login-otp` | No | Resend OTP |
| POST | `/auth/refresh-token` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Invalidate session |
| GET | `/auth/me` | Yes | Get current user profile |
| GET | `/blog` | No | List blogs (paginated, searchable) |
| GET | `/blog/:slug` | No | Get blog by slug |
| POST | `/blog` | Yes | Create blog |
| PATCH | `/blog/:blogId` | Yes | Update blog |
| DELETE | `/blog/:blogId` | Yes | Delete blog |
| GET | `/portfolio` | No | List projects |
| GET | `/portfolio/:projectId` | No | Get project by ID |
| POST | `/portfolio` | Yes | Create project |
| PATCH | `/portfolio/:projectId` | Yes | Update project |
| DELETE | `/portfolio/:projectId` | Yes | Delete project |
| GET | `/testimonial` | No | List testimonials |
| GET | `/testimonial/:testimonialId` | No | Get testimonial by ID |
| POST | `/testimonial` | Yes | Create testimonial |
| PATCH | `/testimonial/:testimonialId` | Yes | Update testimonial |
| DELETE | `/testimonial/:testimonialId` | Yes | Delete testimonial |
| POST | `/email/contact-us` | No | Send contact form email |

## Client Folder Structure

```
src/
├── @Types/type.d.ts        # Global TS types (UserType, IBlog, IProject, ITestimonial)
├── assets/                  # Images, SVGs, logos
├── components/
│   ├── ui/                  # Button, Input, Field, ImageUpload, Skeleton, Spinner, Switch, Textarea
│   ├── skeleton/            # BlogCardSkeleton, PortfolioCardSkeleton, TestimonialSkeleton
│   ├── editor/              # MDX editor for blog content
│   ├── forms/               # LoginForm, SignupForm, AuthOTPForm, ContactForm
│   ├── Meta.tsx             # react-helmet SEO wrapper
│   ├── GoogleTagManager.tsx # GTM script injector
│   ├── Portfolio.tsx        # Landing page portfolio section (API-driven)
│   └── Testimonial.tsx      # Landing page testimonials (API-driven)
├── context/AuthContext.ts   # Context type
├── context/AuthProvider.tsx # Auth state + silent refresh logic
├── hooks/use-auth.tsx       # useAuth hook
├── layout/
│   ├── AdminLayout.tsx      # Sidebar layout for all admin pages
│   ├── AuthLayout.tsx       # Layout for auth pages
│   └── PublicLayout.tsx     # Navbar + Outlet + Footer
├── lib/
│   ├── services/            # axios-client, auth-service, blog-service, portfolio-service, testimonial-service
│   ├── validations/         # Zod schemas: blog, portfolio, testimonial, auth, contact
│   ├── token.ts             # In-memory token storage
│   └── data.ts              # Remaining static data (FAQs, message templates)
├── pages/
│   ├── admin/
│   │   ├── Dashboard.tsx    # Stats + recent blogs + quick actions
│   │   ├── ManageBlog.tsx   # Blog CRUD
│   │   ├── ManagePortfolio.tsx  # Portfolio CRUD
│   │   ├── ManageTestimonials.tsx # Testimonials CRUD
│   │   └── components/      # Create/Update forms for each domain
│   └── auth/Login.tsx, Signup.tsx
├── protected/
│   ├── ProtectedRoutes.tsx  # Renders AdminLayout if authenticated
│   └── AuthRoutes.tsx       # Redirects to /admin if already logged in
└── styles/                  # Per-component CSS files
```

## Naming Conventions

- **Server**: `*.model.ts`, `*.service.ts`, `*.controller.ts`, `*.route.ts` — always in `modules/<domain>/`
- **Client services**: `<domain>-service.ts` in `lib/services/`
- **Client validators**: `<domain>-validator.ts` in `lib/validations/`
- **Admin pages**: `Manage<Domain>.tsx` in `pages/admin/`
- **Admin forms**: `Create<Domain>Form.tsx`, `Update<Domain>Form.tsx` in `pages/admin/components/`
- **Skeletons**: `<Domain>CardSkeleton.tsx` or `<Domain>Skeleton.tsx` in `components/skeleton/`
- **CSS**: one file per component section in `styles/`, named after the component

## Key Architectural Decisions

1. **Client-side Cloudinary upload** — No multer on server. `ImageUpload` component uploads directly to Cloudinary using the upload preset configured in env. Image URLs (strings) are saved to MongoDB.
2. **In-memory token storage** — Access token lives in `lib/token.ts` (a module-level variable), not `localStorage`. This reduces XSS attack surface.
3. **OTP-only auth** — No passwords. Email + Resend OTP flow only.
4. **SPA on Vercel** — Client deployed as static SPA (`client/vercel.json` handles SPA fallback). Server deployed as Vercel serverless function (Express app exported as default).
5. **CSS hybrid** — Tailwind utility classes in JSX for layout/spacing; brand-specific styles (glassmorphic cards, cyan accents, dark backgrounds) in separate `.css` files.
6. **Zod v4** — Client validators use `z.url()` (not `z.string().url()`). Server validators use `z.string().url()` (both valid in v4).

## Brand Identity

- Background: `#0a0a0a`
- Accent / Primary: `#05e4fc` (cyan)
- Glassmorphic cards: `background: rgba(0,45,67,0.3)`, `border: 1px solid rgba(5,228,252,0.15)`, `backdrop-filter: blur(12px)`
- Muted text: `#94a3b8`
- Card text: `#d4e4f0`
