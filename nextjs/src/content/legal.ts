/**
 * The terms of service and the privacy policy.
 *
 * Ported from the legacy `client/src/pages/` versions and corrected against what this
 * application actually does, which is the part a port usually gets wrong. The old privacy
 * policy described device fingerprinting, bcrypt and AWS. None of those is
 * true of this build: sessions are a signed cookie backed by a row in the database,
 * passwords are hashed with Argon2, images go to Cloudinary and email goes through Resend.
 * A privacy policy that describes systems the site does not run is worse than a short one,
 * because every sentence in it is a statement of fact somebody may rely on.
 *
 * Both documents are content rather than components for the usual reason: a lawyer or a
 * director has to be able to read and correct them without opening a React file. The page
 * decides the numbering, the table of contents and the anchors; nothing here knows how it
 * will be drawn.
 *
 * The dates are constants. Nothing on a statically generated page may read the clock, and a
 * "last updated" that quietly followed the build date would be worse than useless on a legal
 * document: it would claim a review that never happened.
 *
 * These are not legal advice and they are not a substitute for a solicitor reading them. They
 * are an accurate description of how Bitnox works, written so that the review is a review
 * rather than a rewrite.
 */

export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  /** The boxed statement. One per section at most, for the sentence that carries the weight. */
  | { type: "callout"; text: string };

export interface LegalSection {
  /** The anchor. Stable, because these are linked to from contracts and emails. */
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  title: string;
  /** Where the document lives, for the breadcrumb and for the link to its counterpart. */
  path: "/terms" | "/privacy";
  /** The `h1`. A claim about the document, not the document's name repeated. */
  headline: string;
  lead: string;
  effective: string;
  lastUpdated: string;
  seo: { title: string; description: string };
  sections: LegalSection[];
}

/** Written out, because a date is read by a person here rather than parsed by anything. */
const EFFECTIVE = "1 January 2025";
const LAST_UPDATED = "4 September 2026";

/** Machine-readable, for the `dateModified` in structured data and the `datetime` attribute. */
export const LEGAL_LAST_UPDATED_ISO = "2026-09-04";

// --- Terms of service -------------------------------------------------------

export const TERMS: LegalDocument = {
  title: "Terms of Service",
  path: "/terms",
  headline: "The terms every Bitnox engagement runs under",
  lead: "These apply to the website, to enquiries sent through it, and to every project, training course and Event Space booking. Where a signed proposal says something different, the proposal wins.",
  effective: EFFECTIVE,
  lastUpdated: LAST_UPDATED,
  seo: {
    title: "Terms of Service",
    description:
      "The terms covering Bitnox Technology Solutions projects, training, Event Space bookings and this website: scope, payment, intellectual property, liability and governing law.",
  },
  sections: [
    {
      id: "acceptance",
      title: "Acceptance of these terms",
      blocks: [
        {
          type: "paragraph",
          text: "These terms are an agreement between you and **Bitnox Technology Solutions**, a technology company operating under the laws of the Federal Republic of Nigeria with its principal place of business in Abeokuta, Ogun State.",
        },
        {
          type: "paragraph",
          text: "You accept them by using this website, sending an enquiry, signing a proposal or making a payment. They apply alongside our [privacy policy](/privacy) and any agreement written for a specific piece of work.",
        },
        {
          type: "callout",
          text: "If you do not agree to these terms, do not use the services. If you are accepting on behalf of a company, you are confirming that you have the authority to bind it.",
        },
      ],
    },
    {
      id: "services",
      title: "What we provide",
      blocks: [
        {
          type: "paragraph",
          text: "Bitnox provides [software development](/services/software-development), [web development](/services/web-development), [IT consulting](/services/it-consulting) and [technology training](/services/technology-training), and lets the [Event Space](/event-space) in Abeokuta for conferences, meetings, workshops, classes and similar gatherings.",
        },
        {
          type: "paragraph",
          text: "Laundry and cleaning are provided by a separate arm of the business, at cleaning.bitnoxsolution.com. Course enrolment is handled at edu.bitnoxsolution.com. Each has its own terms where they differ from these.",
        },
        {
          type: "paragraph",
          text: "The scope, timeline, deliverables and price of any engagement are set out in a written proposal, statement of work or booking confirmation agreed by both sides. These terms apply across all of them unless that document says otherwise.",
        },
      ],
    },
    {
      id: "your-obligations",
      title: "What we need from you",
      blocks: [
        {
          type: "paragraph",
          text: "For us to deliver, you agree to:",
        },
        {
          type: "list",
          items: [
            "Provide accurate and complete information, including briefs, content, access credentials and any documentation the work depends on.",
            "Respond to questions and review deliverables within the timescales agreed, since a project schedule assumes both sides move.",
            "Keep any credentials, keys or access tokens we issue to you confidential, and tell us promptly if you believe one has been exposed.",
            "Not use our services or anything we deliver for unlawful purposes, or to host content that is illegal, defamatory or infringes somebody else's rights.",
            "Comply with applicable Nigerian law, including the Cybercrimes (Prohibition, Prevention, Etc.) Act 2015 and the Nigeria Data Protection Act 2023.",
          ],
        },
        {
          type: "paragraph",
          text: "Delays caused by information or approvals we are waiting on move the schedule by at least the length of the delay. We will say so at the time rather than at the end.",
        },
      ],
    },
    {
      id: "intellectual-property",
      title: "Who owns what",
      blocks: [
        { type: "subheading", text: "Our tools and methods" },
        {
          type: "paragraph",
          text: "The frameworks, internal libraries, templates, processes and know-how Bitnox develops remain ours, whether or not they were used on your project. Nothing in an engagement transfers them.",
        },
        { type: "subheading", text: "What you receive" },
        {
          type: "paragraph",
          text: "On full payment for a completed project, we assign to you the rights in the custom source code, designs and written content created specifically for you and billed to you. Third-party components, open-source libraries and pre-existing Bitnox assets stay under their own licences, and we will tell you which they are before delivery rather than after.",
        },
        {
          type: "callout",
          text: "Rights transfer on full and final payment. Until then the work product remains ours, and we may withhold delivery while an invoice is outstanding.",
        },
        { type: "subheading", text: "Showing the work" },
        {
          type: "paragraph",
          text: "Unless you ask us in writing not to, we may show publicly visible parts of completed work in our [portfolio](/portfolio) and in proposals: screenshots, a description of the problem and what was built. We do not publish your data, your internal screens or anything covered by a confidentiality agreement.",
        },
      ],
    },
    {
      id: "payment",
      title: "Payment and billing",
      blocks: [
        {
          type: "list",
          items: [
            "Fees are quoted and payable in Nigerian Naira unless another currency is agreed in writing.",
            "Projects are usually structured as a deposit before work starts and the balance on completion, or against milestones set out in the proposal.",
            "Invoices are payable within **7 business days** of issue unless the agreement says otherwise.",
            "Overdue balances attract **2% per month** on the outstanding amount, calculated from the due date.",
            "We may suspend work, access or delivery while an invoice is overdue. We will give notice before doing so.",
            "Fees are exclusive of tax. Where VAT or another statutory levy applies under Nigerian law, it is added to the invoice.",
            "Deposits are non-refundable once work has started. Any other refund is governed by the specific agreement.",
          ],
        },
        {
          type: "paragraph",
          text: "Event Space bookings are quoted per booking rather than from a published rate, because the figure depends on the date, the duration and the setup. A booking is confirmed when the deposit stated in the confirmation has been received.",
        },
      ],
    },
    {
      id: "delivery",
      title: "Timelines and availability",
      blocks: [
        {
          type: "paragraph",
          text: "We work to the timeline in each agreement. Timelines are estimates, and they move for reasons that include delays on your side, scope changes, third-party dependencies and events outside either party's control.",
        },
        {
          type: "paragraph",
          text: "For hosted or managed services we target **99.5% availability** in a calendar month, excluding scheduled maintenance. Where a specific service level is agreed, it is written into that contract.",
        },
        {
          type: "paragraph",
          text: "We may take a service offline briefly to apply security patches or infrastructure changes. Where it is practical to give notice, we do.",
        },
      ],
    },
    {
      id: "confidentiality",
      title: "Confidentiality",
      blocks: [
        {
          type: "paragraph",
          text: "Each side will receive information from the other that is not public: business plans, technical specifications, source code, financial data, customer records and internal processes. Both sides agree to hold it in confidence, use it only for the engagement, and protect it with reasonable care.",
        },
        {
          type: "paragraph",
          text: "These obligations continue for **3 years** after the engagement ends, and indefinitely for anything that is a trade secret.",
        },
      ],
    },
    {
      id: "warranties",
      title: "What we warrant, and what we do not",
      blocks: [
        {
          type: "paragraph",
          text: "We perform every engagement with reasonable skill and care, to professional standards. Beyond that, and to the extent Nigerian law allows:",
        },
        {
          type: "list",
          items: [
            "Deliverables are provided as they are, without any implied warranty of fitness for a purpose beyond what the project agreement documents.",
            "We do not warrant that software is free of all defects. We do commit to fixing reported defects within the warranty period named in the agreement.",
            "We do not warrant the continued operation of third-party platforms, services or interfaces that a deliverable depends on.",
          ],
        },
      ],
    },
    {
      id: "liability",
      title: "Limitation of liability",
      blocks: [
        {
          type: "paragraph",
          text: "To the maximum extent Nigerian law allows, Bitnox is not liable for:",
        },
        {
          type: "list",
          items: [
            "Indirect, incidental, special or consequential loss arising from these terms or the services.",
            "Loss of profit, revenue, data, business opportunity or goodwill, even where we were told such loss was possible.",
            "Failure or delay caused by circumstances beyond our reasonable control, including power and internet interruption, natural events and actions of government.",
          ],
        },
        {
          type: "callout",
          text: "Our total liability for any claim arising from an engagement is capped at the fees you paid us for that specific project in the 12 months before the claim.",
        },
        {
          type: "paragraph",
          text: "Nothing here limits liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot be excluded by law.",
        },
      ],
    },
    {
      id: "indemnity",
      title: "Indemnity",
      blocks: [
        {
          type: "paragraph",
          text: "You agree to indemnify Bitnox, its directors, employees and contractors against claims, losses and reasonable legal costs arising from:",
        },
        {
          type: "list",
          items: [
            "Your breach of these terms or of applicable law.",
            "Use of a deliverable in a way the agreement did not contemplate.",
            "Third-party claims arising from content, data or instructions you supplied to us.",
            "Infringement of a third party's intellectual property caused by materials or specifications you supplied.",
          ],
        },
      ],
    },
    {
      id: "termination",
      title: "Ending an engagement",
      blocks: [
        {
          type: "paragraph",
          text: "You may end a project by giving written notice. You remain liable for work completed to that date, and deposits and milestone payments already made are not refundable unless we agree otherwise in writing.",
        },
        {
          type: "paragraph",
          text: "We may suspend or end an engagement on written notice if:",
        },
        {
          type: "list",
          items: [
            "You materially breach these terms and have not put it right within 14 days of being told.",
            "You become insolvent or are subject to winding-up proceedings.",
            "Our services are being used for an unlawful purpose.",
            "Payment remains outstanding more than 30 days after the due date.",
          ],
        },
        {
          type: "paragraph",
          text: "The sections on intellectual property, confidentiality, liability, indemnity and governing law survive the end of an engagement.",
        },
      ],
    },
    {
      id: "governing-law",
      title: "Governing law and disputes",
      blocks: [
        {
          type: "paragraph",
          text: "These terms and every engagement under them are governed by the laws of the Federal Republic of Nigeria, including the Federal Competition and Consumer Protection Act 2019.",
        },
        {
          type: "paragraph",
          text: "If a dispute arises, both sides agree to attempt to resolve it in good faith within **30 days** of written notice. If that fails, the dispute goes to mediation under Nigerian law before either side refers it to the courts of Ogun State, Nigeria.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to these terms",
      blocks: [
        {
          type: "paragraph",
          text: "We may update these terms. Where a change is material we will give notice by email to clients on active engagements, or by a notice on this site, at least **14 days** before it takes effect.",
        },
        {
          type: "paragraph",
          text: "Continuing to use the services, or signing a new agreement, after a change is published means you accept the updated terms. The last updated date at the top of this page is when the document last changed.",
        },
      ],
    },
    {
      id: "contact",
      title: "How to reach us about this",
      blocks: [
        {
          type: "paragraph",
          text: "Questions about these terms are worth asking before you engage us rather than after. Send them through the [contact page](/contact) or to info@bitnoxsolution.com and we will answer within one to two working days.",
        },
      ],
    },
  ],
};

// --- Privacy policy ---------------------------------------------------------

export const PRIVACY: LegalDocument = {
  title: "Privacy Policy",
  path: "/privacy",
  headline: "What we collect, why we hold it, and how to get it back",
  lead: "This covers the data Bitnox handles through this website, through enquiries and newsletter signups, and in the course of a project. It is written to the Nigeria Data Protection Act 2023.",
  effective: EFFECTIVE,
  lastUpdated: LAST_UPDATED,
  seo: {
    title: "Privacy Policy",
    description:
      "How Bitnox Technology Solutions collects, uses, stores and shares personal data, your rights under the Nigeria Data Protection Act 2023, and how to exercise them.",
  },
  sections: [
    {
      id: "introduction",
      title: "Who this is from",
      blocks: [
        {
          type: "paragraph",
          text: "**Bitnox Technology Solutions** is a technology company based in Abeokuta, Ogun State, Nigeria. This policy explains how we handle personal data when you visit this website, send an enquiry, subscribe to the newsletter, book the Event Space or engage us on a project.",
        },
        {
          type: "callout",
          text: "It is made under the Nigeria Data Protection Act 2023 and the guidance of the Nigeria Data Protection Commission. Using the site or sending us your details means you have been told what is in it.",
        },
        {
          type: "paragraph",
          text: "For data you give us directly, Bitnox is the **data controller**. Where we process data on behalf of a client, on a system we built or host for them, we are a **data processor** and act on that client's instructions under the agreement with them.",
        },
      ],
    },
    {
      id: "what-we-collect",
      title: "What we collect",
      blocks: [
        { type: "subheading", text: "What you give us" },
        {
          type: "list",
          items: [
            "Your name, email address, phone number and organisation, when you send an enquiry or ask for a quote.",
            "The date, expected number of people and what the room is for, when you enquire about the Event Space.",
            "Your email address alone, when you subscribe to the newsletter.",
            "Briefs, specifications, files and content you send us during a project.",
            "Billing details needed to invoice you and record the payment.",
            "A name, email address and password, for the small number of accounts that can sign in to the admin. Passwords are stored only as an Argon2 hash and are never readable by us.",
          ],
        },
        { type: "subheading", text: "What is collected automatically" },
        {
          type: "list",
          items: [
            "Your IP address, taken when a form is submitted and used to rate-limit the form. It is stored against the submission and nothing else.",
            "Server logs generated by requests, held for a short period for security and diagnosis.",
            "Where a Google Tag Manager container is configured and you have accepted analytics, the data that container collects, subject to Google's own policies. Decline and it collects nothing.",
          ],
        },
        {
          type: "paragraph",
          text: "We do not fingerprint devices, we do not buy contact lists, and we do not track visitors across other websites.",
        },
      ],
    },
    {
      id: "how-we-use-it",
      title: "What we use it for",
      blocks: [
        {
          type: "list",
          items: [
            "**Answering enquiries.** Replying to what you sent, confirming an Event Space date, and quoting for work.",
            "**Delivering a project.** Doing the work, managing it, and handing over what was agreed.",
            "**Billing.** Issuing invoices and keeping the financial records Nigerian law requires.",
            "**Signing in.** Authenticating the accounts that can reach the admin, and keeping those sessions secure.",
            "**Newsletter.** Sending the newsletter you asked for, until you stop it.",
            "**Security.** Rate-limiting forms, detecting abuse and protecting the site and its data.",
            "**Legal obligations.** Meeting our obligations and responding to lawful requests.",
          ],
        },
        {
          type: "paragraph",
          text: "We do not sell, rent or trade personal data, and we do not use enquiry details for marketing you did not ask for.",
        },
      ],
    },
    {
      id: "legal-basis",
      title: "The lawful basis for each use",
      blocks: [
        {
          type: "list",
          items: [
            "**Performing a contract.** Processing needed to do work you have engaged us for, or to take steps before a contract at your request.",
            "**Legitimate interests.** Running the business safely: preventing abuse of the forms, keeping records of what was agreed, and improving the site. Balanced against your rights, and never used for anything intrusive.",
            "**Consent.** The newsletter, and any non-essential analytics. Freely given, and withdrawable at any time.",
            "**Legal obligation.** Records we are required to keep, and requests we are required to answer.",
          ],
        },
      ],
    },
    {
      id: "sharing",
      title: "Who else sees it",
      blocks: [
        {
          type: "paragraph",
          text: "We share personal data only in these circumstances:",
        },
        {
          type: "list",
          items: [
            "**Service providers we depend on.** Resend, which sends our transactional email and the newsletter. Cloudinary, which stores images uploaded through the admin. Our hosting and database providers. Each processes data on our instructions under its own agreement.",
            "**Subcontractors on a project.** Vetted specialists brought onto a piece of work, under the same confidentiality and data protection obligations we are under.",
            "**Where the law requires it.** In response to a court order or a lawful request from a competent authority, including the NDPC.",
            "**A business transfer.** If the business is merged, acquired or sold, data may move with it. Affected people are told, as the law requires.",
            "**Anything else, with your consent.** Asked for at the time, and specific to the purpose.",
          ],
        },
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      blocks: [
        {
          type: "list",
          items: [
            "**Project records**, including contracts, deliverables and correspondence: at least **7 years** after the project ends, as Nigerian tax and company law requires.",
            "**Financial and billing records**: **7 years**, under the Federal Inland Revenue Service Act and the Companies and Allied Matters Act.",
            "**Enquiries**, including Event Space bookings: **24 months** after the last contact, so we can pick up a conversation that resumes.",
            "**Newsletter subscriptions**: until you unsubscribe. The record of the unsubscribe itself is kept, so you are not added back by mistake.",
            "**Admin accounts and their sessions**: for as long as the account is active. Sessions expire on their own and are removed.",
            "**Rate-limiting records**: hours, not days. They exist only for the window they cover.",
          ],
        },
        {
          type: "paragraph",
          text: "When data is no longer needed it is deleted or anonymised.",
        },
      ],
    },
    {
      id: "your-rights",
      title: "Your rights, and how to use them",
      blocks: [
        {
          type: "paragraph",
          text: "Under the Nigeria Data Protection Act 2023 you have the right to:",
        },
        {
          type: "list",
          items: [
            "**Access** a copy of the personal data we hold about you.",
            "**Correct** anything inaccurate or incomplete.",
            "**Erase** your data, subject to the retention periods above where the law requires us to keep something.",
            "**Restrict** how we use it, in defined circumstances.",
            "**Portability**: receive your data in a structured, machine-readable format.",
            "**Object** to processing based on legitimate interests, including any direct marketing.",
            "**Withdraw consent** at any time, without affecting anything done lawfully before you did.",
            "**Complain** to the Nigeria Data Protection Commission at ndpc.gov.ng if you believe your rights have been breached.",
          ],
        },
        {
          type: "callout",
          text: "Write to info@bitnoxsolution.com with what you want and enough detail to find your records. We answer within 30 days, as the NDPA requires. Every newsletter also carries a one-click unsubscribe link, which needs no request at all.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies and storage",
      blocks: [
        {
          type: "paragraph",
          text: "This site sets very little in your browser, and none of it is used to build a profile of you.",
        },
        {
          type: "list",
          items: [
            "**A session cookie**, set only when somebody signs in to the admin. It holds a signed session identifier, nothing about you, and it is required for signing in to work. It is strictly necessary, so it is not covered by the banner below.",
            "**Analytics**, only where a Google Tag Manager container has been configured for the site, and only after you have accepted it. Until you do, the analytics tags run in a mode that stores nothing in your browser and sets no cookie.",
            "**Your answer to the banner**, kept in your browser's local storage rather than in a cookie, so we do not have to ask again on every page. It records the word granted or denied and nothing else, and it never reaches our servers.",
          ],
        },
        {
          type: "paragraph",
          text: "The banner appears once, on your first visit. You can change your answer at any time using the Analytics settings link at the bottom of any page, and declining costs you nothing: no feature of this site depends on it.",
        },
        {
          type: "paragraph",
          text: "There are no advertising cookies, no social network pixels and no cross-site trackers. You can clear or block cookies in your browser at any time; blocking the session cookie prevents signing in to the admin and affects nothing else.",
        },
      ],
    },
    {
      id: "security",
      title: "How it is protected",
      blocks: [
        {
          type: "list",
          items: [
            "Data in transit is encrypted with TLS.",
            "Passwords are hashed with **Argon2**, which is designed to be expensive to attack, and are never stored or logged in a readable form.",
            "Signing in uses a one-time code sent by email in addition to the password.",
            "One-time codes and links are stored as keyed hashes, so a copy of the database does not reveal them.",
            "Admin access is limited by role, and every action that changes data checks the session on the server rather than trusting the browser.",
            "Public forms are rate-limited by address and by email, to cap what an abusive run can cost.",
            "Uploads are signed on the server, so nothing can be written to our image storage without our key.",
          ],
        },
        {
          type: "callout",
          text: "No system is completely secure. If a personal data breach occurs, we will notify the people affected and the NDPC within 72 hours of becoming aware of it, as the NDPA requires.",
        },
      ],
    },
    {
      id: "children",
      title: "Children",
      blocks: [
        {
          type: "paragraph",
          text: "This website and our services are for people aged 18 and over, and we do not knowingly collect data from anyone younger. If you believe a child has given us personal data, write to info@bitnoxsolution.com and we will delete it.",
        },
        {
          type: "paragraph",
          text: "Where a training course may be attended by somebody under 18, a parent or guardian must give consent at enrolment. Enrolment is handled on edu.bitnoxsolution.com under that site's terms.",
        },
      ],
    },
    {
      id: "transfers",
      title: "Data leaving Nigeria",
      blocks: [
        {
          type: "paragraph",
          text: "Some of the providers we depend on operate outside Nigeria, so personal data may be stored or processed abroad. Where that happens we make sure the recipient offers protection adequate under Nigerian law, that a data processing agreement with appropriate contractual safeguards is in place, and that the provider is contractually bound to NDPA standards.",
        },
      ],
    },
    {
      id: "third-parties",
      title: "Links to other sites",
      blocks: [
        {
          type: "paragraph",
          text: "This site links to the two sister Bitnox properties, edu.bitnoxsolution.com and cleaning.bitnoxsolution.com, and to third-party sites in blog posts and portfolio entries. Each operates under its own privacy policy, and a link is not an endorsement of how it handles data.",
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        {
          type: "paragraph",
          text: "We update this policy when our practices or the law change. The last updated date at the top of the page is when it last changed, and material changes are announced by email to anyone on the newsletter.",
        },
      ],
    },
    {
      id: "contact",
      title: "How to reach us about this",
      blocks: [
        {
          type: "paragraph",
          text: "Data protection questions and requests go to info@bitnoxsolution.com, or by post to the office address on the [contact page](/contact). Include enough detail for us to find the records you are asking about.",
        },
      ],
    },
  ],
};
