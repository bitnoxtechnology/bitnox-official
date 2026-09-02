import { clientEnv } from "@/lib/env";

/**
 * The three Bitnox properties.
 *
 * One list, read by the navbar switcher and the footer, so a visitor who came looking for a
 * course or for laundry can leave for the right site from anywhere.
 *
 * The two sister URLs come from the environment rather than being written here, because
 * staging needs to point them somewhere that is not production.
 */

export interface Property {
  id: "technology" | "education" | "cleaning";
  name: string;
  /** What the property does, in one short line. Shown under the name in the switcher. */
  description: string;
  href: string;
  /** True for this site, which is a link home rather than a link away. */
  current: boolean;
}

export const PROPERTIES: readonly Property[] = [
  {
    id: "technology",
    name: "Bitnox Technology",
    description: "Software, websites, IT consulting and training",
    href: "/",
    current: true,
  },
  {
    id: "education",
    name: "Bitnox Education",
    description: "Course catalogue and enrolment",
    href: clientEnv.NEXT_PUBLIC_EDU_URL,
    current: false,
  },
  {
    id: "cleaning",
    name: "Bitnox Cleaning",
    description: "Laundry and cleaning services",
    href: clientEnv.NEXT_PUBLIC_CLEANING_URL,
    current: false,
  },
] as const;

export const EDU_URL = clientEnv.NEXT_PUBLIC_EDU_URL;
export const CLEANING_URL = clientEnv.NEXT_PUBLIC_CLEANING_URL;
