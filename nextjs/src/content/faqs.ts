/**
 * The landing page FAQs.
 *
 * Ported from the legacy `client/src/lib/data.ts` and rewritten. The originals claimed
 * "world-class", "cutting-edge" and round-the-clock hours, listed cleaning among the
 * technology services, and answered a booking question the site could not act on.
 *
 * Three rules shaped the rewrite. Nothing states a price, because rates depend on the job.
 * Nothing states opening hours, because the real ones are still an outstanding input and a
 * guess here would contradict the Google Business Profile. And nothing mentions laundry or
 * cleaning, because this list renders on the landing page, which carries no cleaning
 * content of any kind.
 *
 * The questions are also the source for the `FAQPage` structured data, so each answer is
 * written to stand on its own in a search result, without the page around it.
 */

export interface Faq {
  question: string;
  answer: string;
}

export const HOME_FAQS: readonly Faq[] = [
  {
    question: "What does Bitnox Technology Solutions do?",
    answer:
      "Software development, web development, IT consulting and technology training. We build business management systems, custom applications, websites and online stores, advise on technology decisions, and teach the skills behind all of it. We also run an Event Space that seats 60.",
  },
  {
    question: "Can I book the Event Space?",
    answer:
      "Yes. The room seats 60 and is used for conferences, meetings, workshops, tech gatherings and classes. Rates depend on the date, how long you need the room and the setup you want, so send an enquiry through the Event Space page and we will come back with a figure and confirm availability.",
  },
  {
    question: "How do I get a quote for a project?",
    answer:
      "Send the details through the contact page or email info@bitnoxsolution.com. Tell us what the software or website has to do, who uses it and when you need it. We read every enquiry and reply within one to two working days, usually with questions before a number.",
  },
  {
    question: "Where are you based, and do you work with clients elsewhere?",
    answer:
      "The office is at 24 Last Floor, Majek Kembo Plaza, Lalubu Street, Oke-Ilewo, Abeokuta, Ogun State. Bitnox works with clients in Nigeria, the United Kingdom and further afield, and remote projects are run the same way as local ones: shared boards, scheduled calls and a written record of decisions.",
  },
  {
    question: "How long does a project take?",
    answer:
      "A small website is usually two to four weeks. A business system or a larger platform is six to ten weeks or more, depending on how many workflows it has to cover and how much existing data has to move into it. You get a schedule with the quote, not after the work starts.",
  },
  {
    question: "Do you support a site or system after it launches?",
    answer:
      "Yes. Maintenance covers security updates, hosting, backups, monitoring and small changes. It is arranged as an ongoing agreement rather than charged per email, so nobody hesitates to report a problem.",
  },
  {
    question: "Can you rebuild an existing website or system?",
    answer:
      "Yes, and it is a large part of what we do. We audit what is there first, keep the parts that work and the URLs that already rank, and rewrite the rest. Content and data are migrated rather than retyped.",
  },
  {
    question: "What technologies do you build with?",
    answer:
      "Mostly React and Next.js on the front end, Node.js and Python on the back end, with MongoDB or PostgreSQL for data and AWS or Vercel for hosting. The choice follows the project. We will say plainly when a simpler tool is the right answer.",
  },
  {
    question: "Where are the courses?",
    answer:
      "Course listings, dates and enrolment live at edu.bitnoxsolution.com, which is the Bitnox Education site. Corporate and team training is arranged through the contact page here.",
  },
] as const;
