import type { StaticImage } from "@/content/event-space-media";
import type { ServiceSlug } from "@/lib/constants";

/**
 * The picture that stands for each service on the landing page.
 *
 * The showcase on the landing page used the drawn interfaces from `components/graphics/`.
 * These replace them there, and only there: the services hub and the service pages still
 * show the drawings, which is where a wireframe of the thing being described belongs.
 *
 * One file per slug in `public/services/`, named after the slug. Replacing one is dropping a
 * file over that path and correcting the `alt` beside it. Nothing else reads these, so a
 * swap cannot break a layout: the frame is a fixed 16:10 box and the image is cropped to
 * fill it, whatever it arrives as.
 *
 * `alt` is not optional and it says what is in the frame rather than naming the service
 * again. It is the only description a reader who cannot see the image gets, and the heading
 * beside it has already said which service this is, so repeating that spends the alt text
 * saying nothing.
 *
 * These illustrate the kind of work each service covers. They are not screenshots of client
 * projects, and the two brand names inside them are invented. Nothing in the copy around
 * them says otherwise and nothing should start to, because presenting them as delivered work
 * is the fabricated social proof the copy standards rule out.
 *
 * They are `StaticImage`, the same shape as the Event Space photographs, so these can be
 * handed to anything that already takes one.
 */
export const SERVICE_IMAGES: Record<ServiceSlug, StaticImage> = {
  "software-development": {
    url: "/services/software-development.webp",
    alt: "A software company website, with a developer working at a laptop and panels of code and page layout beside him",
    sortOrder: 0,
  },
  "web-development": {
    url: "/services/web-development.webp",
    alt: "An online clothing store, with search, account and basket controls above the window and delivery, payment and returns notes below it",
    sortOrder: 1,
  },
  "it-consulting": {
    url: "/services/it-consulting.webp",
    alt: "A desk with a laptop showing an order and stock dashboard, a monitor beside it tracking delivery routes between Abeokuta and Lagos, and a phone running the same system",
    sortOrder: 2,
  },
  "technology-training": {
    url: "/services/technology-training.webp",
    alt: "The Bitnox Education website, headed with an invitation to start a technology career, above photographs of classes running in the training rooms",
    sortOrder: 3,
  },
};
