import type { Faq } from "@/content/faqs";
import { EDU_URL } from "@/content/properties";
import { SERVICE_SLUGS, type ServiceSlug } from "@/lib/constants";

/**
 * The four services, as typed content.
 *
 * Exactly four, everywhere: the nav dropdown, the landing grid, the services hub, the
 * footer and the sitemap all read this array, so the set cannot drift between them.
 *
 * Cloud infrastructure, digital marketing and cybersecurity are deliberately absent as
 * entries and present as capabilities inside their parent service. They are real work and
 * real search terms, but promoting them to top-level services would give the site seven
 * competing pages where four is already the honest number.
 *
 * Everything a service page renders is here rather than in the page component, for two
 * reasons. The four pages share one template, so copy written into the template would have
 * to be written four times or reduced to whatever the four have in common. And copy that
 * lives in a content module can be read, reviewed and corrected without opening a React
 * file, which is what makes the copy review pass at the end of a phase practical.
 *
 * Icons are not here. This module is text, and the landing grid decides how it is drawn.
 */

/** A titled paragraph. The unit the deliverables and process lists are made of. */
export interface ServiceDetail {
  title: string;
  body: string;
}

interface ServiceLink {
  label: string;
  href: string;
  /** Set for links leaving this origin, which on these pages means Bitnox Education. */
  external?: boolean;
}

/**
 * A pointer to another service page.
 *
 * The note is the reason the two connect, written per pairing rather than pulled from the
 * other service's summary. Internal linking is a ranking input, and a link whose sentence
 * says why a reader would follow it is worth more than a card repeating a description that
 * already sits on the page it points at.
 */
interface RelatedService {
  slug: ServiceSlug;
  note: string;
}

export interface Service {
  slug: ServiceSlug;
  /** The name, used in the nav, headings and the sitemap. */
  name: string;
  /** One line under the name in the nav dropdown. Sentence case, no full stop. */
  tagline: string;
  /** Two sentences at most. The card body and the service page's lead paragraph. */
  summary: string;
  /** Named capabilities. These carry the keywords that are not top-level pages. */
  capabilities: string[];
  /** The title and description for this page. Unique per service, and never the default. */
  seo: { title: string; description: string };
  /** The top of the page. The headline is the `h1`, and it is a claim, not the name. */
  hero: { eyebrow: string; headline: string; lead: string };
  /**
   * What the reader recognises, written about their situation rather than about Bitnox.
   *
   * The title is a claim rather than the word "problem", because it is a heading on the page
   * and a heading that says "The problem" spends a whole line of large type saying nothing.
   * `painPoints` are the short lines beside it: six things somebody can see their own
   * business in, which is the fastest way a service page earns the next thirty seconds.
   */
  problem: { title: string; paragraphs: string[]; painPoints: string[] };
  /** What they have at the end of it. The same section, other half. */
  outcome: { title: string; paragraphs: string[] };
  /** What is included. Each one is something that gets delivered, not a virtue. */
  deliverables: ServiceDetail[];
  /** How the engagement runs, in order. Numbered on the page. */
  process: ServiceDetail[];
  /** Answered on the page and marked up as `FAQPage`. Both read this array. */
  faqs: Faq[];
  /** The other two services this one leads to, and why. */
  related: RelatedService[];
  /**
   * Blog tags this service's reading list is drawn from. Lowercase, matching the tag field
   * on the Blog model. The section renders nothing until posts carrying them exist.
   */
  blogTags: string[];
  /** The band that closes the page. */
  cta: {
    title: string;
    description: string;
    action: ServiceLink;
    secondaryAction?: ServiceLink;
  };
}

export const SERVICES: readonly Service[] = [
  {
    slug: "software-development",
    name: "Software Development",
    tagline: "Custom software and business systems",
    summary:
      "Business management systems, internal tools and custom applications built around the way your team already works. We stay on after launch to fix, extend and host what we built.",
    capabilities: [
      "Business management systems",
      "Custom web applications",
      "API design and systems integration",
      "Cloud infrastructure and deployment",
      "Maintenance and support after launch",
    ],
    seo: {
      title: "Custom Software Development and Business Systems",
      description:
        "Bitnox builds custom business management systems, internal tools and web applications for companies in Nigeria and the UK, then hosts and maintains them after launch.",
    },
    hero: {
      eyebrow: "Software development",
      headline: "Software built around the way your business already works",
      lead: "Orders, stock, invoicing, approvals and reporting in one system your staff can actually use. Scoped in writing, built in stages you can see, and maintained by the people who wrote it.",
    },
    problem: {
      title: "Three spreadsheets, two systems, and somebody retyping between them",
      painPoints: [
        "The same order is written into a spreadsheet, a book and an invoice",
        "Stock on paper and stock on the shelf stopped agreeing months ago",
        "Last month's figures take a day of work to produce",
        "One person understands the spreadsheet, and they take leave",
        "Two staff edit the same file and the last save wins",
        "Growing means hiring somebody else to do the retyping",
      ],
      paragraphs: [
        "Most of the businesses we meet are running on a mix of spreadsheets, WhatsApp threads and an off-the-shelf package that does about two thirds of the job. The gap between them is filled by people retyping the same figures into three places.",
        "That holds until volume grows. Then the retyping becomes the bottleneck, the numbers stop agreeing with each other, and nobody can say which version is the right one.",
      ],
    },
    outcome: {
      title: "One record, read by everyone who needs it",
      paragraphs: [
        "One system that holds each record once. An order is entered where the order happens, and stock, invoicing and the month-end report all read the same row.",
        "You own the code, the database and the hosting accounts. They are set up in your name, so nothing about the system depends on you staying with us.",
      ],
    },
    deliverables: [
      {
        title: "Business management systems",
        body: "Orders, inventory, invoicing, approvals and reporting, built around your process rather than asking your staff to change theirs to suit a package they did not choose.",
      },
      {
        title: "Custom web applications",
        body: "Internal dashboards, customer portals, booking and scheduling tools, and anything else that needs a login, a database and rules about who is allowed to see what.",
      },
      {
        title: "Integration with what you already run",
        body: "Payment gateways, accounting packages, SMS and email providers, and existing databases. We write the API layer and do the data mapping, including the awkward fields.",
      },
      {
        title: "Cloud infrastructure and deployment",
        body: "Hosting on AWS, Vercel or a provider you already pay for, with automated deployments, daily backups, uptime monitoring and certificates that renew themselves.",
      },
      {
        title: "Data migration",
        body: "The records you already have are moved into the new system rather than retyped: spreadsheets, exports from the old package, and whatever holds the history nobody wants to lose.",
      },
      {
        title: "Maintenance after launch",
        body: "Security updates, small changes, monitoring and a person to call, arranged as an ongoing agreement rather than charged per email, so nobody hesitates to report a problem.",
      },
    ],
    process: [
      {
        title: "We sit with the people who will use it",
        body: "The first session is with the staff doing the work, not only the person paying for it. We write down every task the system has to cover and what currently goes wrong with each one.",
      },
      {
        title: "Scope, price and schedule, in writing",
        body: "You get a document saying what will be built, what will not be, what it costs and roughly when it lands. Anything found later is priced as a change rather than absorbed quietly and delivered late.",
      },
      {
        title: "Built in stages you can open",
        body: "Work goes to a staging URL you can look at on any day of the week. You review each stage before the next one starts, so a misunderstanding costs a week instead of the project.",
      },
      {
        title: "Data, testing and training",
        body: "Existing records are migrated, the system is tested against real cases rather than tidy ones, and your team is trained in the room or over a call, with written notes they keep.",
      },
      {
        title: "Support after launch",
        body: "Hosting, backups, monitoring, security updates and small changes under an ongoing agreement. The same people who built the system answer when you call about it.",
      },
    ],
    faqs: [
      {
        question: "How much does custom software cost?",
        answer:
          "It depends on how many workflows the system covers, how many people use it and what it has to connect to. You get a fixed figure with the scope document, before any code is written. A single internal tool is a different order of cost from a system that runs a whole operation, and we will say at the first call which one you are describing.",
      },
      {
        question: "How long does a business system take to build?",
        answer:
          "A focused internal tool is usually four to six weeks. A system covering several departments is eight to sixteen weeks, and how much existing data has to move into it is normally what decides the difference. The schedule comes with the quote rather than after the work starts.",
      },
      {
        question: "Who owns the code and the data?",
        answer:
          "You do. The repository, the database and the hosting accounts are in your name, and we hand over credentials and documentation at the end of the project whether or not you keep us on for maintenance.",
      },
      {
        question: "Can you take over software somebody else built?",
        answer:
          "Often, yes. We audit what is there first and report honestly on whether extending it costs less than replacing it. We have told clients to keep systems we did not build, because rewriting working software is a way to spend a budget without changing anything.",
      },
      {
        question: "Do you handle hosting and infrastructure?",
        answer:
          "Yes. Cloud infrastructure is part of the work: deployment, backups, monitoring and certificates on AWS, Vercel or the provider you already use. If your own IT team would rather run it, we hand over the deployment setup and the documentation for it.",
      },
    ],
    related: [
      {
        slug: "web-development",
        note: "Most systems we build need a public website in front of them, and the two are usually wanted at the same time.",
      },
      {
        slug: "it-consulting",
        note: "If you are not yet certain that building something is the right answer, start with the audit and the written plan.",
      },
    ],
    blogTags: ["software-development", "custom-software", "business-systems"],
    cta: {
      title: "Tell us what the system has to do",
      description:
        "Send the details of the work, who uses it and when you need it. We read every enquiry and reply within one to two working days, usually with questions before a number.",
      action: { label: "Start a project", href: "/contact" },
      secondaryAction: { label: "See our work", href: "/portfolio" },
    },
  },
  {
    slug: "web-development",
    name: "Web Development",
    tagline: "Websites, stores and portals that get found",
    summary:
      "Professional websites, online stores and customer portals that load quickly, read well on a phone and can be edited by your own team without calling us first.",
    capabilities: [
      "Professional business websites",
      "E-commerce platforms and payments",
      "Customer and client portals",
      "Digital marketing and search optimisation",
      "Performance, accessibility and analytics",
    ],
    seo: {
      title: "Web Development, E-commerce and Customer Portals",
      description:
        "Bitnox builds professional websites, online stores and customer portals that load quickly on mobile data, rank in search, and can be edited by your own team.",
    },
    hero: {
      eyebrow: "Web development",
      headline: "Websites people find on Google and buy from on a phone",
      lead: "Professional sites, online stores and customer portals, built to load quickly on mobile data and to be edited by your own team without a support ticket.",
    },
    problem: {
      title: "A site that loads slowly, cannot be edited, and says nothing",
      painPoints: [
        "Six seconds before anything appears on mobile data",
        "Every wording change goes back to whoever built it",
        "No page names the thing you actually sell",
        "Checkout was never tried on a mid-range Android",
        "No analytics, so nobody knows which pages bring enquiries",
        "The last rebuild dropped the old URLs and their rankings with them",
      ],
      paragraphs: [
        "A lot of business websites are a brochure somebody paid for once. They take six seconds to appear on mobile data, they cannot be changed without a developer, and no page on them says plainly what the business sells, so search engines have nothing to rank.",
        "The ones with a store attached tend to lose the sale at the last step, because checkout was never tried on the mid-range phone most customers are holding.",
      ],
    },
    outcome: {
      title: "Found, read on a phone, and updated by your own team",
      paragraphs: [
        "A site that loads in about two seconds on an ordinary connection, says what you sell in the first screen, and gives each service, product and location a page of its own to be found by.",
        "An admin your team runs. Prices, photographs, posts and pages change when you want them to, and the layout does not break when they do.",
      ],
    },
    deliverables: [
      {
        title: "Professional business websites",
        body: "A page for each service, location and question worth ranking for, written to be read rather than to fill a template. Metadata, structured data and the sitemap are part of the build.",
      },
      {
        title: "E-commerce platforms and payments",
        body: "Catalogue, cart, Paystack or Flutterwave checkout, delivery options, stock counts, order notifications and a dashboard showing what sold. Tested on the phones your customers actually use.",
      },
      {
        title: "Customer and client portals",
        body: "Logins, documents, statements, requests and support threads, so customers can answer their own questions instead of ringing the office to ask them.",
      },
      {
        title: "Digital marketing and search optimisation",
        body: "Keyword research, on-page optimisation, Google Business Profile, analytics and conversion tracking, so the site is measured rather than assumed to be working.",
      },
      {
        title: "Performance and accessibility",
        body: "Core Web Vitals, image handling, keyboard access and colour contrast are checked before launch and reported as numbers you can hold us to afterwards.",
      },
      {
        title: "An admin your team can use",
        body: "Plain fields behind a login, training before handover, and written notes. Nothing routine on the site should need a developer.",
      },
    ],
    process: [
      {
        title: "Content and search terms first",
        body: "We start from what people type into Google and what each page has to say, because a layout designed before the words exist gets decorated rather than read.",
      },
      {
        title: "Design in the browser",
        body: "You review real pages on a real URL, at phone width and at desktop width, instead of a picture of a page inside a slide. What you approve is what ships.",
      },
      {
        title: "Build, with the editing tools included",
        body: "The site and the admin behind it are built together, so on the day it launches your team can already change prices, add products and publish a post.",
      },
      {
        title: "Speed, search and testing before launch",
        body: "Page weight, Core Web Vitals, metadata, structured data, forms and checkout are all checked on real devices. Problems found here cost nothing. Found later, they cost sales.",
      },
      {
        title: "Launch, then measure",
        body: "Old URLs are redirected to their replacements, Search Console and analytics go live on day one, and we look at the numbers with you two weeks in.",
      },
    ],
    faqs: [
      {
        question: "How much does a website cost?",
        answer:
          "It depends on how many pages there are, whether it sells anything, and how much of the writing we do. A site for a business with a handful of services costs considerably less than a store with a catalogue and a checkout. You get a fixed figure with the scope document, and we would rather tell you a small site is enough than sell you a large one.",
      },
      {
        question: "Will I be able to edit the site myself?",
        answer:
          "Yes. Text, images, prices, posts and pages are edited from an admin dashboard with a login, and we train your team on it before handover. Structural changes are still a job for us, but nothing routine is.",
      },
      {
        question: "Can you rebuild my existing site without losing my search rankings?",
        answer:
          "Yes, and it is a large part of what we do. Every existing URL is mapped to its replacement and redirected, the pages that already rank are kept, and Search Console is watched for a month after launch so anything that slips is caught while it is still small.",
      },
      {
        question: "Do you handle domains, hosting and business email?",
        answer:
          "Yes. We can register or transfer a domain, set up hosting with an SSL certificate and backups, and configure email on your own domain. If all three are already in place, we work with what is there rather than moving it for the sake of it.",
      },
      {
        question: "How long does a website take?",
        answer:
          "Two to four weeks for a straightforward site once the content is ready, and four to eight weeks for a store or a portal. Content is usually what decides the launch date, which is why we start on it first.",
      },
    ],
    related: [
      {
        slug: "software-development",
        note: "When the site starts bringing work in, the next question is usually the system that handles it behind the scenes.",
      },
      {
        slug: "it-consulting",
        note: "An audit first, if you are not sure whether the right move is to rebuild the site or repair what you have.",
      },
    ],
    blogTags: ["web-development", "seo", "e-commerce"],
    cta: {
      title: "Tell us what the site has to do",
      description:
        "Send what you sell, who buys it, and anything that is not working on the site you have now. We reply within one to two working days.",
      action: { label: "Start a project", href: "/contact" },
      secondaryAction: { label: "See our work", href: "/portfolio" },
    },
  },
  {
    slug: "it-consulting",
    name: "IT Consulting",
    tagline: "Advice on what to build, replace and secure",
    summary:
      "Technology advisory for organisations deciding what to build, what to replace and what to protect. You get a written plan with costs and an order of work, not a slide deck.",
    capabilities: [
      "Technology strategy and advisory",
      "Digital transformation planning",
      "Cybersecurity review and hardening",
      "Systems audit and vendor selection",
      "IT policy, process and staff onboarding",
    ],
    seo: {
      title: "IT Consulting, Technology Strategy and Cybersecurity",
      description:
        "Independent technology advice for organisations deciding what to build, replace or secure. The deliverable is a written plan with costs, priorities and an order of work.",
    },
    hero: {
      eyebrow: "IT consulting",
      headline: "Advice you can act on, with costs and an order of work",
      lead: "Technology advisory for organisations deciding what to build, what to replace and what to protect. The deliverable is a written plan you could hand to any competent vendor, including one that is not us.",
    },
    problem: {
      title: "Three vendors, overlapping systems, and no single figure for what it costs",
      painPoints: [
        "Two products doing the same job, both on annual renewal",
        "One admin password, shared, unchanged for years",
        "Backups that run nightly and have never been restored",
        "A quote for a new system with nothing to judge it against",
        "Staff who left and still have access",
        "A five-year decision being made in one meeting",
      ],
      paragraphs: [
        "Technology decisions get made under pressure, usually by whoever asked most persistently or quoted most recently. A year later the organisation is paying three vendors for systems that overlap, none of which talk to each other, and nobody can say what any of them costs to run.",
        "Security is where it shows first. Shared logins, a backup nobody has ever restored, and the only copy of the customer list sitting on one laptop.",
      ],
    },
    outcome: {
      title: "A plan you could hand to anybody, in the order it should be done",
      paragraphs: [
        "A written plan: what you run today and what it costs, what to fix first, what to replace, what to leave alone, and what each step takes in time and money.",
        "It is written to be handed to any vendor. We will quote for the build if you want us to, and the plan stands whether you accept that quote or not.",
      ],
    },
    deliverables: [
      {
        title: "Systems audit",
        body: "An inventory of what you run, what it costs, who depends on it and where two things are doing the same job. Licences, subscriptions and the software nobody admits to still using.",
      },
      {
        title: "Technology strategy and advisory",
        body: "What to build, what to buy and what to drop, in an order that fits the budget and the year you actually have rather than an ideal one.",
      },
      {
        title: "Digital transformation planning",
        body: "Moving paper forms and spreadsheet workflows onto systems, in stages a working organisation can absorb without stopping to do it.",
      },
      {
        title: "Cybersecurity review and hardening",
        body: "Access control, password and device policy, patching, backups that have been restored at least once as a test, and written steps for the day something does go wrong.",
      },
      {
        title: "Vendor selection and oversight",
        body: "Requirements, a shortlist, the questions to ask each vendor, and a review of what you are quoted. We will tell you when a price you have been given is fair.",
      },
      {
        title: "IT policy and staff onboarding",
        body: "The written policies, and the practical session that makes staff able to follow them. A policy nobody has been walked through changes nothing.",
      },
    ],
    process: [
      {
        title: "Interviews and inventory",
        body: "A few days with the people who run the systems and the people who use them, plus a full list of what is in place, what it costs and who it belongs to.",
      },
      {
        title: "Findings, ranked by what they cost you",
        body: "Every finding is ordered by the money, the risk or the hours it is costing now, so the list can be read from the top rather than argued over.",
      },
      {
        title: "The written plan",
        body: "Recommendations with costs, effort and an order of work, in language a board can read and a vendor can quote against.",
      },
      {
        title: "A session to walk through it",
        body: "We go through the plan with the people who have to act on it and answer the objections in the room, because a report nobody has discussed gets filed.",
      },
      {
        title: "Review, if you want one",
        body: "A check three or six months later on what was done, what changed and what to move next. Arranged only where it is useful, not as a standing retainer.",
      },
    ],
    faqs: [
      {
        question: "What do I actually receive at the end?",
        answer:
          "A written report: an inventory of what you run, findings ranked by what they cost, recommendations with costs and effort against each, and an order of work. Plus a session going through it with your team. It is a document you can act on, not a presentation.",
      },
      {
        question: "Do you only recommend work that you can do yourselves?",
        answer:
          "No. The plan is written so any competent vendor could quote against it, and it regularly recommends keeping a system, buying an off-the-shelf product, or hiring in-house. We will quote for the parts we could build if you ask, and that quote is separate from the advice.",
      },
      {
        question: "How long does an audit take?",
        answer:
          "One to three weeks for most organisations, depending on how many systems are in place and how quickly we can get time with the people who run them. You get a date for the report before we start.",
      },
      {
        question: "Do you carry out the cybersecurity work, or only advise on it?",
        answer:
          "Both. The review names what is exposed and what it would take to close it. We can then do the work, which means access control, backups, patching and the written policies, or hand the whole list to your own IT team.",
      },
      {
        question: "We are a small organisation. Is this only for large ones?",
        answer:
          "No. A ten-person business choosing a system it will run for the next five years is exactly the case where a week of advice costs less than the wrong purchase. The audit scales down, and so does its price.",
      },
    ],
    related: [
      {
        slug: "software-development",
        note: "When the plan says build, this is what building it looks like, and the scope document starts from the audit.",
      },
      {
        slug: "technology-training",
        note: "Most plans have a training line in them, because new systems only stick when the staff using them have been taught properly.",
      },
    ],
    blogTags: ["it-consulting", "cybersecurity", "technology-strategy"],
    cta: {
      title: "Start with a conversation about what you run",
      description:
        "Tell us what is in place and what decision is in front of you. The first call costs nothing and usually shortens the audit.",
      action: { label: "Book a first call", href: "/contact" },
      secondaryAction: { label: "More about Bitnox", href: "/about" },
    },
  },
  {
    slug: "technology-training",
    name: "Technology Training",
    tagline: "Professional training in technology and digital skills",
    summary:
      "Practical courses in software development, data and digital skills, taught online and in person at the Bitnox Event Space. Course listings and enrolment are handled by Bitnox Education.",
    capabilities: [
      "Software development and programming",
      "Data analysis and reporting",
      "Digital skills for the workplace",
      "Corporate and team training",
      "In-person classes and online cohorts",
    ],
    seo: {
      title: "Technology Training for Teams and Professionals",
      description:
        "Practical training in software development, data and digital skills, taught in Abeokuta and online. Course listings, dates and enrolment are on Bitnox Education.",
    },
    hero: {
      eyebrow: "Technology training",
      headline: "Training that leaves people able to do the work",
      lead: "Courses in software development, data and digital skills, taught in person at the Bitnox Event Space in Abeokuta and online. Course listings, dates and enrolment are handled by Bitnox Education.",
    },
    problem: {
      title: "A certificate, and nothing anybody can build on Monday",
      painPoints: [
        "The course covered the tool, not the way your team uses it",
        "Everyone followed along, and nobody can start from a blank screen",
        "The team came back and the process did not change",
        "One person now knows the system and everybody else still asks them",
        "No way to tell who actually learned anything",
        "Skills half the room already had were paid for again",
      ],
      paragraphs: [
        "Most technology training ends with a certificate and nothing built. People finish able to follow along in a lesson and still stuck when they open a blank screen on Monday.",
        "For teams it is worse. Staff are sent on a general course that covers the tool but not the way your organisation uses it, and nothing about the work changes when they come back.",
      ],
    },
    outcome: {
      title: "People who can do the task, and something they built to prove it",
      paragraphs: [
        "Classes are built around work people do afterwards. Everyone leaves having built something, with the notes, the files and the repository to carry on from.",
        "Team training is scoped against your own systems and processes, so what is taught on the Friday is used on the Monday, and there is an assessment at the end that says what changed.",
      ],
    },
    deliverables: [
      {
        title: "Software development and programming",
        body: "Web development with JavaScript and React, backend work with Node.js and Python, databases, version control, and getting a project deployed and running.",
      },
      {
        title: "Data analysis and reporting",
        body: "Spreadsheets past the basics, SQL, dashboards, and the monthly reporting managers keep asking for, taught against real figures rather than sample data.",
      },
      {
        title: "Digital skills for the workplace",
        body: "The everyday tools an office runs on, plus the security habits that stop a shared password from becoming an incident.",
      },
      {
        title: "Corporate and team training",
        body: "Scoped against your systems, delivered at your office or in the Event Space, with a short assessment at the end so you can see what the days bought you.",
      },
      {
        title: "In-person classes and online cohorts",
        body: "Abeokuta classes run in the Bitnox Event Space, which seats sixty. Online cohorts are taught live, with recordings for anyone who misses a session.",
      },
    ],
    process: [
      {
        title: "What the team has to be able to do",
        body: "A short conversation about the tasks people are meant to handle afterwards. The gap between that and what they can do now is the syllabus.",
      },
      {
        title: "A syllabus written to that gap",
        body: "You see the outline, the hours and the projects before anything is booked, and you can cut whatever your team already knows.",
      },
      {
        title: "Delivery, in person or online",
        body: "At your office, in the Event Space or live online. Groups are kept small enough that the trainer can look at everybody's screen.",
      },
      {
        title: "Projects and assessment",
        body: "Everyone builds something, and everyone is assessed on it. You get the results, not only an attendance list.",
      },
      {
        title: "Follow-up",
        body: "A session a few weeks later on what people hit once they were doing the work for real, which is where most of the questions actually appear.",
      },
    ],
    faqs: [
      {
        question: "Where do I find course dates, fees and enrolment?",
        answer:
          "On Bitnox Education at edu.bitnoxsolution.com. That site carries the course catalogue, the dates, the fees and the enrolment form. This page covers training arranged for a team or an organisation, which is handled here.",
      },
      {
        question: "Do you train teams at our own office?",
        answer:
          "Yes. Team training is delivered at your office, in the Bitnox Event Space in Abeokuta, or live online, whichever suits the group. The content is scoped against the systems your staff use rather than a generic outline.",
      },
      {
        question: "Are classes in person or online?",
        answer:
          "Both. In-person classes run in the Event Space in Abeokuta, which seats sixty. Online cohorts are taught live rather than pre-recorded, and sessions are recorded so anyone who misses one can catch up.",
      },
      {
        question: "Do participants get a certificate?",
        answer:
          "Yes, on completion. The more useful thing they leave with is the project they built during the course, along with the code and the notes, because that is what an employer or a client can look at.",
      },
      {
        question: "Can complete beginners join?",
        answer:
          "Yes. Several courses assume no programming at all, only that you can use a computer. The listings on Bitnox Education say what each course expects before you enrol.",
      },
    ],
    related: [
      {
        slug: "software-development",
        note: "Teams often train first and then bring us in to build the system they have just learned enough to help specify.",
      },
      {
        slug: "it-consulting",
        note: "If you are not sure which skills the organisation is short of, the audit answers that before anyone books a course.",
      },
    ],
    blogTags: ["training", "technology-training", "careers"],
    cta: {
      title: "Course dates and enrolment are on Bitnox Education",
      description:
        "The catalogue, the dates, the fees and the enrolment form all live on the education site. For training arranged around a team, send us the details instead.",
      action: { label: "Go to Bitnox Education", href: EDU_URL, external: true },
      secondaryAction: { label: "Training for a team", href: "/contact" },
    },
  },
] as const;

/** Guards against a slug in the array falling out of step with the models. */
export const SERVICE_BY_SLUG: Readonly<Record<ServiceSlug, Service>> = Object.freeze(
  Object.fromEntries(SERVICES.map((service) => [service.slug, service])) as Record<
    ServiceSlug,
    Service
  >,
);

export function servicePath(slug: ServiceSlug): string {
  return `/services/${slug}`;
}

export function serviceName(slug: ServiceSlug): string {
  return SERVICE_BY_SLUG[slug].name;
}

/**
 * Narrows a route segment to a slug.
 *
 * `generateStaticParams` returns the four, but a dynamic segment still accepts anything a
 * visitor types, so the page needs a way to call `notFound()` instead of indexing the record
 * with a string that is not in it.
 */
export function isServiceSlug(value: string): value is ServiceSlug {
  return Object.hasOwn(SERVICE_BY_SLUG, value);
}

/**
 * The two lists must hold the same four slugs.
 *
 * `SERVICE_SLUGS` is in `lib/constants.ts` because the Mongoose models validate against it
 * before this module exists. Two lists means they can disagree, so the disagreement is made
 * to fail loudly at import time rather than quietly at render time.
 */
if (SERVICES.length !== SERVICE_SLUGS.length) {
  throw new Error("SERVICES and SERVICE_SLUGS have drifted apart. They must hold the same four.");
}
