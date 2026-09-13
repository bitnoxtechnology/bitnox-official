import type { Block } from "@/lib/blog/blocks";

/**
 * The posts the blog launches with.
 *
 * A blog with nothing on it is worse than no blog: the nav promises writing, the index shows
 * an apology, and the service pages that draw their reading lists from tags render a heading
 * over an empty row. These nine exist so that none of that is true on day one.
 *
 * They are seeded by `npm run db:seed:blog` and are ordinary posts once they are in. Nothing
 * marks them as fixtures, nothing prevents them being edited in the admin, and the seed
 * script does not touch a post that already exists, so an edit made after seeding survives a
 * reseed.
 *
 * The tags are chosen against `blogTags` in `src/content/services.ts`, so each post appears
 * in the reading list on the service page it belongs to. All four services are covered, which
 * is the point of writing them before launch rather than after.
 *
 * `publishedAt` is written here rather than left to the seed run, because these were written
 * over a period and dating all nine to the afternoon the database was created would be a lie
 * the sitemap repeats. The array is in publication order, oldest first. The seed script also
 * backdates `createdAt` and `updatedAt` to the same moment, since `ArticleSchema` emits
 * `dateModified` whenever `updatedAt` is later than `publishedAt` and a post nobody has
 * edited should not claim it was revised on the day it was imported.
 *
 * What they do not do is invent evidence. There are no client names, no project counts and
 * no results attributed to work we have not published, because that is fabricated social
 * proof under the content standards. Every number in them is either a published threshold
 * anybody can check or a plainly stated range.
 */

export interface LaunchPost {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  /** ISO 8601, in the past. The date the post goes out under, not the date it is seeded. */
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  blocks: Block[];
}

export const LAUNCH_POSTS: readonly LaunchPost[] = [
  {
    title: "How a customer in Abeokuta actually finds your business on Google",
    slug: "how-customers-find-your-business-on-google",
    category: "Websites",
    tags: ["web-development", "seo"],
    publishedAt: "2025-06-03T08:20:00.000Z",
    excerpt:
      "Three businesses appear on the little map, and whoever is in it gets the call. Getting there is four or five things done consistently: a claimed listing, one address written the same way everywhere, service pages that name the town, and reviews you asked for in person.",
    seoTitle: "How Customers Find Your Business on Google Locally",
    seoDescription:
      "What decides the map results in a local search: a claimed Business Profile, one consistent address, service pages that name the town, and reviews you asked for.",
    blocks: [
      {
        type: "paragraph",
        text: "Somebody in Abeokuta needs a printer repaired. They pick up a phone and type printer repair near me. Three businesses appear on a small map, then a list of blue links underneath. Whoever is in that map gets the call, and most of the time nobody below it is rung at all.",
      },
      {
        type: "paragraph",
        text: "Getting into that map is not luck and there is no secret to it. It is four or five things done consistently, and a small business can do most of them without paying anybody.",
      },
      { type: "heading", level: 2, text: "The map and the links are two different competitions" },
      {
        type: "paragraph",
        text: "The map results come from a Google Business Profile, which is a listing rather than a website. The blue links come from your pages. They are ranked on different signals, they are won in different ways, and a business can be first in one and invisible in the other.",
      },
      {
        type: "paragraph",
        text: "For a local trade, the map is worth more. It carries the phone number, the directions and the opening hours, which is everything somebody standing in the street needs. The website is what makes the listing believable, and it is where a search that is not local lands: the buyer in Lagos comparing three suppliers before ringing any of them.",
      },
      { type: "heading", level: 2, text: "The listing: claimed, complete and current" },
      {
        type: "paragraph",
        text: "Most of the ground is made up here, and none of it is technical.",
      },
      {
        type: "bulletList",
        items: [
          "**Claim it.** A listing can exist without you. If one has been created from public information and nobody has signed in, anybody can suggest an edit and Google may publish what they wrote.",
          "**Pick the category a customer would use**, not the one you use in a proposal. People search for what they want done, not for the name of your discipline.",
          "**Set the opening hours, including the days you are closed.** A listing that says open while the door is locked earns a review that says so.",
          "**Photographs of the actual place.** The front of the building so it can be found from the street, the inside, the work. A profile with a logo and nothing else reads as abandoned.",
          "**Answer the questions.** Anybody can post one on a listing, and anybody can answer it. Better it is you.",
        ],
      },
      { type: "heading", level: 2, text: "Write the address once, then never vary it" },
      {
        type: "paragraph",
        text: "Name, address and phone number have to match between the listing, the site, the footer, the invoice and any directory that carries you. Search engines read all of them and treat agreement as confirmation. Two spellings of the same street look like two businesses, and confidence in both of them falls.",
      },
      {
        type: "paragraph",
        text: "Ours reads:",
      },
      {
        type: "blockquote",
        text: "24 Last Floor, Majek Kembo Plaza, beside Chicken Republic, Lalubu Street, Oke-Ilewo, Abeokuta, Ogun State, Nigeria. +234 813 719 2766.",
      },
      {
        type: "paragraph",
        text: "That exact wording is on the [contact page](/contact), in the footer of every page, in the structured data the pages carry and on the profile itself. Deciding the wording once and then copying it is the whole technique. The hard part is remembering to copy it in two years, when a new flyer is designed and somebody abbreviates the street.",
      },
      { type: "heading", level: 2, text: "What the website has to do" },
      {
        type: "paragraph",
        text: "Five things, in rough order of how much they matter.",
      },
      {
        type: "orderedList",
        items: [
          "Name the place in the page title and in the first heading. Web development in Abeokuta is a search that people run. Our services is not.",
          "One page per service rather than one page listing all of them. Somebody searching for a single service should land on a page about that one thing, which is why ours are split across [/services](/services).",
          "The address as text on the page, not only inside an image or a map embed. Text is what gets read and matched against the listing.",
          "A phone number that is a link on a phone, and an email address that is not hidden behind a form.",
          "Photographs of your own premises and your own work. Stock pictures of somebody else's office in a country you have never visited say nothing about you.",
        ],
      },
      {
        type: "paragraph",
        text: "Structured data is worth adding on top: a small block of machine-readable JSON stating the address, the hours and the coordinates so nothing has to be inferred from prose. It does not raise a ranking by itself. It removes ambiguity, and a local result is decided largely on how little doubt there is.",
      },
      { type: "heading", level: 2, text: "Reviews, asked for rather than bought" },
      {
        type: "paragraph",
        text: "Reviews move the local ranking, and then they move the decision that follows the ranking. The way to get them is to ask at the moment the work is finished and the customer is pleased, in person, with the link already open on your phone. That is a habit rather than a campaign, and it is why the businesses with the most reviews are rarely the biggest ones.",
      },
      {
        type: "paragraph",
        text: "Do not buy them. Bought reviews arrive in a batch, from accounts with no history, praising a business in language nobody uses. That is the exact pattern the filters exist to catch, and the profile that suffers is yours.",
      },
      {
        type: "paragraph",
        text: "Reply to the poor ones plainly and in public, without arguing. The reply is not written for the person complaining. It is written for the next customer, who is reading both.",
      },
      { type: "heading", level: 2, text: "What does not work" },
      {
        type: "bulletList",
        items: [
          "A footer listing thirty towns you have never worked in.",
          "Repeating a phrase until the sentence reads badly. Search engines stopped rewarding that a long time ago. Readers never did.",
          "Several listings for one address, created by different staff over the years. Find them, claim them, and have the duplicates merged.",
          "A page per town, made by copying one page and swapping the name. It is obvious to a person and it is obvious to a crawler.",
        ],
      },
      { type: "heading", level: 2, text: "It is slow, which is the reason to start" },
      {
        type: "paragraph",
        text: "A listing that has been complete, consistent and reviewed for a year beats one that was tidied up last week. Nothing here produces a result on Friday. All of it compounds, and the businesses that do well in local search are usually the ones that did the boring part earlier than their competitors.",
      },
      {
        type: "paragraph",
        text: "Search is a large part of why the sites we build are shaped the way they are, and the detail is on the [web development](/services/web-development) page. If you would rather have somebody look at what your listing and your pages currently say about you, [send us the address](/contact) and we will tell you what we would fix first.",
      },
    ],
  },

  {
    title: "What you should own when a software project ends",
    slug: "what-you-should-own-when-a-project-ends",
    category: "Software",
    tags: ["software-development", "custom-software", "business-systems"],
    publishedAt: "2025-06-19T10:05:00.000Z",
    excerpt:
      "A business rings us wanting a small change, and finds out its domain is registered to a developer nobody can reach. The five accounts that should be in the business name, what a real handover contains, and what to do if you are already locked out.",
    seoTitle: "What You Should Own When a Software Project Ends",
    seoDescription:
      "The domain, hosting, code, service accounts and data belong in the business name. What a proper handover contains, and what to do if you are already locked out.",
    blocks: [
      {
        type: "paragraph",
        text: "A business rings us because it wants one change made to its website. A price has gone up, or a phone number has changed. The person who built the site three years ago is not answering, and the number we are given rings out.",
      },
      {
        type: "paragraph",
        text: "Then the real problem appears. The domain is registered in that developer's personal account. The hosting is on their reseller plan, paid by them and invoiced to the business as a yearly fee. The code, if it exists anywhere outside the live server, is on a laptop we cannot see. The business has been paying for something it does not own for three years, and nobody was hiding it. It was just never written down.",
      },
      { type: "heading", level: 2, text: "The five accounts that belong to the business" },
      {
        type: "orderedList",
        items: [
          "**The domain.** Registered to the business, with a business email address as the contact, in an account somebody at the business can sign into. This is the most important line on the page. A site can be rebuilt and a server can be replaced, but a domain you do not control takes the website and every email address with it.",
          "**The hosting or server account.** In your name, paid on your card. A developer's reseller account means your site lives inside somebody else's bill, and it stops when that bill does.",
          "**The code.** In a repository owned by a business account, with the developer invited to it, rather than the other way round. The history matters as much as the current state, since it is what makes the next developer cheaper than the last one.",
          "**The third-party services.** Payment gateway, mail sending, maps, analytics, SMS, error reporting. Each signed up with a business address rather than a personal one, because each is a way back into the system.",
          "**The data.** Customers, orders, posts, files. With a documented way to take a full copy out, and at least one copy that has actually been taken and opened.",
        ],
      },
      { type: "heading", level: 2, text: "Access is not the same as ownership" },
      {
        type: "paragraph",
        text: "An admin login to your own website is access. It can be revoked by whoever owns the account above it, and it disappears when a relationship ends badly or when a person stops replying. Ownership is the account the bill is attached to and the email address the password reset goes to.",
      },
      {
        type: "paragraph",
        text: "The order to set this up in is simple and it only works before the work starts. The business opens the accounts. The business pays for them. The developer is added to each one with the access they need. When the project ends, that access is removed in an afternoon, and nothing else has to happen.",
      },
      { type: "heading", level: 2, text: "What a handover actually contains" },
      {
        type: "paragraph",
        text: "Not a phone call and a folder of screenshots. Six things, and they are the same six every time.",
      },
      {
        type: "bulletList",
        items: [
          "A list of every account, what it is for, who pays it, and the date it renews.",
          "The credentials, moved into the business's password manager rather than sent in a chat message that stays there for the rest of time.",
          "The repository, with its history, and a short file explaining how to run the project on a new machine.",
          "How a change reaches the live site: where it is deployed, what triggers it, and what to check when it will not start.",
          "A copy of the database and the uploaded files, plus the one command that produces the next copy.",
          "Anything that expires: the domain, the TLS certificate, API keys with an end date, a paid plan that will lapse.",
        ],
      },
      {
        type: "paragraph",
        text: "That is half a day of work at the end of a project. It is the difference between a business that can hire anybody next time and a business that has to go back to whoever built it, at whatever price is quoted.",
      },
      { type: "heading", level: 2, text: "Ask for it before anybody writes code" },
      {
        type: "paragraph",
        text: "Put it in the scope. One paragraph is enough: the accounts are opened in the client's name, the repository belongs to the client, and the handover pack above is delivered before the final payment. Any developer working straightforwardly will agree to that without a pause, because it costs them nothing and they were going to do it anyway.",
      },
      {
        type: "paragraph",
        text: "A refusal, or a long explanation of why it is simpler their way, is information. It is usually about keeping the maintenance work rather than about anything technical. Simpler is a fair reason to hold accounts during a build. It is not a reason to hold them afterwards.",
      },
      { type: "heading", level: 2, text: "If you are already locked out" },
      {
        type: "paragraph",
        text: "It happens often enough that there is a standard order to work through.",
      },
      {
        type: "orderedList",
        items: [
          "Start with the registrar rather than the developer. Registrars have a dispute process, and a business that can show its registration documents, its payment history and the original correspondence has a real claim to a domain registered on its behalf.",
          "Gather the payment records first. Whoever has been paying the invoices for five years is in a much stronger position than whoever remembers a conversation.",
          "Assume the rest can be rebuilt. Text and images can be recovered from the live site and from the Internet Archive. A design can be redrawn. It is annoying and it has a cost, but it is bounded.",
          "Change the order next time. The domain is registered in your name, in your account, before a single line of code is written.",
        ],
      },
      {
        type: "blockquote",
        text: "A handover is not a document produced at the end of a project. It is a set of accounts opened correctly at the beginning of one.",
      },
      {
        type: "paragraph",
        text: "We put the handover in the scope of every build, because a system a client cannot walk away with is not finished work. What that covers is on the [software development](/services/software-development) page. If you are in the middle of this now, [tell us what you can and cannot sign into](/contact) and we will tell you what is recoverable.",
      },
    ],
  },

  {
    title: "How a small business loses money to a hacked email account",
    slug: "how-a-business-loses-money-to-a-hacked-email",
    category: "Security",
    tags: ["it-consulting", "cybersecurity"],
    publishedAt: "2025-07-08T07:45:00.000Z",
    excerpt:
      "The invoice comes from your supplier, in the same thread as last month, with the same signature. One line has changed. Nobody broke into a bank: somebody read a mailbox for a month first. How it works, and the controls that stop it.",
    seoTitle: "How a Business Loses Money to a Hacked Email",
    seoDescription:
      "Invoice fraud starts with a mailbox somebody read for a month. How the account is taken, what the attacker does next, and the controls that actually stop it.",
    blocks: [
      {
        type: "paragraph",
        text: "The invoice looks right. It comes from the supplier you have used for two years, inside the same email thread as last month's, with the same signature block and the same reference format. One line has changed: the account number, with a short note saying the old bank is giving them trouble. The payment goes out. Five weeks later the supplier asks why they have not been paid.",
      },
      {
        type: "paragraph",
        text: "Nobody broke into a bank. Somebody read email for a month, and then sent one message at the right time.",
      },
      { type: "heading", level: 2, text: "How the mailbox is taken" },
      {
        type: "bulletList",
        items: [
          "**A password used somewhere else.** A shopping site or a forum is breached, the list of addresses and passwords is published, and trying those pairs against major email providers is automatic and free.",
          "**A sign-in page that was not the sign-in page.** A message about a delivery, a shared document or a mailbox that is nearly full, leading to a page that looks exactly right and records what is typed into it.",
          "**No second factor,** so the password was the only thing between a stranger and two years of correspondence.",
        ],
      },
      {
        type: "paragraph",
        text: "None of that requires skill or a target. It is run at scale against everybody, and a small business in Ogun State is caught by the same net as a company in Manchester. What follows is the part that is done by hand, because it is worth the time.",
      },
      { type: "heading", level: 2, text: "What happens next is patience" },
      {
        type: "paragraph",
        text: "The valuable thing about a compromised mailbox is not the ability to send from it. It is the ability to read it. So nothing happens at first. A rule is created quietly, moving anything containing the word invoice or payment into a folder nobody looks at, or forwarding a copy out of the business. Then the reading starts: who the suppliers are, what the payment terms are, what the amounts look like, how the accounts clerk writes, and which week of the month the transfers go out.",
      },
      {
        type: "paragraph",
        text: "The message, when it comes, is written into a real thread by somebody who has read the previous twenty. That is why this works on careful people. There is nothing to notice. The tone is right, the reference is right, the timing is right, and the only wrong thing is ten digits that nobody had a reason to compare.",
      },
      { type: "heading", level: 2, text: "The controls that stop it" },
      {
        type: "paragraph",
        text: "In order, because the first one does most of the work.",
      },
      {
        type: "orderedList",
        items: [
          "**Two-factor authentication on email, before anything else.** Email is the account that resets every other account, so it is protected first, ahead of the bank. Use an authenticator app or a hardware key rather than SMS, since a phone number can be moved to a new SIM by somebody who is patient at a shop counter.",
          "**A different password everywhere,** which in practice means a password manager the whole team uses. The point is not strength. The point is that a breach somewhere else stops being your problem.",
          "**One rule about bank details, applied to everybody.** Any change to an account number is confirmed by ringing the number you already have on file, not a number in the message. Write it down. It applies to the owner as well, and it is worth more than any software on this list.",
          "**A second pair of eyes above a figure you choose.** The figure matters less than the fact that one person cannot move money on the strength of one email.",
          "**Read the address, not the display name.** A lookalike domain with one letter changed passes at a glance every time, and the display name is whatever the sender typed.",
        ],
      },
      { type: "heading", level: 2, text: "The ten minute check on a mailbox" },
      {
        type: "paragraph",
        text: "Do this today on the owner's mailbox and on whichever mailbox receives invoices. Four things, in the settings.",
      },
      {
        type: "bulletList",
        items: [
          "Rules and filters. Anything forwarding mail outside the business, or moving messages into a folder based on a word like invoice, payment or transfer.",
          "Recent sign-in activity. Places, devices and times that make no sense for your staff.",
          "Connected applications and app passwords, which are the usual way access survives a password change.",
          "The recovery phone number and recovery email address on the account. If either has been altered, the account is not yours yet even if you can sign in.",
        ],
      },
      { type: "heading", level: 2, text: "If it has already happened" },
      {
        type: "orderedList",
        items: [
          "Change the password, then sign every session out. In that order, or the open sessions carry on.",
          "Delete the rules that were created, then check the list again the following day.",
          "Tell the bank immediately. Recovering a transfer is measured in hours, and by the second day it is usually gone.",
          "Warn everybody who was in the affected threads, from a different account, and by phone where money was involved. Their mailbox may be the next one read.",
          "Keep the evidence. The message headers, the rules, the sign-in log. Do not delete the mailbox to feel clean, because that is the only record of what was taken.",
        ],
      },
      {
        type: "blockquote",
        text: "The businesses this happens to are not careless. They are busy, and the message arrived on the day the payment was due.",
      },
      {
        type: "paragraph",
        text: "An access review is the first thing we do on an [IT consulting](/services/it-consulting) engagement, before anything is bought or replaced, because the findings are usually free to fix and they are where the real risk sits for a business of this size. If you would rather have somebody run it with you and put the results in writing, [tell us what you use](/contact).",
      },
    ],
  },

  {
    title: "What we teach in the first week, and why it is not a programming language",
    slug: "what-we-teach-in-the-first-week",
    category: "Training",
    tags: ["training", "technology-training", "careers"],
    publishedAt: "2025-07-24T09:30:00.000Z",
    excerpt:
      "People arrive at a course with a language in mind. The first week goes somewhere else: where files are, what the terminal is for, how to read an error message, and how to undo a mistake. Everything after it is faster when the machine is not a mystery.",
    seoTitle: "What We Teach in the First Week of a Course",
    seoDescription:
      "Files, the terminal, reading an error message and version control come before any language. What the first week of technology training in Abeokuta covers.",
    blocks: [
      {
        type: "paragraph",
        text: "People arrive at a course with a language in mind. They want Python, or JavaScript, or whatever a friend told them pays well. That is a reasonable place to start from, and it is not where the first week goes.",
      },
      {
        type: "paragraph",
        text: "The first week is about the machine. Not because syntax is hard, but because almost everybody who gets stuck in month two is stuck on something that was never taught in month one.",
      },
      { type: "heading", level: 2, text: "Where files actually are" },
      {
        type: "paragraph",
        text: "A large number of people who use a computer every day cannot say where a file they saved has gone. It is in Downloads, or it is in the app, or it is on the desktop. That is enough to write a letter. It is not enough to follow an instruction that says open a terminal in the project directory, and that instruction appears on the first page of every guide the student will read for the next two years.",
      },
      {
        type: "paragraph",
        text: "So we start there. A folder is a path. A path is text that can be typed. Downloads is an ordinary folder with an ordinary name. A file extension is part of the name and can be seen if the setting hiding it is turned off, which is the first setting we change on every machine in the room. None of this is exciting and all of it removes a category of problem permanently.",
      },
      { type: "heading", level: 2, text: "The terminal, early" },
      {
        type: "paragraph",
        text: "Not because it looks impressive, but because every tool assumes it. Installing something, starting a project, saving work to version control, putting a site online: all of it happens at a prompt. Six commands cover most of the first month.",
      },
      {
        type: "code",
        language: "bash",
        code: "pwd                    # which folder am I in\nls                     # what is in it\ncd projects/shop-site  # move into one\ncd ..                  # move back out\nmkdir invoices         # make a folder\ncp report.csv backup/  # copy a file into another folder",
      },
      {
        type: "paragraph",
        text: "A student who can move around a machine at a prompt stops being dependent on a particular editor, a particular operating system or a particular tutorial. That independence is most of what a course is buying them.",
      },
      { type: "heading", level: 2, text: "Reading an error message" },
      {
        type: "paragraph",
        text: "The clearest difference between a student who progresses and one who stalls is what they do in the ten seconds after something goes wrong. One reads the message. The other takes a screenshot and waits for help.",
      },
      {
        type: "paragraph",
        text: "So we teach the shape of an error before there is much code to break: what failed, in which file, on which line, and what it expected instead. We break things on purpose and read the output together. Somewhere in the second week the question changes from it is not working to it says it cannot find this file, and I think that is because I renamed the folder. At that point the student can be taught anything.",
      },
      { type: "heading", level: 2, text: "Version control before frameworks" },
      {
        type: "paragraph",
        text: "Git comes in early, in a small way: save a version, look at what changed, go back to yesterday, work on a copy without breaking the thing that works.",
      },
      {
        type: "paragraph",
        text: "The reason is confidence rather than process. A student who knows they can undo anything will try things, and trying things is how the subject is actually learned. A student who is one wrong keystroke away from losing a week of work is careful, and careful is slow.",
      },
      { type: "heading", level: 2, text: "Then the language, and then a brief" },
      {
        type: "paragraph",
        text: "By the time syntax starts, nothing about the environment is in the way, which means the language is the only new thing in the room. That is the point of the order.",
      },
      {
        type: "paragraph",
        text: "From there the work is projects rather than exercises: a brief, a deadline and a review where the code is read out loud and questioned. A tutorial followed to the end teaches typing. A brief with a deadline and somebody who will ask why you did it that way teaches building, which is the thing an employer is paying for.",
      },
      { type: "heading", level: 2, text: "What it asks of you, in hours" },
      {
        type: "paragraph",
        text: "The honest part, because it is the part that decides who finishes. A part-time course is a few evenings a week in class and roughly the same again alone, every week, for the length of the course. The students who do well are not the ones who arrive knowing the most. They are the ones who do the practice between sessions, which is unglamorous advice and remains true.",
      },
      {
        type: "paragraph",
        text: "If you cannot find those hours this quarter, take the course next quarter. Paying for a course you do not have time to attend is the most common way people waste money on training.",
      },
      { type: "heading", level: 2, text: "Where the courses are" },
      {
        type: "paragraph",
        text: "The catalogue, the dates, the fees and enrolment all live on [Bitnox Education](https://edu.bitnoxsolution.com). Classes run in our [Event Space](/event-space) in Abeokuta, which seats sixty and is set out for teaching rather than for sitting in rows behind a projector.",
      },
      {
        type: "paragraph",
        text: "For a team rather than an individual, the shape is different: the sessions are built around the systems you already run and the week you actually have. That side of it is on the [technology training](/services/technology-training) page, and if you would like it arranged, [tell us what the team does](/contact).",
      },
    ],
  },

  {
    title: "Buy it, build it, or fix what you have",
    slug: "buy-it-build-it-or-fix-what-you-have",
    category: "Software",
    tags: ["software-development", "custom-software", "technology-strategy"],
    publishedAt: "2026-01-22T08:15:00.000Z",
    excerpt:
      "Three options exist for nearly every software problem a business has, and most quotes price only one of them: the one the person quoting sells. When to buy, when to fix what is already there, when custom earns its cost, and the costs that never appear on the quote.",
    seoTitle: "Buy It, Build It, or Fix What You Have",
    seoDescription:
      "Three options exist for most software problems and most quotes price only one. When to buy, when to fix, when custom earns its cost, and the costs left off the quote.",
    blocks: [
      {
        type: "paragraph",
        text: "Three options are available for nearly every software problem a business has. Buy something that already exists. Build something specific. Or fix the thing that is already in use. Most quotes price exactly one of them, and it is usually the one the person quoting sells.",
      },
      {
        type: "paragraph",
        text: "Here is how we decide, including the cases where we tell somebody not to hire us.",
      },
      { type: "heading", level: 2, text: "Buy, when the problem is not only yours" },
      {
        type: "paragraph",
        text: "Accounting, payroll, email, document storage, a point of sale in a shop selling ordinary things. Thousands of businesses have the identical problem, somebody maintains an answer to it full time, and the version you buy has been tested by everybody who bought it before you.",
      },
      {
        type: "paragraph",
        text: "You are not only buying features. You are buying updates when the tax rules change, a support line, and the fact that nobody at your business has to think about it again. Custom software has none of those unless you pay for them separately, which is the cost people forget when they compare a monthly subscription against a one-off build.",
      },
      { type: "heading", level: 2, text: "Fix, when one part of it is wrong" },
      {
        type: "paragraph",
        text: "This is the most common honest answer and the least common quote. A business asks for a new system, and the audit finds nothing much wrong with what is in place except one workflow it does not cover. A spreadsheet grew beside it to handle that workflow, then a second one to reconcile the first, and after two years the whole thing feels broken.",
      },
      {
        type: "paragraph",
        text: "Fixing that is a fortnight of work: an export, an import, a small piece of software connecting two things that were never connected, or in some cases a settings change and an afternoon of training. It is the cheapest of the three options by a wide margin, and it is worth ruling out before anybody draws a new system.",
      },
      { type: "heading", level: 2, text: "Build, when the process is the business" },
      {
        type: "paragraph",
        text: "Custom earns its cost in one situation: your way of working is either the reason customers choose you, or unusual enough that no package models it without a spreadsheet appearing alongside. Distribution with different credit terms per customer. A school billing termly with instalments and part payments. A workshop quoting from parts and labour where the parts price moves weekly. A clinic that has to keep records for years in a specific form.",
      },
      {
        type: "paragraph",
        text: "In each of those the package either does not model the thing at all, or models it in a way that means somebody keeps a private copy of the truth. Then you have two systems instead of one, which is worse than the situation you started with.",
      },
      {
        type: "paragraph",
        text: "The test that settles most cases: if you changed the process to fit the package, would you be worse at the thing you are good at? If the answer is no, change the process. It is much cheaper and there is nothing embarrassing about it.",
      },
      { type: "heading", level: 2, text: "The costs that are not on the quote" },
      {
        type: "bulletList",
        items: [
          "**Migration.** Data that lives in four places has four spellings of the same customer name, and deciding which one is right is a business decision, not a technical one. It always takes longer than the estimate.",
          "**Integration.** Two systems that do not talk to each other produce a person whose job is partly retyping. That salary belongs in the comparison.",
          "**The dip.** Output falls for a fortnight after any change, whichever option you pick. Plan for it rather than being surprised by it in the middle of a busy month.",
          "**The second year.** A licence renews. Custom software needs hosting, updates and somebody to ring. Compare three years, not the first invoice.",
        ],
      },
      { type: "heading", level: 2, text: "Five questions that usually decide it" },
      {
        type: "orderedList",
        items: [
          "Can you name three other businesses with exactly this problem? If you can, somebody is already selling the answer.",
          "Is this process the reason customers choose you, or is it just how it has always been done here?",
          "What does the current situation cost in a month, counted in hours and in mistakes? If you cannot answer, measure that before spending anything.",
          "How many people need it at the same time, and are they in one building? Two people and one building is a much smaller problem than twenty and four.",
          "If the supplier disappeared in two years, what would you do? The answer changes both the choice and the terms you should be asking for.",
        ],
      },
      { type: "heading", level: 2, text: "The answer is usually a mixture" },
      {
        type: "paragraph",
        text: "Buy what is standard, build what is specific to you, and connect the two so that nothing is typed twice. That is what most of our [software development](/services/software-development) work looks like in practice, and it is why the first conversation is about the process rather than about the software.",
      },
      {
        type: "paragraph",
        text: "We say no to builds fairly often, and it is not modesty. A build that should have been a settings change is remembered as an expensive year. If you want the question answered before it becomes a quote, that is where an [IT consulting](/services/it-consulting) engagement starts: [tell us what the process is](/contact) and what is currently in the way.",
      },
    ],
  },

  {
    title: "The enquiries your website is quietly losing",
    slug: "enquiries-your-website-is-losing",
    category: "Websites",
    tags: ["web-development"],
    publishedAt: "2026-03-05T11:40:00.000Z",
    excerpt:
      "Two hundred people read the services page last month and the phone did not ring. Contact forms fail silently: where the messages go, the three DNS records that decide the spam folder, and how to test a form properly once a month.",
    seoTitle: "The Enquiries Your Website Is Quietly Losing",
    seoDescription:
      "Contact forms fail silently. Where the messages go, the three DNS records that decide the spam folder, and how to test a form properly once a month.",
    blocks: [
      {
        type: "paragraph",
        text: "A business tells us the website brings in nothing. The traffic report says two hundred people read the services page last month, and eleven of them opened the contact page. Somewhere between those two facts the messages are going missing, and the usual explanation is not that the market is slow.",
      },
      { type: "heading", level: 2, text: "Four ways a message disappears" },
      {
        type: "bulletList",
        items: [
          "**It was never sent.** The form shows a thank-you message written by the front end, and the send failed behind it. The visitor believes they made contact. Nothing happened at all.",
          "**It was sent and filed as spam,** because the site sends mail claiming to come from your domain and nothing published in your domain records says it is allowed to.",
          "**It arrived at an address nobody reads.** An info@ address set up during the build, forwarded to a person who left two years ago.",
          "**It arrived, and the reply took four days.** The enquiry was real, the visitor was comparing three businesses, and the other two answered on the same afternoon.",
        ],
      },
      {
        type: "paragraph",
        text: "Only the last one is a business problem. The other three are faults, and they are all invisible from the inside, which is why they can run for a year.",
      },
      { type: "heading", level: 2, text: "Test it rather than assuming it" },
      {
        type: "orderedList",
        items: [
          "Send a real enquiry from an address outside the business, from a phone, on mobile data. Not from the office machine and not while signed into anything.",
          "Check the inbox. Then check the spam folder. Then send a second one to an address on a different provider, because a message that arrives at one provider can be filtered by another.",
          "Time the reply. Whatever number comes out of that is the number the business is actually running, regardless of the one in the policy.",
          "Repeat it on the first of every month. Forms break silently after an update, a plugin change or a password rotation on a mail account, and nobody finds out from the outside.",
        ],
      },
      { type: "heading", level: 2, text: "The three records that decide the spam folder" },
      {
        type: "paragraph",
        text: "Mail sent by a website is mail sent on behalf of your domain by a machine that is not your mail server. Receiving servers decide what to do with that using three records published in DNS.",
      },
      {
        type: "paragraph",
        text: "SPF lists the servers allowed to send as your domain. DKIM signs each message with a key so it can be verified as unaltered. DMARC says what should happen to mail that fails either check, and asks for a report telling you how much of that there is.",
      },
      {
        type: "paragraph",
        text: "Finding out what is published today takes two commands.",
      },
      {
        type: "code",
        language: "bash",
        code: "# SPF, which lives on the domain itself\ndig +short TXT example.com\n\n# DMARC, which lives on a subdomain\ndig +short TXT _dmarc.example.com",
      },
      {
        type: "paragraph",
        text: "A domain with no SPF record returns nothing at all, which is the common case and the one that fills spam folders. A working record names every service allowed to send and ends in `-all`, along the lines of `v=spf1 include:_spf.google.com include:sendgrid.net -all`. Keep it to a single record, since two SPF records on one domain fail both.",
      },
      {
        type: "paragraph",
        text: "DKIM is a key your mail provider generates and hands you as a record to copy in, so there is nothing to invent there. DMARC starts at `v=DMARC1; p=none; rua=mailto:dmarc@example.com`, which changes no delivery and starts the reports arriving. Read a fortnight of them, fix whatever legitimate mail is failing, then move the policy to `quarantine`. Doing it in the other order is how a business stops its own invoices being delivered.",
      },
      {
        type: "paragraph",
        text: "One more thing that costs nothing: send the notification from an address at your own domain, and put the visitor's address in the reply-to field rather than the from field. Mail claiming to be from a stranger's Gmail account, sent by your server, is the exact shape of a forgery.",
      },
      { type: "heading", level: 2, text: "Store the enquiry, do not only email it" },
      {
        type: "paragraph",
        text: "Email is a notification. It is not a record. A form should write the enquiry to a database first and send the notification second, so a failed send costs you the alert rather than the customer.",
      },
      {
        type: "paragraph",
        text: "It also changes what the business can see. How many enquiries came in last month, which page they came from, how many are still unanswered, and how long a reply took on average. None of that can be answered by searching a mailbox, and all of it is ordinary once the enquiries live somewhere.",
      },
      { type: "heading", level: 2, text: "The form itself" },
      {
        type: "bulletList",
        items: [
          "Fewer fields. Every extra one costs completions, and most of what you want to know can be asked in the reply.",
          "Labels above the fields, not placeholder text that vanishes the moment somebody starts typing and cannot be checked before sending.",
          "Errors shown on the field that is wrong, in words, as the person leaves the field. Not a red banner at the top after everything has been cleared.",
          "A confirmation that says what happens next and by when, and repeats the address it was sent to.",
          "A phone number and an email address on the same page. Some people will never use a form, and they are frequently the ones ready to buy.",
        ],
      },
      {
        type: "paragraph",
        text: "Keep the spam defence invisible where you can. A puzzle that takes four attempts on a phone stops as many customers as robots, and the businesses with the strictest checks tend to be the ones with the fewest enquiries.",
      },
      { type: "heading", level: 2, text: "Speed of reply is part of the build" },
      {
        type: "paragraph",
        text: "State a reply time you can keep and then keep it. Ours is one to two working days, which is written on the [contact page](/contact) because a stated time that is honoured is worth more than a faster one that is not.",
      },
      {
        type: "paragraph",
        text: "Every site we build stores enquiries in an inbox in the admin as well as sending the email, for the reasons above. That is part of what the [web development](/services/web-development) page describes. If your form has not been tested since the day it launched, [send us the address](/contact) and we will put a test enquiry through it and tell you where it ended up.",
      },
    ],
  },

  {
    title: "What to move to the cloud, and what to leave where it is",
    slug: "what-to-move-to-the-cloud",
    category: "Strategy",
    tags: ["it-consulting", "technology-strategy"],
    publishedAt: "2026-04-30T07:55:00.000Z",
    excerpt:
      "Cloud is a change in who runs the machine, not a change in whether you need one. Backups, email and the website move first. Hardware-tied systems and anything that has to work during an outage do not. What it does to your bill, your connection and your exit.",
    seoTitle: "What to Move to the Cloud, and What to Leave",
    seoDescription:
      "Backups, email and the website move first. Hardware-tied systems and offline work stay. What changes about your bill, your connection and your ability to leave.",
    blocks: [
      {
        type: "paragraph",
        text: "Moving to the cloud is a change in who runs the machine. It is not a change in whether you need one, and it is not automatically cheaper or safer. Sometimes it is clearly worth paying for and sometimes it is clearly not, and the answer is different for each system rather than for the business as a whole.",
      },
      {
        type: "paragraph",
        text: "In Abeokuta the sum has two terms that a template written elsewhere leaves out: mains power and the internet connection. Both belong in the decision.",
      },
      { type: "heading", level: 2, text: "What you are actually buying" },
      {
        type: "bulletList",
        items: [
          "Somebody else's power, cooling and hardware replacement, which in a Nigerian office is a real line item rather than a footnote.",
          "Capacity you can change in a day instead of ordering a machine and waiting for it to clear.",
          "A monthly cost in place of a capital purchase you depreciate over five years.",
          "Somebody to ring at two in the morning, if the plan you chose includes that. Many do not.",
        ],
      },
      {
        type: "paragraph",
        text: "What you are not buying is safety. A server in a data centre with no backups is exactly as lost as a server under a desk with no backups. Where the machine sits and whether the data survives are separate questions, and only one of them is answered by moving.",
      },
      { type: "heading", level: 2, text: "Move these first" },
      {
        type: "orderedList",
        items: [
          "**Backups.** The copy that is somewhere else is the copy that survives a fire, a theft or a flood. If you do only one thing on this page, do this one.",
          "**Email.** Rarely worth running yourself. Getting mail delivered rather than filtered is a full-time discipline, and a provider does it for the price of a coffee per person.",
          "**The website.** Pages generated ahead of time and served from a network with points around the world reach your visitors faster than a machine in the office ever will, and it takes the traffic off your connection.",
          "**Shared documents.** Two people editing one file was the problem, and it was solved a decade ago. The version named final-updated-2 is a symptom worth curing.",
        ],
      },
      { type: "heading", level: 2, text: "Think harder about these" },
      {
        type: "bulletList",
        items: [
          "Work that moves large files all day: video, photography sets, drawings. The upload is the bottleneck and upload is the slower direction on most connections here.",
          "Anything wired to hardware. A point of sale, a card machine, cameras, a machine on the workshop floor. Putting the brain in another country and leaving the hands in the building is a decision to make deliberately.",
          "Anything that has to work while the connection is down. If the shop cannot sell during an outage, the till does not belong entirely online.",
          "Records you are obliged to keep for a set number of years. Keep a copy you hold yourself, whatever the supplier promises.",
        ],
      },
      { type: "heading", level: 2, text: "The connection becomes the single point of failure" },
      {
        type: "paragraph",
        text: "Once the systems are elsewhere, an internet outage stops being an inconvenience and becomes a closure. Two things follow from that.",
      },
      {
        type: "paragraph",
        text: "The first is a second connection from a different provider, ideally not arriving by the same road or the same mast, with a router that fails over without somebody typing a password. The second is an honest answer to how long the business can trade with no connection at all. Write the answer down. If it is zero, that decides which systems keep a local mode, and it is cheaper to decide now than during the outage.",
      },
      { type: "heading", level: 2, text: "The bill changes shape" },
      {
        type: "paragraph",
        text: "A purchase becomes a subscription, which is easier on the first year and different afterwards. Two things to check before signing.",
      },
      {
        type: "bulletList",
        items: [
          "What is metered. Storage is usually cheap and predictable. Data leaving the service, and per-user pricing, are the two lines that grow in ways people did not plan for.",
          "What it looks like at twice your current headcount. A price per person is a hiring cost, and it should be modelled at the size you are aiming for rather than the size you are.",
        ],
      },
      { type: "heading", level: 2, text: "Leaving is a feature, so test it first" },
      {
        type: "paragraph",
        text: "Before you move a system, find the export. Not the promise of an export in the documentation, the actual button or command. Run it once, open the file, and confirm it contains what you would need to start again somewhere else.",
      },
      {
        type: "paragraph",
        text: "A supplier who cannot produce your data in a format you can read is selling you a lock as well as a service. The time to discover that is before the data is theirs.",
      },
      { type: "heading", level: 2, text: "A sensible order" },
      {
        type: "paragraph",
        text: "Backups, then email, then the website, then documents, then everything else case by case. One at a time, with a fortnight between each, so that when something goes wrong you already know which change caused it. A weekend where four systems move at once is a weekend nobody in the business remembers fondly.",
      },
      {
        type: "paragraph",
        text: "Working out which of your systems belong in which list is most of what an [IT consulting](/services/it-consulting) engagement does in its first fortnight. If a decision like this is in front of you now, [tell us what you run](/contact) and we will tell you what we would move first.",
      },
    ],
  },

  {
    title: "What an online store needs before it takes the first order",
    slug: "what-an-online-store-needs-first",
    category: "Websites",
    tags: ["web-development", "e-commerce"],
    publishedAt: "2026-06-17T10:25:00.000Z",
    excerpt:
      "The storefront is the visible half of an e-commerce build and the easier one. What decides whether the business enjoys running it is everything between somebody paying and somebody receiving a parcel. The list we work through before a store opens.",
    seoTitle: "What an Online Store Needs Before the First Order",
    seoDescription:
      "The order flow, server-side payment checks, delivery zones, stock that matches the shelf, and the policies to write before an e-commerce site opens.",
    blocks: [
      {
        type: "paragraph",
        text: "The storefront is the visible half of an e-commerce project and the easier one. What decides whether the business enjoys running the store is everything that happens between somebody paying and somebody receiving a parcel, and almost none of it is on the screen the customer sees.",
      },
      {
        type: "paragraph",
        text: "This is the list we work through before a store opens.",
      },
      { type: "heading", level: 2, text: "Write down what happens after the payment" },
      {
        type: "orderedList",
        items: [
          "The order is recorded with a reference the customer can quote on the phone.",
          "The customer receives a confirmation showing what they bought, what it cost and when it should arrive.",
          "Somebody is told there is an order to pack, in a way that does not depend on a person refreshing a page.",
          "Stock comes down, in whichever system holds the real count.",
          "The parcel goes out with a tracking reference, and the customer is told it has.",
          "Delivery is recorded, so a dispute two weeks later has an answer.",
        ],
      },
      {
        type: "paragraph",
        text: "Each line is a decision about who does it and what they use to do it. A store that opens before those answers exist runs on a chat group for its first month, and the first disputed order is the day everybody finds out that nothing was written down.",
      },
      { type: "heading", level: 2, text: "Payments: trust the server, never the browser" },
      {
        type: "paragraph",
        text: "Take card payments through a gateway with an account registered to the business. The important part is what marks an order as paid. The confirmation must reach your server from the gateway, not from the page the customer is looking at, because a success page can be opened by anybody who knows the address.",
      },
      {
        type: "code",
        language: "js",
        code: '// The gateway posts here once it has taken the money. Check the signature before\n// anything is marked paid: this address is public and anybody can post to it.\nconst expected = crypto\n  .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)\n  .update(rawBody)\n  .digest("hex");\n\nif (expected !== request.headers["x-paystack-signature"]) {\n  return new Response("Ignored", { status: 401 });\n}',
      },
      {
        type: "paragraph",
        text: "Bank transfer is still how a large share of orders are paid here, and it needs the same discipline in a manual form. An order stays unpaid until somebody has matched it against the account statement. A screenshot is not a match, and the person packing parcels should not be the person deciding what counts as proof.",
      },
      { type: "heading", level: 2, text: "Delivery, priced before launch" },
      {
        type: "bulletList",
        items: [
          "Zones and prices agreed with the courier you will actually use, before the checkout is asked to quote them.",
          "Collection as an option. A meaningful number of buyers will come to you if you let them, and it is the cheapest delivery there is.",
          "A rule for the parcel nobody collects: how long it waits, who is chased, and who carries the cost.",
          "Delivery times written as a range in working days per zone, chosen so you can keep it in a bad week rather than a good one.",
        ],
      },
      { type: "heading", level: 2, text: "Stock that matches the shelf" },
      {
        type: "paragraph",
        text: "One count, in one place. If the shop counter and the website each keep their own number, the website will oversell something within a month, and the apology costs more than the sale was worth.",
      },
      {
        type: "paragraph",
        text: "Decide which system holds the truth and make the other read from it. If that connection is not possible yet, hold a buffer: mark an item unavailable while the count is still above zero, so the last few on the shelf are sold in person where the count can be seen.",
      },
      { type: "heading", level: 2, text: "Write the policies before you need them" },
      {
        type: "bulletList",
        items: [
          "How long a customer has to return something, and in what condition.",
          "Who pays for return delivery, and whether that differs when the fault is yours.",
          "How a refund is made and how long it takes to appear.",
          "What happens to a parcel that arrives damaged, and what evidence you ask for.",
          "Whether an order can be cancelled before dispatch, and how.",
        ],
      },
      {
        type: "paragraph",
        text: "These pages are read by buyers deciding whether to trust a store they have never used, so plain wording is worth more than legal padding. A returns page that a person can understand in thirty seconds sells more than a page of clauses copied from somewhere else.",
      },
      { type: "heading", level: 2, text: "Product pages that can be found" },
      {
        type: "bulletList",
        items: [
          "One page per product, with its own address, its own title and its own description. Products that exist only behind a search box with no address of their own cannot be found by anybody who is not already on your site.",
          "Several real photographs, including one that shows scale. A single supplier image is the same picture your competitors are using.",
          "Descriptions written in the words a buyer would type, including the local name for the thing where there is one.",
          "Product structured data, so availability and the price shown in a search result match the page.",
        ],
      },
      { type: "heading", level: 2, text: "Then buy something from yourself" },
      {
        type: "paragraph",
        text: "Before launch, place a real order with a real card, from a phone, on mobile data, and take it the whole way: confirmation, packing, dispatch, delivery, then a refund. Every store we launch has had at least one order placed by the person who owns it, because the first person to find the broken step should not be a customer.",
      },
      {
        type: "blockquote",
        text: "A store is not finished when it can take an order. It is finished when somebody in the building knows exactly what to do with one.",
      },
      {
        type: "paragraph",
        text: "What a store build includes is set out on the [web development](/services/web-development) page, and there are finished projects on the [portfolio](/portfolio). If you are planning one, [tell us what you sell and how it reaches people](/contact) and we will tell you which parts of this list are already decided for you.",
      },
    ],
  },

  {
    title: "Training a team on software they did not ask for",
    slug: "training-a-team-on-new-software",
    category: "Training",
    tags: ["training", "technology-training", "business-systems"],
    publishedAt: "2026-08-11T09:10:00.000Z",
    excerpt:
      "The system is live and the notebook is still behind the counter. Why the old method survives a new build, how to train people on their own work rather than on demo data, and the four signs in week three that something needs changing.",
    seoTitle: "Training a Team on Software They Did Not Ask For",
    seoDescription:
      "Why the notebook survives a new system, how to train on real work, the page per role that people actually read, and the signs in week three that something is wrong.",
    blocks: [
      {
        type: "paragraph",
        text: "The system is live, and the notebook is still behind the counter. Two weeks after launching something that took three months to build, half the team is entering everything twice and the other half is waiting to see which way it goes. This is the ordinary result of a good build with no plan for the people who have to use it.",
      },
      { type: "heading", level: 2, text: "Why the old method survives" },
      {
        type: "bulletList",
        items: [
          "**It is faster for them today.** The notebook takes four seconds. The form takes forty, until the fortieth time.",
          "**Nobody has said what happens if they get it wrong.** A mistake in a notebook is crossed out. A mistake in a system feels permanent and attributable, and people avoid tools that can blame them.",
          "**It asks for information they do not have yet.** A required field they cannot fill at the moment they are asked to fill it makes the whole screen unusable, so they wait, and waiting becomes a pile.",
          "**Somebody senior still asks for the old report.** As long as the old report has to exist, the old process has to exist to produce it.",
        ],
      },
      {
        type: "paragraph",
        text: "Only the first of those is about training. The rest are about the system or the manager, which is why a training day on its own so rarely changes anything.",
      },
      { type: "heading", level: 2, text: "Train on their own work" },
      {
        type: "paragraph",
        text: "Demo data teaches nothing, because the difficulty was never the buttons. It was the awkward cases: the customer who pays in three parts, the order that came in by phone, the return without a receipt.",
      },
      {
        type: "paragraph",
        text: "So the session is the last three days of real work, entered by the people who did it. Every awkward case appears within the first hour, and each one is either answered on the spot or written on the list of things to change. That list is the most valuable thing produced by a launch and it only exists if the training used real work.",
      },
      { type: "heading", level: 2, text: "One person per team, taught a week early" },
      {
        type: "paragraph",
        text: "Choose somebody who does the job rather than the most senior person in the room, and teach them properly before everybody else. Not as a reward, and not as a title.",
      },
      {
        type: "paragraph",
        text: "The reason is plain: people will ask a colleague at the next desk something they would never ask a consultant or a manager. A question asked out loud on day three is a workaround that never gets invented, and workarounds invented in the first fortnight tend to still be there a year later.",
      },
      { type: "heading", level: 2, text: "A page per role, not a manual" },
      {
        type: "paragraph",
        text: "Nobody reads forty pages. One side of paper per role, listing the five things that person actually does, with the exact steps and one picture each. Printed and put up where the work happens, not saved in a shared folder.",
      },
      {
        type: "paragraph",
        text: "It has to be short enough that updating it is not a project, because the software will change and a guide that no longer matches the screen teaches people to ignore guides.",
      },
      { type: "heading", level: 2, text: "Run both, then stop, on a date everybody knows" },
      {
        type: "paragraph",
        text: "Parallel running is sensible for a fortnight and corrosive after a month. While both exist, neither is trusted, everybody works twice, and the two records drift apart until somebody has to decide which one is real.",
      },
      {
        type: "paragraph",
        text: "Name the date the old method stops before the new one starts. Put it where everybody can see it. Tell the person who asks for the old report, because that is the request that quietly keeps the old system alive after everybody else has moved on.",
      },
      { type: "heading", level: 2, text: "Look at week three, not week one" },
      {
        type: "paragraph",
        text: "Week one is nerves and best behaviour. Week three is the truth. Four things to look for.",
      },
      {
        type: "bulletList",
        items: [
          "A field that everybody leaves blank. Either it is not needed, or it is being asked for at the wrong moment in the day.",
          "Notes typed into a description box that should be a field of their own, which is people telling you what the system is missing.",
          "A spreadsheet that has quietly come back.",
          "One person entering everything because the others have started funnelling their work through them. That is a queue, and it will be blamed on the software.",
        ],
      },
      {
        type: "paragraph",
        text: "Each of those is a change worth making, and each is cheap in the first month. After a year of data has been entered around a problem, fixing it means fixing the data too.",
      },
      { type: "heading", level: 2, text: "How we handle it" },
      {
        type: "paragraph",
        text: "Training is part of every system we build rather than a line added at the end, and the sessions run either at your own place of work or in our [Event Space](/event-space) in Abeokuta when a team needs a room away from the phones. What a build includes is on the [software development](/services/software-development) page.",
      },
      {
        type: "paragraph",
        text: "For individuals looking for courses rather than a team being brought onto a new system, the catalogue is on [Bitnox Education](https://edu.bitnoxsolution.com). For everything else, [tell us what the team does and what they are using now](/contact).",
      },
    ],
  },
];
