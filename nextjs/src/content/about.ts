/**
 * The about page, as content.
 *
 * The legacy version claimed eight years, 180 projects, 100 clients and round-the-clock
 * support, and none of those numbers came from anywhere. They are gone rather than adjusted:
 * invented counts are fabricated social proof under the content standards, and a page that
 * opens with four figures a reader cannot check is a page that has told them how to read
 * everything after it.
 *
 * What replaces them is the part a prospective client is actually deciding on, which is how
 * the company works. What we will say no to, what a first conversation is like, what happens
 * when something breaks after launch, and who is behind the two other Bitnox domains they may
 * have arrived from. Those are all verifiable by anybody who engages us, which is the test a
 * claim on this page has to pass.
 */

export interface AboutPrinciple {
  title: string;
  body: string;
}

export const ABOUT_SEO = {
  // Not "About Bitnox Technology Solutions". The root title template appends the company
  // name to every page, so that one renders as the name twice in one line, which spends the
  // characters a search result actually shows on saying nothing new.
  title: "About the company, how we work and where to find us",
  description:
    "A technology company in Abeokuta, Ogun State, building software and websites, advising on technology and running professional training. How we work, what we will say no to, and where to find us.",
} as const;

export const ABOUT_HERO = {
  eyebrow: "About Bitnox",
  headline: "A technology company you can\nactually get hold of.",
  lead: "Bitnox Technology Solutions builds software and websites, advises on technology decisions, and teaches the skills behind both. The office is in Oke-Ilewo, Abeokuta, and so is the Event Space.",
} as const;

/**
 * The company in three paragraphs.
 *
 * Written in plain terms rather than as a mission statement. Somebody reading this page is
 * deciding whether to send an enquiry, and the thing that decides it is whether the company
 * sounds like it does specific work for specific people.
 */
export const ABOUT_STORY: readonly string[] = [
  "Bitnox Technology Solutions is a Nigerian technology company with clients in Nigeria, the United Kingdom and further afield. The work divides into four: [software development](/services/software-development) for businesses that have outgrown their spreadsheets, [web development](/services/web-development) for companies whose website has to earn its keep, [IT consulting](/services/it-consulting) for the decisions in between, and [technology training](/services/technology-training) for the people who will run all of it afterwards.",
  "Most projects arrive the same way. Something works, but only because one person holds it together, and that has started to cost more than it saves. The first piece of work is usually not building anything. It is writing down what actually happens, which is rarely what the policy says happens, and deciding what the first version will deliberately leave out.",
  "The Bitnox name also covers two other things. [Bitnox Education](https://edu.bitnoxsolution.com) runs the course catalogue and enrolment, and Bitnox Cleaning covers laundry and cleaning on its own domain. They are separate operations with separate teams, and this site is the technology company.",
] as const;

/**
 * How the company works.
 *
 * Each one is a commitment that can be checked against how an engagement actually runs,
 * rather than a virtue. "We are passionate about quality" is not on this list, and neither is
 * anything else that cannot be falsified.
 */
export const ABOUT_PRINCIPLES: readonly AboutPrinciple[] = [
  {
    title: "A written scope before a figure",
    body: "Every quote comes with what is included, what is not, and the order the work happens in. Nothing starts on a verbal understanding, because the disagreements that end projects are almost always about something nobody wrote down.",
  },
  {
    title: "We say when you do not need us",
    body: "Off-the-shelf software is the right answer more often than a development company admits. If a package covers your situation, we will tell you which one and what it costs, and we would rather lose the project than build something you did not need.",
  },
  {
    title: "One person who knows your account",
    body: "You deal with somebody who has read the brief, not with whoever picks up. Questions during a build go to the same person, and so do questions two years later.",
  },
  {
    title: "Handover includes the keys",
    body: "Accounts, domains, hosting and repositories are yours, in your name, from the start. A client who cannot leave is not a client, and we have inherited enough systems locked to a previous supplier to know what it costs.",
  },
  {
    title: "Support is an arrangement, not an invoice per email",
    body: "Maintenance covers security updates, hosting, backups, monitoring and small changes under one agreement. Nobody should hesitate to report a problem because reporting it costs money.",
  },
  {
    title: "Training is part of delivery",
    body: "A system nobody was taught to use goes back to a spreadsheet within a month. Sessions for the people who will actually use it are in the plan, not an extra afterwards.",
  },
];

/** The three questions a first enquiry is answered with, in order. */
export const ABOUT_FIRST_STEPS: readonly AboutPrinciple[] = [
  {
    title: "You tell us what has to change",
    body: "The problem rather than the solution. What is slow, what gets typed twice, what nobody can answer at the counter. An email or a phone call is enough to start.",
  },
  {
    title: "We ask before we quote",
    body: "Usually two conversations. Who uses the thing, what the day looks like now, what happens at month end, and what the existing data is in. This is where a project either becomes clear or turns out to be two projects.",
  },
  {
    title: "You get a scope, a schedule and a figure",
    body: "In writing, with the parts we recommend leaving to a second phase named as such. If the answer is that you should buy something rather than build it, that is what the document says.",
  },
];

/**
 * Where the company is, in words rather than as an address block.
 *
 * The full NAP is on the contact page and in the footer, from `src/content/business.ts`.
 * Repeating the exact address string a third time on the about page adds nothing to the local
 * signal and gives a fourth place for it to drift.
 */
export const ABOUT_LOCATION =
  "The office and the Event Space are in the same building on Lalubu Street, Oke-Ilewo, Abeokuta. Local work is done in person where that is useful. Remote projects run the same way as local ones: shared boards, scheduled calls and a written record of every decision, so nothing depends on who was in the room.";
