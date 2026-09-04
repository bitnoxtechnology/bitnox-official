import type { Faq } from "@/content/faqs";

/**
 * The Event Space, as typed content.
 *
 * The room is called the Event Space here and in every other file. Not a training room, not
 * a workspace, not a hub, and not an event centre. The first two undersell sixty seats, the
 * third does not say it can be booked, and the fourth brings in wedding and party enquiries,
 * which is the wrong audience for a room used for conferences, workshops and classes.
 *
 * Adjacent search intent is picked up in the headings below, which name conference hall,
 * meeting room and training room hire as things the room is booked for. That is how those
 * terms get onto the page without the space being renamed.
 *
 * Two things on this page are admin-editable rather than fixed here, because they are
 * inputs the business owns: the amenity list and the availability copy both come from
 * `SiteSettings.eventSpace` when they are filled in, and fall back to what is below. The
 * fallbacks are the standard set for this room and are worth confirming before launch,
 * since an amenity listed here is a promise made to somebody who has not visited yet.
 *
 * No rate, range or "from" figure appears in this file or anywhere on the page. Rates depend
 * on the date, the length of the booking and the setup, and the enquiry form is how a figure
 * is reached.
 */

export const EVENT_SPACE_SEO = {
  title: "Event Space in Abeokuta for Conferences, Training and Meetings",
  description:
    "The Bitnox Event Space on Lalubu Street, Oke-Ilewo, Abeokuta seats 60. Theatre, classroom, boardroom and U-shape layouts for conferences, workshops, meetings and training. Send a date and we will confirm availability and a rate.",
} as const;

export const EVENT_SPACE_HERO = {
  eyebrow: "Event Space, Abeokuta",
  headline: "A room for sixty,\nready when you are.",
  lead: "The Bitnox Event Space is on Lalubu Street in Oke-Ilewo, Abeokuta. It is laid out for conferences, workshops, meetings, tech gatherings and classes, and it is set up before you arrive. Tell us the date, how long you need it and the layout you want.",
} as const;

/**
 * How the room is arranged.
 *
 * Seat counts per layout are deliberately absent. The room seats sixty in theatre style,
 * which is a stated fact about it; what a boardroom or a classroom setup seats depends on
 * the tables in the room on the day, and an invented number here would be quoted back to us
 * by somebody who booked on the strength of it.
 */
export interface RoomLayout {
  name: string;
  /** What this arrangement is for, in the reader's words rather than furniture terms. */
  bestFor: string;
  /** How the room is actually set out. One sentence. */
  setup: string;
}

export const ROOM_LAYOUTS: readonly RoomLayout[] = [
  {
    name: "Theatre",
    bestFor: "Conferences, seminars, talks and product launches",
    setup: "Rows of chairs facing the front, no tables. This is the layout that seats sixty.",
  },
  {
    name: "Classroom",
    bestFor: "Training, classes and workshops where people write or use laptops",
    setup: "Rows of tables with chairs behind them, all facing the screen.",
  },
  {
    name: "Boardroom",
    bestFor: "Board meetings, interviews, committees and small reviews",
    setup: "One table in the centre with seating around it, so everybody can see everybody.",
  },
  {
    name: "U-shape",
    bestFor: "Facilitated sessions, training with discussion, group presentations",
    setup: "Tables in an open U with the presenter at the mouth of it.",
  },
] as const;

/**
 * What the room is booked for.
 *
 * Each line is a thing somebody types into a search box. They are here rather than in a
 * paragraph because a reader scanning for the word "workshop" finds it in a list and not in
 * the fourth sentence of a block of copy.
 */
export interface UseCase {
  name: string;
  description: string;
}

export const EVENT_SPACE_USES: readonly UseCase[] = [
  {
    name: "Conferences",
    description:
      "Sixty seats in theatre layout, a screen at the front, and a foyer area outside the room for registration and breaks.",
  },
  {
    name: "Corporate meetings",
    description:
      "Board meetings, interviews and reviews in boardroom layout, for teams that need a room away from their own office.",
  },
  {
    name: "Workshops",
    description:
      "U-shape or classroom layout for sessions where people work through something rather than sit and listen.",
  },
  {
    name: "Training sessions",
    description:
      "Classroom layout with tables, for cohorts running a day, a week or a series of evenings.",
  },
  {
    name: "Seminars",
    description:
      "Half-day and full-day programmes, with the room reset between sessions if the format changes.",
  },
  {
    name: "Tech gatherings",
    description:
      "Meetups, developer sessions, demo nights and community events, including evenings and weekends.",
  },
  {
    name: "Product launches",
    description:
      "Theatre layout with space at the back for a display table, press and photographs.",
  },
] as const;

/**
 * The default amenity list.
 *
 * Used when `SiteSettings.eventSpace.amenities` is empty, which is its state until an admin
 * fills it in. The same list feeds the `amenityFeature` array in the `EventVenue` markup, so
 * the page and the structured data cannot disagree about what the room has.
 */
export const DEFAULT_AMENITIES: readonly string[] = [
  "Seating for up to 60",
  "Projector and screen",
  "Air conditioning",
  "Wi-Fi",
  "Backup power",
  "Tables for classroom, boardroom and U-shape layouts",
] as const;

/**
 * The default availability copy.
 *
 * Used when `SiteSettings.eventSpace.availabilityCopy` is empty. It has to cover the one
 * thing that decides most bookings: the room also runs Bitnox classes, so the days it is
 * free are not every day, and saying so before somebody plans around it is cheaper than
 * saying so afterwards.
 */
export const DEFAULT_AVAILABILITY_COPY =
  "The room runs Bitnox classes on some weekdays. Outside those it is open for booking by the hour, the day or across several days, including evenings and weekends. Send the date you have in mind and we will tell you whether it is free, and what else is free that week if it is not.";

/**
 * What a quote depends on.
 *
 * The page publishes no rate, so this list does the work a rate card would: it says what
 * changes the figure, which is what somebody comparing venues actually needs in order to ask
 * a useful question.
 */
export const QUOTE_FACTORS: readonly UseCase[] = [
  {
    name: "The date",
    description:
      "Weekdays, weekends and evenings are not the same, and a date that already has a class on it may need a different one.",
  },
  {
    name: "How long you need the room",
    description:
      "A two-hour meeting, a full day and a five-day course are priced differently, and a run of days is not the day rate multiplied.",
  },
  {
    name: "The setup",
    description:
      "Theatre is the quickest to lay out. Classroom, boardroom and U-shape take tables and time, and a change of layout partway through a booking takes both again.",
  },
] as const;

/**
 * Getting there.
 *
 * Written for somebody in a car or a taxi rather than for a search engine. The landmark is
 * the Chicken Republic, because that is what a driver in Oke-Ilewo will know, and it is
 * already part of the address on the Google Business Profile.
 */
export const EVENT_SPACE_LOCATION = {
  directions:
    "The Event Space is on the last floor of Majek Kembo Plaza, beside Chicken Republic on Lalubu Street in Oke-Ilewo. Coming from Kuto, stay on Lalubu Street past the Chicken Republic and the plaza is on your right. Coming from Panseke, the plaza is on your left before the Chicken Republic.",
  parking:
    "There is parking in front of the plaza and on Lalubu Street. Tell us roughly how many cars to expect when you enquire, and we will say where to put them for a full room.",
  landmarks: [
    "Chicken Republic, Lalubu Street, next door",
    "Oke-Ilewo, off the Kuto to Panseke road",
    "Ten minutes from Kuto Market",
    "Fifteen minutes from Abeokuta North local government secretariat",
  ],
} as const;

export const EVENT_SPACE_FAQS: readonly Faq[] = [
  {
    question: "How many people does the Bitnox Event Space hold?",
    answer:
      "Sixty in theatre layout, which is rows of chairs facing the front. Classroom, boardroom and U-shape layouts hold fewer, because the tables take floor space. Tell us how many people are coming and which layout you want, and we will confirm the number before you commit to anything.",
  },
  {
    question: "What does it cost to hire the Event Space?",
    answer:
      "Rates depend on the date, how long you need the room and the setup you want, so they are quoted per booking rather than published. Send an enquiry with those three things and a figure comes back, usually within one working day.",
  },
  {
    question: "Where is the Event Space in Abeokuta?",
    answer:
      "24 Last Floor, Majek Kembo Plaza, beside Chicken Republic, Lalubu Street, Oke-Ilewo, Abeokuta, Ogun State. It is in the same building as the Bitnox office, and there is parking in front of the plaza and on Lalubu Street.",
  },
  {
    question: "Which days is the room available?",
    answer:
      "The room runs Bitnox classes on some weekdays, so availability changes week to week. Evenings and weekends are usually open. Send the date you have in mind and we will confirm whether it is free.",
  },
  {
    question: "Can I use the room for a conference or a training course?",
    answer:
      "Yes. Conferences, seminars, workshops, corporate meetings, training sessions, tech gatherings and product launches are what the room is for. It is not set up for weddings, parties or receptions.",
  },
  {
    question: "Is the room set up before we arrive?",
    answer:
      "Yes. Tell us the layout when you book and the room is laid out before your start time, so the first thing your group does is sit down rather than move chairs.",
  },
  {
    question: "Can we bring our own catering or equipment?",
    answer:
      "Yes to both. Say so in your enquiry, because catering needs a table and a route in, and equipment may need power at the front of the room rather than at the back.",
  },
  {
    question: "How far ahead should we book?",
    answer:
      "A week is comfortable for a meeting or a workshop. Give a conference or a multi-day course two to three weeks, so the layout, the power and the schedule around the classes can be arranged properly. Shorter notice is worth asking about, since a date is either free or it is not.",
  },
] as const;
