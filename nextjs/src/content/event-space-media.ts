/**
 * Photographs of the Event Space, shipped as static files.
 *
 * The gallery proper is a database collection an admin curates, uploads to and reorders.
 * These are the fallback for a database that has no rows in it yet, and they are also the two
 * photographs the landing page uses inside its own layout, where the image is part of the
 * composition rather than part of a gallery and should not disappear because nobody has
 * populated a collection.
 *
 * They are real pictures of the room rather than stock: one of a session in progress and one
 * of the room laid out for sixty. That is the whole point of having them. Every alt text below
 * describes what is actually in the frame, because these are the same objects the uploaded
 * ones are, and a required alt field means nothing if the seeded values are "event space 1".
 *
 * `sortOrder` matches the array position and exists so these can be handed to the same
 * components the database images go through.
 */

export interface StaticImage {
  url: string;
  alt: string;
  caption?: string;
  sortOrder: number;
}

export const EVENT_SPACE_PHOTOS: readonly StaticImage[] = [
  {
    url: "/event-space/image-4.jpg",
    alt: "The Bitnox Event Space laid out with rows of blue and black seating facing the front of the room",
    caption: "Laid out for a conference",
    sortOrder: 0,
  },
  {
    url: "/event-space/image-2.jpg",
    alt: "The Bitnox Event Space seen from the back of the room",
    sortOrder: 1,
  },
  {
    url: "/event-space/image-3.jpg",
    alt: "Seating and the presentation area inside the Bitnox Event Space",
    sortOrder: 2,
  },
  {
    url: "/event-space/image-5.jpg",
    alt: "A wider view of the Bitnox Event Space and its entrance",
    sortOrder: 3,
  },
  {
    url: "/event-space/image-6.jpg",
    alt: "The Bitnox Event Space with seating arranged for a smaller group",
    sortOrder: 4,
  },
];

/** A session running in the space, used where the landing page wants people rather than a room. */
export const SESSION_PHOTO: StaticImage = {
  url: "/event-space/image-1.jpg",
  alt: "A Bitnox session in progress, with an instructor presenting code on a large screen to a seated group",
  sortOrder: 0,
};
