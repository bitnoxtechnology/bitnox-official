export const seedBlogs = [
  {
    title: "Building a Real-World Booking System with Next.js and GraphQL",
    slug: "building-a-real-world-booking-system-with-nextjs-and-graphql",
    excerpt:
      "A detailed case study on how we designed and built a full-stack booking platform for Clean Axis, a multi-city UK cleaning business — covering architecture, real-time availability, and the admin dashboard.",
    contentHtml: `<h2>The Problem</h2>
<p>Clean Axis had a growing cleaning business across Coventry, Birmingham, Solihull, Warwick, and several other UK cities — but their booking process was entirely manual. Customers called or messaged on WhatsApp, staff manually checked diaries, and confirmations were sent one by one. Every booking took 10–15 minutes of back-and-forth that neither party enjoyed.</p>
<p>They came to us with a clear brief: build a self-service booking system where customers can select a service, pick a date and time, enter their address, and receive instant confirmation — all without any manual intervention from the Clean Axis team.</p>

<h2>Choosing the Right Stack</h2>
<p>We chose <strong>Next.js</strong> as the primary framework for three reasons. First, Clean Axis's business depends on local search. Server-side rendering gives full control over structured data, canonical URLs, and Open Graph tags — critical for ranking on "end of tenancy cleaning Coventry" and similar high-intent queries. Second, the built-in <code>next/image</code> component handled their library of before-and-after photos with automatic WebP conversion, responsive sizing, and lazy loading. Third, Next.js API routes kept the entire application in a single deployable unit on Vercel, which simplified the infrastructure enormously.</p>
<p>For the data layer, we chose <strong>GraphQL</strong>. The booking domain has several interconnected entities: services, availability slots, bookings, customers, and staff. Each view in the application — the booking wizard, the admin calendar, the customer history page — needed a very different subset of that data. GraphQL let the frontend declare exactly what it needed per request, eliminating over-fetching and keeping the network payloads tight.</p>

<h2>Designing the Booking Wizard</h2>
<p>We broke the booking flow into a five-step wizard with a persistent progress bar:</p>
<ol>
  <li><strong>Service Selection</strong> — end of tenancy, deep clean, after-builders, carpet cleaning, commercial, or jet washing, each with a brief description and indicative price range.</li>
  <li><strong>Property Details</strong> — full address with postcode validation, property type (flat, house, commercial), and the number of bedrooms and bathrooms to calculate the service duration.</li>
  <li><strong>Date and Time</strong> — a calendar component showing real-time available slots, greyed-out dates indicating no availability.</li>
  <li><strong>Contact Information</strong> — name, email address, and phone number, with inline validation as the user types.</li>
  <li><strong>Review and Confirm</strong> — a full summary of the booking with the estimated price before the customer commits.</li>
</ol>
<p>Each step was a self-contained React component. The wizard state — all data collected across steps — lived in the parent page component and was also persisted to <code>sessionStorage</code> so progress survived an accidental page refresh. Validation used <code>react-hook-form</code> paired with Zod schemas, giving us type-safe, per-field errors that appeared inline rather than on submit.</p>

<h2>Real-Time Availability</h2>
<p>The availability calendar was the most technically demanding part of the project. Staff members work across different postcode areas with variable weekly schedules. The slot generation algorithm pulled each staff member's contracted hours, identified which bookings were already scheduled for a given day, factored in approximate travel time between consecutive jobs based on postcode proximity, and marked any time slot as unavailable once every eligible staff member in that area was booked.</p>
<p>We implemented availability as a GraphQL query with a 30-second polling interval rather than WebSocket subscriptions. Polling was significantly simpler to deploy and test, and for a booking system receiving a few dozen daily bookings it was more than sufficient to prevent double-bookings while keeping the infrastructure lean.</p>

<h2>The Admin Dashboard</h2>
<p>The back-office side gave the Clean Axis team a weekly calendar view of all confirmed bookings, drag-and-drop rescheduling between staff members, booking status management (confirmed, in-progress, completed, cancelled), and a customer history view showing all previous visits per address. Automated email reminders were dispatched 24 hours before each appointment via a scheduled serverless function that polled for upcoming bookings once per hour.</p>

<h2>What We Learned</h2>
<p>The most important lesson from this project was the value of validating the availability logic with the client before writing a line of implementation code. The business rules around travel time and multi-area staff were more nuanced than the initial brief suggested, and an hour of whiteboarding saved what would have been days of rework. For any project with non-obvious domain logic, we now treat a documented business-rules session as a mandatory step in the discovery phase.</p>

<blockquote>
  <p>"Bitnox technology did a great job by developing a booking system for my cleaning business." — Ayo Adeleke, Founder, Clean Axis Ltd</p>
</blockquote>`,
    tags: ["nextjs", "graphql", "case study", "booking system"],
    isPublished: true,
    publishedAt: new Date("2025-11-15"),
  },
  {
    title: "Why We Default to Next.js for Every Client Website We Build",
    slug: "why-we-default-to-nextjs-for-every-client-website-we-build",
    excerpt:
      "After delivering over a dozen production websites, our default framework is Next.js. Here is the honest reasoning — covering SEO, performance, deployment, the developer experience, and the cases where we choose something else.",
    contentHtml: `<h2>A Framework Choice Rooted in Client Outcomes</h2>
<p>When a new client comes to us for a marketing website, a company portfolio, or a content-driven web application, we almost always reach for Next.js. This is not brand loyalty or habit — it comes from repeatedly delivering projects where Next.js hit the right balance of developer productivity, runtime performance, and long-term maintainability for the kinds of businesses we work with.</p>
<p>The typical Bitnox client is a business that depends on their website to generate enquiries or bookings. For them, a website that ranks well on Google, loads in under two seconds on a mobile connection, and looks professional on any device is not a nice-to-have — it is the whole point. Next.js is the framework that makes those outcomes easiest to achieve without accepting technical debt in exchange.</p>

<h2>SEO Performance That Matters for Real Businesses</h2>
<p>The majority of our clients — cleaning companies, property firms, training platforms, community organisations — depend on organic search for their new customer acquisition. A plain React SPA rendered entirely in the browser sends Google an empty HTML shell and waits for JavaScript to execute before content appears. That execution is not always reliable, and even when it succeeds, the delay affects Core Web Vitals scores that Google uses as a ranking signal.</p>
<p>Next.js renders full HTML on the server for every page. Search engine crawlers receive complete content immediately, without JavaScript execution. Beyond the HTML itself, Next.js makes per-page SEO configuration straightforward: the <code>metadata</code> API in the App Router lets us set titles, descriptions, Open Graph images, canonical URLs, and structured data from a single export per page. For local businesses competing on high-intent queries, this level of control is essential.</p>

<h2>Performance Out of the Box</h2>
<p>Next.js ships with several performance optimisations that would take weeks to implement correctly from scratch in a plain React application:</p>
<ul>
  <li><strong>Automatic code splitting</strong> — only the JavaScript for the current route is sent to the browser. A user on the homepage does not download the code for the contact page.</li>
  <li><strong>Image optimisation</strong> — the <code>next/image</code> component converts images to WebP automatically, generates responsive srcsets, enforces explicit dimensions to prevent layout shift, and lazy loads images below the fold.</li>
  <li><strong>Font optimisation</strong> — <code>next/font</code> downloads Google Fonts at build time and inlines the CSS, eliminating the network request and the associated layout shift that external font stylesheets cause.</li>
  <li><strong>Static generation for cacheable pages</strong> — pages that don't require real-time data are pre-rendered at build time and served from a CDN edge node, achieving sub-100ms Time to First Byte globally.</li>
</ul>

<h2>Deployment Is Simple and Reliable</h2>
<p>Vercel — the company behind Next.js — provides a deployment platform purpose-built for it. Every push to a GitHub branch gets an isolated preview URL within two minutes. Production deployments are atomic and instantly reversible. Serverless API routes scale to handle traffic spikes automatically without any infrastructure configuration. We have never had to provision a server, configure a load balancer, or write a deployment pipeline for a Next.js project on Vercel.</p>
<p>For clients who prefer to self-host or use AWS, Next.js exports as a standard Node.js server or as fully static HTML, so there is no platform lock-in. The deployment story is flexible without sacrificing the developer experience in the default case.</p>

<h2>When We Choose Something Different</h2>
<p>Next.js is the right default, not the right answer for every project. For a heavily interactive internal tool — an analytics dashboard, a data management interface, a complex workflow application — the overhead of server rendering adds complexity without delivering SEO or performance benefits, since those pages are gated behind authentication and never indexed. For those projects we use plain Vite with React, which has a simpler mental model and a faster development loop for purely client-side applications.</p>
<p>For documentation-heavy or content-heavy sites where every page is static and the authoring workflow matters as much as the rendering, we sometimes reach for Astro. For projects where the client team will maintain the code themselves and has existing Vue or Angular expertise, we respect that context rather than imposing our preference. The framework should serve the project, not the other way around.</p>`,
    tags: ["nextjs", "react", "seo", "web development", "performance"],
    isPublished: true,
    publishedAt: new Date("2025-12-03"),
  },
  {
    title: "TypeScript in Production: Three Years of Lessons Learned",
    slug: "typescript-in-production-three-years-of-lessons-learned",
    excerpt:
      "TypeScript has been our standard across every project for three years. These are the practical takeaways — what works, what to avoid, and how we structure types in a full-stack monorepo with shared interfaces between the frontend and backend.",
    contentHtml: `<h2>Why We Made the Switch</h2>
<p>We adopted TypeScript as the standard for all new projects in 2022. The trigger was a production bug: a property name had been spelled slightly differently in the API response handler compared to how it was used in the component that rendered it. The result was a silent undefined that only appeared in production under a specific data condition. The fix took five minutes once we understood it; finding it took three hours.</p>
<p>After migrating that codebase to TypeScript and watching the same class of bug — mismatched property names, functions called with the wrong argument shape, null values not being handled — disappear entirely, the case was made. We have written TypeScript for every project since, across both the Node.js backend and the React frontend.</p>

<h2>Structuring Types Across a Monorepo</h2>
<p>Our standard project layout has a <code>client/</code> directory and a <code>server/</code> directory sharing a repository. Shared types — API response shapes, entity interfaces, enum values that both sides reference — require a deliberate strategy to avoid duplication.</p>
<p>We keep the authoritative type definitions close to where the data is owned. The server owns the database model interfaces. The client defines its own lightweight versions in a central types file, mirroring only the fields the frontend actually renders or sends. We intentionally avoid sharing Mongoose model types with the client — the frontend should not depend on the server's ORM types. Instead, the client's interfaces are simple TypeScript records that match the JSON shape the API returns.</p>
<p>This approach means there is some duplication, but it makes each side independently refactorable. When the server adds a new field to a model, the client does not break until it deliberately imports and uses that field.</p>

<h2>Patterns That Have Proven Their Value</h2>
<p><strong>Zod for runtime validation:</strong> TypeScript types exist only at compile time and are erased at runtime. The moment data enters your application from the outside world — an HTTP request body, a form submission, a value from localStorage — you are back in untyped territory. Zod schemas validate the shape of that data at runtime and infer the corresponding TypeScript type, keeping validation and typing in sync without duplication.</p>
<pre><code>import { z } from "zod";

const CreateBlogSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  contentHtml: z.string().min(1),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
});

type CreateBlogInput = z.infer&lt;typeof CreateBlogSchema&gt;;
</code></pre>
<p><strong>Discriminated unions for async state:</strong> Instead of three separate booleans (<code>isLoading</code>, <code>isError</code>, <code>isSuccess</code>), a discriminated union forces you to handle all three states explicitly and prevents impossible state combinations like <code>isLoading: true</code> and <code>isError: true</code> simultaneously.</p>
<pre><code>type AsyncState&lt;T&gt; =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };
</code></pre>

<h2>Common Mistakes to Avoid</h2>
<p>The most damaging TypeScript anti-pattern is using <code>as</code> to cast a value to a type it does not actually conform to. This silences the type checker without fixing the underlying problem, and the resulting bug at runtime is harder to trace than if TypeScript had caught it at compile time. If you find yourself writing <code>as SomeType</code> frequently, treat it as a signal that the data model or the function boundary needs rethinking.</p>
<p>Overusing <code>any</code> has the same effect — it opts entire sections of the codebase out of type checking. We allow <code>any</code> only as a last resort when integrating with third-party libraries that have genuinely incomplete type definitions, and always with a comment explaining why.</p>
<p>Finally, overly clever generic utility types that span twenty lines and require a PhD in TypeScript to interpret are a maintenance liability. Three simple, well-named interfaces are almost always better than one complex conditional type. The goal is types that help the next developer understand the code, not impress them.</p>

<h2>The Return on Investment</h2>
<p>TypeScript adds roughly 15–20% to initial development time on a new project, mostly spent writing interface definitions and resolving type errors that reveal genuine design problems. That investment pays for itself quickly: fewer debugging sessions on property-name mismatches, safer refactoring when requirements change, and faster onboarding when a new developer joins. We would not build a production application without it.</p>`,
    tags: ["typescript", "best practices", "monorepo", "web development"],
    isPublished: true,
    publishedAt: new Date("2026-01-10"),
  },
  {
    title: "From Brief to Launch: How We Deliver Web Projects at Bitnox",
    slug: "from-brief-to-launch-how-we-deliver-web-projects-at-bitnox",
    excerpt:
      "Most web development disappointments trace back to misaligned expectations, not technical failures. Here is the exact process we follow — from the first conversation to go-live — and why each stage exists.",
    contentHtml: `<h2>Why Process Matters More Than Technology</h2>
<p>After years of delivering web projects, we have noticed that the failures rarely come from technical problems. Frameworks, databases, and deployment platforms are mature and well-documented. The failures almost always come from misaligned expectations: the client imagined one thing, the developer built another, and both are frustrated when the outcome does not match either party's mental model. A defined delivery process does not limit creativity — it creates the shared language and checkpoints that surface misalignments early, when they are cheap to fix.</p>
<p>Here is the process we follow for every project, from a single-page marketing site to a multi-feature web application with a custom admin panel.</p>

<h2>Stage 1 — Discovery</h2>
<p>Before a single wireframe is sketched, we invest time understanding the business, the audience, and what success actually means for this specific client. The questions we ask at this stage are deliberately non-technical: Who are the people visiting this website and what do they need to accomplish? What action do you most want a visitor to take? What does a successful website look like to you in twelve months — more enquiries, more bookings, a stronger brand, less admin work?</p>
<p>We also scope the technical requirements in plain language: Does the team need to update content themselves, or will we manage it? Are there integrations required — a booking system, a payment provider, a CRM? What is the expected volume of traffic at launch and in a year's time? Discovery ends with a one-page brief that both parties review and sign off on. Everything built after this point traces back to that document.</p>

<h2>Stage 2 — Design</h2>
<p>We produce wireframes first — low-fidelity, greyscale layouts that focus entirely on structure, hierarchy, and user flow without any colour, typography, or brand assets. Client feedback at this stage is free. Moving a navigation element or restructuring a page takes minutes in a wireframe and days in production code. We do not move to high-fidelity design until the structure is agreed.</p>
<p>High-fidelity mockups apply the full brand identity — colours, typography, iconography, imagery — to the approved structure. We deliver desktop and mobile designs for every distinct page template. For complex interactive elements (carousels, modals, multi-step forms), we include annotated interaction notes so there is no ambiguity about the expected behaviour. We do not begin development until these designs are formally approved.</p>

<h2>Stage 3 — Development</h2>
<p>Development happens in short cycles with regular client check-ins, typically every week. From day one of development, the project is deployed to a staging URL that the client can visit at any time. This surfaces real feedback early — elements that look correct in a Figma mockup sometimes feel wrong at full size in a browser, and discovering that in week two is vastly preferable to discovering it in week six.</p>
<p>Our standard stack for client projects is Next.js for the frontend, Express or Next.js API routes for the backend, MongoDB for persistent data, Cloudinary for media assets, and Vercel for deployment. We use TypeScript throughout, Tailwind CSS for utility-first styling, and react-hook-form with Zod for form validation. Every project ships with a staging environment that mirrors production as closely as possible.</p>

<h2>Stage 4 — Testing and Quality Assurance</h2>
<p>Before handover, every project goes through a structured QA pass. We test across Chrome, Firefox, Safari, and Edge on desktop, and verify layouts on iPhone and Android devices at common viewport sizes. We run a Lighthouse performance audit targeting scores above 90 on mobile. We check all form submissions produce the correct outcomes and all error states display sensibly. For projects with authentication, we walk through every auth flow including edge cases like expired sessions and incorrect OTP codes.</p>
<p>Accessibility is not an afterthought. We verify keyboard navigation, check colour contrast ratios against WCAG 2.1 AA guidelines, and confirm that all images have meaningful alt text and all form inputs have associated labels.</p>

<h2>Stage 5 — Launch and Handover</h2>
<p>Go-live is a low-stress event when the preceding stages have been followed. DNS is updated, SSL certificates are provisioned and verified, and we monitor the live deployment for the first 24 hours. Every client receives a handover document that explains how to use the admin panel or CMS, how to request support, and what they need to do if they ever want to migrate to a different hosting provider. All credentials — hosting accounts, domain registrar, API keys — are transferred to the client on launch day. They own everything. We own nothing.</p>`,
    tags: ["web development", "process", "client work", "project management"],
    isPublished: true,
    publishedAt: new Date("2026-02-07"),
  },
  {
    title: "MongoDB vs PostgreSQL: How We Choose a Database for Each Project",
    slug: "mongodb-vs-postgresql-how-we-choose-a-database-for-each-project",
    excerpt:
      "We use both MongoDB and PostgreSQL depending on the project. Here is the practical framework we use to decide — covering data models, query patterns, schema flexibility, and the trade-offs that actually matter in production.",
    contentHtml: `<h2>Both Are Excellent Choices</h2>
<p>The MongoDB versus PostgreSQL debate generates a disproportionate amount of online heat relative to how difficult the decision usually is in practice. Both databases are mature, actively maintained, and capable of serving production applications at significant scale. The difference is not one of quality — it is one of fit. The right database depends on your data model, your access patterns, and the discipline your team is willing to maintain around schema design.</p>
<p>We have used both databases extensively across client projects. Here is the honest framework we apply when making the choice.</p>

<h2>When MongoDB Is the Right Fit</h2>
<p>MongoDB is our default for content-driven applications — marketing websites with a CMS, portfolio platforms, blog engines, e-commerce catalogues, and similar projects where each document may have a somewhat different shape. A blog post has tags, a cover image, and a rich HTML body. A property listing has bedrooms, bathrooms, a postcode, and an availability calendar. These entities are primarily read and written as complete units, and their structure tends to evolve as the product evolves.</p>
<p>MongoDB's document model handles natural variation gracefully. Adding a new field to future documents does not require a schema migration; the existing documents simply lack that field and you handle the absence in application code. For a startup or a growing SME where requirements change frequently, this flexibility can be the difference between iterating quickly and grinding through ALTER TABLE migrations every sprint.</p>
<p>MongoDB also excels when your access pattern is mostly "fetch the complete document." A blog post, a project listing, a customer profile — these are almost always fetched complete and rarely queried with complex cross-entity joins. The document model collocates related data that belongs together, reducing the number of database round-trips for common reads.</p>

<h2>When PostgreSQL Is the Right Fit</h2>
<p>PostgreSQL is the right choice when relationships between entities are central to your application's queries. Financial ledgers, inventory management systems, HR platforms, booking engines with complex constraints — domains where you genuinely need to join across multiple tables, aggregate across large datasets, or enforce referential integrity at the database level — are well served by the relational model.</p>
<p>PostgreSQL's SQL query language is exceptionally expressive for complex reads. Grouped aggregations, window functions, recursive queries, and ad-hoc reporting that would require a complex MongoDB aggregation pipeline can often be expressed in a few lines of SQL that are immediately legible to any developer familiar with the language. For data-intensive back-office applications where analysts query the database directly, this readability advantage is significant.</p>
<p>Database-level constraints are another meaningful PostgreSQL strength. Foreign keys prevent orphaned records. Check constraints reject invalid data before it reaches the application layer. Unique constraints guarantee data integrity even under concurrent writes. MongoDB provides these guarantees only at the application layer via validation logic, which means they can be bypassed by direct database access or a bug in the validation code.</p>

<h2>The Trade-Offs in Practice</h2>
<p>MongoDB's flexibility can become a liability as a project matures. Without enforced schema constraints, it is easy to accumulate documents in the same collection with inconsistently named or typed fields — subtle variation that causes bugs months later when a code path encounters a document that predates a structural change. We address this by using Mongoose with strict mode enabled and Zod validation on every write path, which gives MongoDB most of the safety of a relational schema while retaining the document model's flexibility.</p>
<p>PostgreSQL's rigidity is its own trade-off. Schema migrations must be written, reviewed, tested against a production-representative dataset, and deployed in coordination with application code changes. For a rapidly evolving product, this ceremony adds friction. Tools like Prisma Migrate and Drizzle have reduced this friction considerably, but the fundamental discipline of managing schema versions is unavoidable with a relational database.</p>

<h2>Our Practical Decision Rule</h2>
<p>We use MongoDB when the document is the primary unit of access, the schema is likely to evolve, and the access patterns are predominantly reads of complete entities. We use PostgreSQL when relationships between entities are central to the application's queries, data integrity must be enforced at the database level, or complex aggregations and reporting are a core requirement. For the marketing sites, booking systems, and content platforms that make up most of our client work, MongoDB is the right fit. For anything involving financial records, multi-party transactions, or complex analytical queries, we reach for PostgreSQL without hesitation.</p>`,
    tags: ["mongodb", "postgresql", "databases", "backend", "architecture"],
    isPublished: true,
    publishedAt: new Date("2026-03-14"),
  },
  {
    title: "How We Built Passwordless Authentication with Email OTP and JWT",
    slug: "how-we-built-passwordless-authentication-with-email-otp-and-jwt",
    excerpt:
      "Passwords are a security liability. Our production auth system uses email OTP, access and refresh JWT tokens stored securely, and device fingerprinting to bind sessions. Here is how every piece works and why each decision was made.",
    contentHtml: `<h2>The Case Against Passwords</h2>
<p>Passwords create a security problem that is fundamentally difficult to solve well. Users reuse them across services, choose predictable patterns, write them down, and are vulnerable to phishing attacks that are increasingly convincing. On the application side, storing passwords safely requires careful implementation of bcrypt hashing, salt management, constant-time comparison, and secure password reset flows — each of which has a history of being implemented incorrectly in ways that exposed user credentials.</p>
<p>For our own platform and for client applications that don't need to interoperate with a legacy auth system, we build passwordless authentication using email-based one-time passwords. The user's email inbox becomes the second factor and the credential store in one. The security guarantees depend on the user's email provider, which — for most business users — has far better security infrastructure than a custom password database.</p>

<h2>The Complete Authentication Flow</h2>
<p>Here is every step that happens when a user logs in:</p>
<ol>
  <li>The user enters their email address and submits the login form.</li>
  <li>The server looks up the account. If the email is not registered, the request is rejected with a generic error that does not confirm whether the email exists — this prevents email enumeration attacks.</li>
  <li>The server generates a cryptographically random 6-digit code using <code>Math.random()</code> seeded with <code>crypto</code>, hashes it with SHA-256, and stores the hash in the database alongside the user ID and a 10-minute expiry timestamp. The plaintext code is never written to the database.</li>
  <li>The plaintext code is sent to the user's email via the Resend API. The email contains only the code — no links, since links in auth emails are themselves a phishing vector.</li>
  <li>The user enters the code in the browser. The server hashes the submitted value and compares it to the stored hash using a constant-time comparison to prevent timing attacks.</li>
  <li>On successful verification, the OTP record is deleted from the database (preventing replay attacks), and the server issues two tokens: a short-lived JWT access token and a longer-lived refresh token stored as a session record in MongoDB.</li>
</ol>
<p>Failed verification attempts increment a counter on the OTP record. After three failures, the code is invalidated and the user must request a new one. This prevents brute-force attacks on the 6-digit space.</p>

<h2>Token Storage: Why Not localStorage?</h2>
<p>The most widespread JWT implementation mistake is storing the access token in <code>localStorage</code>. Any JavaScript running in the browser tab — including third-party analytics libraries, chat widgets, injected advertisements, or a malicious browser extension — can read <code>localStorage</code>. This makes tokens stored there vulnerable to cross-site scripting (XSS) attacks: an attacker who can inject a single line of JavaScript into your page can steal every user's access token.</p>
<p>We store access tokens in a module-level variable in memory — a plain TypeScript module that exports a <code>get</code> and <code>set</code> function backed by a module-scoped variable. The token lives only in the JavaScript heap for the lifetime of the browser tab. When the tab is closed or the page is hard-refreshed, the token is gone. This is a deliberate trade-off: the user appears to be logged out on refresh. We recover the session transparently using the refresh token flow, making the experience seamless in practice.</p>

<h2>Silent Refresh and Device Fingerprinting</h2>
<p>When the application loads, the authentication provider runs a silent refresh before rendering any protected content. It reads a <code>session_id</code> from <code>localStorage</code> — an opaque identifier, not the token itself — and generates a device fingerprint from browser characteristics: screen resolution, timezone, installed fonts, user agent string, and canvas rendering. Both are sent to the refresh endpoint.</p>
<p>The server looks up the session by ID, verifies the device fingerprint matches the value recorded at login, and issues a new access token if everything checks out. A mismatched fingerprint — which could indicate the session ID was stolen and used from a different device — invalidates the session immediately and forces re-authentication. Legitimate users on their own device never encounter this; the fingerprint is stable across reloads of the same browser.</p>
<p>The refresh token itself is stored in MongoDB rather than in a cookie or local storage. It is looked up only by the session ID, which means the token value is never transmitted after it is created. Only the session ID travels over the wire during a refresh; the server verifies the session, confirms the fingerprint, and issues a new access token. The refresh token is effectively a server-side session record with a client-held lookup key.</p>

<h2>What This Architecture Protects Against</h2>
<p>This combination of OTP login, in-memory access token storage, and fingerprint-bound refresh sessions defends against the most common authentication attacks: credential stuffing (there are no passwords to stuff), XSS token theft (access tokens are not in localStorage or cookies), session hijacking (a stolen session ID is unusable without matching the device fingerprint), and replay attacks on the OTP (codes are deleted after use and invalidated after failed attempts). It does not replace HTTPS — that is a baseline requirement for any application that handles authentication — but within those constraints, it is the simplest architecture we have found that provides meaningful security without significant engineering overhead.</p>`,
    tags: ["authentication", "security", "jwt", "otp", "backend"],
    isPublished: true,
    publishedAt: new Date("2026-04-02"),
  },
];

export const seedProjects = [
  {
    title: "Clean Axis",
    description:
      "Clean Axis deliver end of tenancy cleaning, deep cleaning, after builders cleaning, carpet cleaning, commercial cleaning, and jet/pressure washing across Coventry, Solihull, Birmingham, Warwick, Leamington Spa, Rugby and more.",
    link: "https://cleanaxis.uk",
    tags: ["next.js", "graphql", "cleaning", "booking"],
    featured: true,
    order: 1,
    isPublished: true,
  },
  {
    title: "Bitnox Technology Training",
    description:
      "A digital training center offering structured, no-fluff courses designed to build practical tech skills. Features bite-sized lessons, hands-on projects, and expert instructors helping students master React, MongoDB, Node.js and other technologies with a clear learning path.",
    link: "https://edu.bitnoxsolution.com",
    tags: ["next.js", "edtech", "lms"],
    featured: true,
    order: 2,
    isPublished: true,
  },
  {
    title: "ProVision Support Services",
    description:
      "A UK-based Community Interest Company (CIC) providing distinctive accommodation services with a focus on sustainability and exceptional guest experiences. Empowers investments while celebrating stays and elevating experiences for communities across the United Kingdom.",
    link: "https://www.provisionsupportservice.co.uk",
    tags: ["react", "cic", "hospitality"],
    featured: true,
    order: 3,
    isPublished: true,
  },
  {
    title: "Babadel Estates Ltd",
    description:
      "Babadel Estates is your trusted UK property partner — from sourcing and flipping to sales, management, and social housing. We turn property ambitions into generational wealth.",
    link: "https://www.babadelestates.co.uk",
    tags: ["next.js", "real estate", "property"],
    featured: true,
    order: 4,
    isPublished: true,
  },
  {
    title: "Dexcraft Agency",
    description:
      "A full-service digital agency specializing in web design, development, and digital marketing solutions. Creates stunning digital presences for brands through strategic design, user experience optimization, and innovative web solutions that drive business growth.",
    link: "https://www.dexcraft.agency",
    tags: ["portfolio", "agency", "web design"],
    featured: true,
    order: 5,
    isPublished: true,
  },
  {
    title: "Remigella International Group",
    description:
      "Recognized as one of Africa's leading diversified conglomerates, providing quality services that exceed customer expectations while creating sustainable value for stakeholders and contributing positively to the communities they serve.",
    link: "https://www.remigellagroup.com/",
    tags: ["conglomerate", "ngo", "company"],
    featured: true,
    order: 6,
    isPublished: true,
  },
  {
    title: "International Dance Nigeria",
    description:
      "They nurture, showcase and export Nigerian dance talent by providing opportunities for education, performance and international competition — while preserving cultural identity and creative innovation.",
    link: "https://www.internationaldance.ng/",
    tags: ["dance", "entertainment", "culture"],
    featured: true,
    order: 7,
    isPublished: true,
  },
  {
    title: "Ask Community",
    description:
      "A developer community platform where learners can ask programming related questions and get quality answers from experienced developers.",
    link: "https://askcom.bitnoxsolution.com/",
    tags: ["community", "programming", "q&a"],
    featured: true,
    order: 8,
    isPublished: true,
  },
];

export const seedTestimonials = [
  {
    clientName: "Ameena Akhtar",
    position: "Director",
    company: "Provision Support Services CIC",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    testimonialText:
      "Bitnox Solution has been instrumental in transforming our online presence. Their team developed a dynamic website and web application that perfectly showcases our services and improves user experience. We highly recommend Bitnox Solution for their expertise in web development!",
    rating: 5,
    featured: true,
    createdAt: new Date("2023-08-20"),
  },
  {
    clientName: "Margaret Macaulay",
    position: "Founder & CEO",
    company: "International Dance Nigeria",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    testimonialText:
      "Bitnox Technology Solutions truly stands out for their outstanding website development services. Their team blends technical skill, creativity, and strategic insight to deliver websites that not only look great but also perform exceptionally well.",
    rating: 5,
    featured: true,
    createdAt: new Date("2025-10-05"),
  },
  {
    clientName: "Victor Chan",
    position: "Product Manager",
    company: "Diesel Nigeria",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    testimonialText:
      "Their team's ability to understand unique requirements and deliver tailored solutions is truly commendable. With their top-notch web development services, Bitnox Solution is dedicated to helping businesses thrive in the digital landscape!",
    rating: 5,
    featured: true,
    createdAt: new Date("2024-12-12"),
  },
  {
    clientName: "Ayo Adeleke",
    position: "Founder",
    company: "Clean Axis Ltd",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    testimonialText:
      "Bitnox technology did a great job by developing a booking system for my cleaning business.",
    rating: 5,
    featured: true,
    createdAt: new Date("2026-02-18"),
  },
];
