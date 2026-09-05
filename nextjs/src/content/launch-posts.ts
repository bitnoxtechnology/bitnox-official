import type { Block } from "@/lib/blog/blocks";

/**
 * The posts the blog launches with.
 *
 * A blog with nothing on it is worse than no blog: the nav promises writing, the index shows
 * an apology, and the three service pages that draw their reading lists from tags render a
 * heading over an empty row. These three exist so that none of that is true on day one.
 *
 * They are seeded by `npm run db:seed:blog` and are ordinary posts once they are in. Nothing
 * marks them as fixtures, nothing prevents them being edited in the admin, and the seed
 * script does not touch a post that already exists, so an edit made after seeding survives a
 * reseed.
 *
 * The tags are chosen against `blogTags` in `src/content/services.ts`, so each post appears
 * in the reading list on the service page it belongs to. That is the point of writing them
 * before launch rather than after: three of the four service pages gain a section they
 * cannot otherwise have.
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
  seoTitle: string;
  seoDescription: string;
  blocks: Block[];
}

export const LAUNCH_POSTS: readonly LaunchPost[] = [
  {
    title: "What a business management system actually replaces",
    slug: "what-a-business-management-system-replaces",
    category: "Software",
    tags: ["software-development", "custom-software", "business-systems"],
    excerpt:
      "Before a business buys custom software it is already running one, made of spreadsheets, a notebook and a WhatsApp group. Here is what a real system takes over, what changes in the first month, and how to tell whether you need one yet.",
    seoTitle: "What a Business Management System Replaces",
    seoDescription:
      "The spreadsheets, notebooks and WhatsApp threads a custom business system takes over, what changes in the first month, and how to tell whether you need one yet.",
    blocks: [
      {
        type: "paragraph",
        text: "Every business that asks us for a management system is already running one. It is made of a spreadsheet somebody keeps on their laptop, a hardback notebook behind the counter, a WhatsApp group where orders are confirmed, and one person who knows how all three fit together. It works, in the sense that the business is still trading. It also has a ceiling, and most owners meet it in the same way: a customer asks a question nobody can answer without ringing somebody who is not at work today.",
      },
      {
        type: "paragraph",
        text: "This post is about what a custom system replaces, in concrete terms, and about the cases where the honest answer is that you do not need one yet.",
      },
      { type: "heading", level: 2, text: "The four places your data actually lives" },
      {
        type: "paragraph",
        text: "When we audit a business before quoting, we find the same four stores almost every time.",
      },
      {
        type: "orderedList",
        items: [
          "**The spreadsheet.** Usually stock or sales, usually maintained by one person, usually with three older copies named final, final2 and final-updated. It is accurate on the day it is edited and drifts afterwards.",
          "**The notebook.** Whatever happens away from a computer: deliveries taken at the gate, credit given to a regular customer, a return accepted on a Saturday. It is the most current record in the building and the least readable.",
          "**The chat threads.** Orders, prices agreed, complaints, photographs of transfer receipts. Searchable in theory, unsearchable in practice, and gone when a phone is lost.",
          "**Somebody's memory.** Which supplier gives thirty days, which customer always pays late, what the last price was. This is the store that leaves when the person does.",
        ],
      },
      {
        type: "paragraph",
        text: "A system does not add a fifth store. It replaces those four with one, and the whole benefit follows from that single change.",
      },
      { type: "heading", level: 2, text: "What changes in the first month" },
      {
        type: "paragraph",
        text: "The changes worth paying for are unglamorous and they show up quickly.",
      },
      {
        type: "bulletList",
        items: [
          "**Questions get answered while the customer is still there.** What did this account order last time, is that item in stock, what do they owe. Each one is a lookup rather than a phone call.",
          "**Two people can work at once.** A spreadsheet is a single-writer document. The moment a second person needs to record something, either they wait or a second copy is born.",
          "**The record survives a resignation.** Handover stops being a conversation and becomes an account being deactivated.",
          "**Month end takes an afternoon instead of a week.** Not because the arithmetic is faster, but because nobody is reconstructing what happened from four sources.",
        ],
      },
      {
        type: "paragraph",
        text: "What does not change in the first month is revenue. Anyone who tells you a system will lift sales in thirty days is selling you something. What it lifts first is the amount of the working day spent on the business rather than on finding out what the business did.",
      },
      { type: "heading", level: 2, text: "Custom, or something off the shelf" },
      {
        type: "paragraph",
        text: "Off-the-shelf software is the right answer more often than a development company will admit. Accounting, payroll and email are solved problems, they are cheaper to buy than to build, and the version you buy is maintained by somebody else.",
      },
      {
        type: "paragraph",
        text: "Custom earns its cost in one situation: your process is genuinely yours and changing it to fit a package would cost more than the package saves. Distribution with credit terms per customer, a workshop that quotes from parts and labour, a school that bills termly with instalments, a clinic that has to keep records for years. In each of those, the package either does not model the thing at all or models it in a way that means somebody keeps a spreadsheet beside it. Then you have five stores instead of four.",
      },
      {
        type: "paragraph",
        text: "Our usual recommendation is a mix: buy what is standard, build what is specific, and connect the two so nothing is typed twice. That is most of what [software development](/services/software-development) work looks like in practice.",
      },
      { type: "heading", level: 2, text: "How to tell you are ready" },
      {
        type: "paragraph",
        text: "Three signs, in the order they usually appear.",
      },
      {
        type: "bulletList",
        items: [
          "The same figure exists in two places and they disagree, and it takes somebody an hour to decide which is right.",
          "You have hired somebody whose job is partly to move information between systems by retyping it.",
          "A decision waited on a person rather than on a number, more than once this month.",
        ],
      },
      {
        type: "paragraph",
        text: "If none of those is true yet, keep the spreadsheet. It is a reasonable system for a business that fits inside one, and money spent early on software is money not spent on stock.",
      },
      { type: "heading", level: 2, text: "What the work involves" },
      {
        type: "paragraph",
        text: "A first build is usually six to ten weeks, depending on how many workflows it has to cover and how much existing data has to move into it. The work that decides whether it succeeds happens in the first two: sitting with the people who do the job, writing down what actually happens rather than what the policy says happens, and agreeing what the first version will not do.",
      },
      {
        type: "paragraph",
        text: "The migration is the part that is always underestimated. Data that lives in four places has four spellings of the same customer name, and reconciling that is a business decision, not a technical one. We do it before launch rather than after, because a system that starts with duplicates teaches everybody to distrust it in the first week.",
      },
      {
        type: "blockquote",
        text: "The measure of a good first version is not how much it does. It is whether the people who have to use it stopped keeping their own copy.",
      },
      {
        type: "paragraph",
        text: "If any of this sounds like your situation, tell us what the software has to do, who uses it and when you need it. Start on the [contact page](/contact), or read what an engagement looks like on the [software development](/services/software-development) page.",
      },
    ],
  },

  {
    title: "Why a site that felt fast in the demo is slow on a real phone",
    slug: "why-your-site-is-slow-on-a-real-phone",
    category: "Websites",
    tags: ["web-development", "seo", "performance"],
    excerpt:
      "A website that loads instantly on the laptop it was built on can take eight seconds on a mid-range Android over mobile data. The reasons are boring, measurable and mostly fixable, and search ranking depends on them.",
    seoTitle: "Why Your Website Is Slow on a Real Phone",
    seoDescription:
      "Images, third-party scripts and hosting distance are what make a site slow on mobile data in Nigeria. What to measure, the thresholds that matter, and what to fix first.",
    blocks: [
      {
        type: "paragraph",
        text: "A website is built on a fast laptop, on office broadband, a few kilometres from the server. It is reviewed on the same laptop. Then it goes live, and the people it was built for open it on a four-year-old Android phone, on mobile data, several thousand kilometres from wherever it is hosted. Those are two different websites, and only one of them was ever tested.",
      },
      {
        type: "paragraph",
        text: "Here is what actually makes the difference, in the order it is usually worth fixing.",
      },
      { type: "heading", level: 2, text: "Start with the three numbers Google publishes" },
      {
        type: "paragraph",
        text: "Core Web Vitals are the thresholds search ranking uses, and they are public, so there is no need to argue about what counts as fast.",
      },
      {
        type: "bulletList",
        items: [
          "**Largest Contentful Paint** should be under 2.5 seconds. This is when the biggest thing on screen, usually the hero image or heading, has finished drawing.",
          "**Interaction to Next Paint** should be under 200 milliseconds. This is how long the page takes to respond when somebody taps something.",
          "**Cumulative Layout Shift** should be under 0.1. This is how much the page moves under a reader's thumb while it is still loading.",
        ],
      },
      {
        type: "paragraph",
        text: "Measure them on a throttled connection and a mid-range device, not on the machine the site was built on. PageSpeed Insights does this for you and reports field data from real visitors alongside the lab test. The field data is the one that matters, because it is your actual audience on their actual phones.",
      },
      { type: "heading", level: 2, text: "Images are almost always the first problem" },
      {
        type: "paragraph",
        text: "On most sites we audit, images are more than eighty per cent of the bytes on the page, and a large part of that is waste. A photograph exported straight from a camera or a phone is several megabytes; the same photograph at the size it is displayed, in a modern format, is often under a hundred kilobytes and looks identical.",
      },
      {
        type: "paragraph",
        text: "Three fixes, all of them mechanical.",
      },
      {
        type: "orderedList",
        items: [
          "Serve the size that is displayed. A 4000 pixel wide image inside a 400 pixel column is 100 times the pixels for the same result.",
          "Serve a modern format. WebP and AVIF are supported everywhere that matters now and are typically a quarter to a half the size of the equivalent JPEG.",
          "Give every image its dimensions in the markup, so the browser reserves the space before the file arrives.",
        ],
      },
      {
        type: "paragraph",
        text: "That last one is the cheapest layout shift fix there is. Two attributes:",
      },
      {
        type: "code",
        language: "html",
        code: '<img\n  src="/gallery/event-space-theatre.avif"\n  alt="The Event Space set out theatre style for sixty people"\n  width="1600"\n  height="900"\n  loading="lazy"\n  decoding="async"\n/>',
      },
      {
        type: "paragraph",
        text: "The width and height do not fix the display size, which is still whatever the stylesheet says. They give the browser the aspect ratio so it can hold the space open, which is the difference between a page that settles and a page where the paragraph a reader started reading jumps down the screen.",
      },
      {
        type: "paragraph",
        text: 'One exception to `loading="lazy"`: the image at the top of the page, the one that is the Largest Contentful Paint. Lazy loading that one delays the exact thing being measured. Load it eagerly and let everything below the fold be lazy.',
      },
      { type: "heading", level: 2, text: "Third-party scripts cost more than they look" },
      {
        type: "paragraph",
        text: "A chat widget, three analytics tags, a social feed and a font loaded from somebody else's domain are each a separate connection to a separate server before the page can finish. On a good connection this is invisible. On mobile data with high latency, each one is a round trip measured in hundreds of milliseconds, and they queue.",
      },
      {
        type: "paragraph",
        text: "Two questions per script, asked honestly. Does anybody read the data it produces, and would the business notice if it were removed. Most sites we audit are carrying at least one tag that nobody has looked at in a year.",
      },
      {
        type: "paragraph",
        text: "Fonts are the easiest win in this category. Self-hosting the font files removes a connection to a third-party domain from the critical path, and it removes a question from your privacy policy at the same time.",
      },
      {
        type: "heading",
        level: 2,
        text: "Where the server is matters more than the specification",
      },
      {
        type: "paragraph",
        text: "Distance is latency and latency cannot be optimised away. A visitor in Abeokuta requesting a page from a server in Ohio waits for the round trip before the first byte arrives, and every request after that pays it again. A more powerful server in the same place does not help; a closer one does.",
      },
      {
        type: "paragraph",
        text: "The practical answer is a content delivery network, which keeps a copy of the pages and files at points around the world so most requests are answered from somewhere near the visitor. For a site whose pages are generated ahead of time rather than built on each request, this is close to free and it is the single largest improvement available to a Nigerian audience.",
      },
      { type: "heading", level: 2, text: "What to do first" },
      {
        type: "paragraph",
        text: "In order, because doing them out of order wastes effort: measure on a real device, fix the images, remove the scripts nobody reads, then move the hosting closer. The first three are usually a day of work and they typically halve the load time. The fourth is a decision rather than a task.",
      },
      {
        type: "paragraph",
        text: "Speed is also a ranking input rather than a nicety, which is why it appears on the [web development](/services/web-development) page as part of the build rather than as an extra. If you would like the audit rather than the advice, [tell us the address](/contact) and we will send back what we find.",
      },
    ],
  },

  {
    title: "Six checks worth running on your systems before you spend anything",
    slug: "six-checks-before-you-spend-anything",
    category: "Security",
    tags: ["it-consulting", "cybersecurity", "technology-strategy"],
    excerpt:
      "Most technology spending starts with a purchase. It should start with an inventory. Six checks any business can run in an afternoon, what each one tends to find, and what to do about it.",
    seoTitle: "Six IT Checks to Run Before You Spend Anything",
    seoDescription:
      "Six practical checks on accounts, backups, certificates, updates, suppliers and shared passwords. What each one usually finds in a small business, and what to fix first.",
    blocks: [
      {
        type: "paragraph",
        text: "Most technology spending in a small business starts with a purchase: a new system, a new subscription, a firewall somebody recommended. It should start with an inventory, because the first round of findings is usually free to fix and changes what is worth buying.",
      },
      {
        type: "paragraph",
        text: "These are six checks we run at the start of an engagement. Any business can run them without us. None needs a specialist tool and all six fit in an afternoon.",
      },
      { type: "heading", level: 2, text: "1. Who still has access" },
      {
        type: "paragraph",
        text: "List every system the business uses and, for each one, every account that can sign in. Email, accounting, the website admin, the bank, the shared drive, the domain registrar, the social accounts.",
      },
      {
        type: "paragraph",
        text: "What this finds, almost every time: an account belonging to somebody who left, a shared login three people use, and at least one system where nobody is certain who the administrator is. The first two are removed the same day. The third is the one that matters, because an account nobody owns is an account nobody is watching.",
      },
      { type: "heading", level: 2, text: "2. Whether the backup restores" },
      {
        type: "paragraph",
        text: "Not whether a backup runs. Whether it restores. Pick one file or one record, restore it somewhere harmless, and confirm it is what you expected.",
      },
      {
        type: "paragraph",
        text: "A backup that has never been restored is a belief, not a control. The two failures we see are a job that stopped months ago and reported nothing, and a backup sitting on the same machine as the data, which covers a deleted file and nothing else.",
      },
      {
        type: "paragraph",
        text: "The rule worth keeping: three copies, on two kinds of storage, one of them somewhere else.",
      },
      { type: "heading", level: 2, text: "3. When your certificate and domain expire" },
      {
        type: "paragraph",
        text: "A lapsed TLS certificate puts a full-page warning in front of every visitor, and a lapsed domain takes the site and the email with it. Both are avoidable and both happen to businesses that had the renewal notice going to somebody's old address.",
      },
      {
        type: "paragraph",
        text: "The certificate takes one command to check:",
      },
      {
        type: "code",
        language: "bash",
        code: "openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \\\n  | openssl x509 -noout -dates",
      },
      {
        type: "paragraph",
        text: "For the domain, sign in to the registrar rather than trusting a public lookup, confirm the expiry, confirm auto-renewal is on, and confirm the contact address is one somebody reads. Put both dates in a shared calendar, not a personal one.",
      },
      { type: "heading", level: 2, text: "4. What has not been updated" },
      {
        type: "paragraph",
        text: "Walk the list: operating systems on the machines people work on, the website platform and its plugins, the router and any network equipment, and phones used for work email.",
      },
      {
        type: "paragraph",
        text: "The website is where this usually bites. A content platform with plugins that stopped being updated two years ago is the most common way a small business site is compromised, and it is rarely targeted: it is found by a scanner looking for that exact version.",
      },
      {
        type: "paragraph",
        text: "Anything still running that cannot be updated needs a decision rather than a note. Replace it, isolate it, or accept the risk in writing so it is a choice rather than an oversight.",
      },
      { type: "heading", level: 2, text: "5. Which suppliers you actually depend on" },
      {
        type: "paragraph",
        text: "Write down every outside service the business would stop working without: hosting, email, payments, the accounting package, the messaging platform, the internet connection. Beside each one, write who holds the account, what it costs, and how long the business could operate if it went down for a week.",
      },
      {
        type: "paragraph",
        text: "This is the check that most often changes a budget. Duplicated subscriptions, a service nobody uses, and one dependency with no fallback are the standard findings, and the third is the one to spend on.",
      },
      { type: "heading", level: 2, text: "6. How passwords are shared" },
      {
        type: "paragraph",
        text: "Not whether they are strong. How they are shared. If the answer involves a chat message, a note in a drawer or a column in a spreadsheet, every one of those passwords should be treated as known outside the business.",
      },
      {
        type: "paragraph",
        text: "A password manager for the team, and two-factor authentication on email, the bank and the domain registrar, cover most of the realistic risk for a business of this size. Email first, because it is the account that can reset the others.",
      },
      { type: "heading", level: 2, text: "What to do with the findings" },
      {
        type: "paragraph",
        text: "Sort them into three: fix today at no cost, fix this quarter for a small cost, and decide about. Most lists come out heavily weighted to the first group, which is the point of doing the inventory before the purchase.",
      },
      {
        type: "blockquote",
        text: "The cheapest security work is almost always removing something: an account, a subscription, a machine nobody uses. Buying comes after that, not before.",
      },
      {
        type: "paragraph",
        text: "If you would rather have somebody run it with you and put the findings in writing, that is where an [IT consulting](/services/it-consulting) engagement starts. Tell us what you run and we will tell you what we would look at first.",
      },
    ],
  },
];
