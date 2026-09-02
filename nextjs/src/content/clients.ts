/**
 * The logos in the trusted-by row under the hero.
 *
 * PLACEHOLDERS. Every entry below is an abstract geometric mark generated for this build, not
 * a real company. They are deliberately anonymous: a logo wall is a claim about who has paid
 * for the work, and inventing eight plausible-looking client names to fill it would be
 * fabricated social proof, which is the one thing the content standards rule out outright.
 * Anonymous shapes read as "logos to come", which is true, where "Northgate Ltd" would not.
 *
 * To ship this row for real: drop the client logos into `public/brands/`, replace the entries
 * here with their names and files, and delete the ones that are still placeholders. The
 * heading above the row names the countries Bitnox works in, so it should not go live until
 * the marks under it are genuine.
 *
 * `name` becomes the alt text. When these are replaced it should be the company's name, since
 * a logo with no accessible name is invisible to anyone not looking at the screen.
 *
 * `width` and `height` are the intrinsic dimensions of each file, which `next/image` needs to
 * reserve the space before the SVG loads.
 */

export interface ClientLogo {
  name: string;
  src: string;
  width: number;
  height: number;
  /** Remove this flag as each mark is replaced with a real one. */
  placeholder?: boolean;
}

export const CLIENT_LOGOS: readonly ClientLogo[] = [
  {
    name: "Client logo placeholder 1",
    src: "/brands/placeholder-01.svg",
    width: 150,
    height: 40,
    placeholder: true,
  },
  {
    name: "Client logo placeholder 2",
    src: "/brands/placeholder-02.svg",
    width: 150,
    height: 40,
    placeholder: true,
  },
  {
    name: "Client logo placeholder 3",
    src: "/brands/placeholder-03.svg",
    width: 150,
    height: 40,
    placeholder: true,
  },
  {
    name: "Client logo placeholder 4",
    src: "/brands/placeholder-04.svg",
    width: 150,
    height: 40,
    placeholder: true,
  },
  {
    name: "Client logo placeholder 5",
    src: "/brands/placeholder-05.svg",
    width: 150,
    height: 40,
    placeholder: true,
  },
  {
    name: "Client logo placeholder 6",
    src: "/brands/placeholder-06.svg",
    width: 150,
    height: 40,
    placeholder: true,
  },
  {
    name: "Client logo placeholder 7",
    src: "/brands/placeholder-07.svg",
    width: 150,
    height: 40,
    placeholder: true,
  },
  {
    name: "Client logo placeholder 8",
    src: "/brands/placeholder-08.svg",
    width: 150,
    height: 40,
    placeholder: true,
  },
] as const;

export const TRUSTED_BY_HEADING =
  "Trusted by businesses across Nigeria, the United Kingdom and beyond";
