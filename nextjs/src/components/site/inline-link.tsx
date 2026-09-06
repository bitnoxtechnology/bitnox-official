import Link from "next/link";

import { isExternalHref } from "@/lib/inline-text";
import { cn } from "@/lib/utils";

/**
 * A link inside a sentence.
 *
 * The distinction from an ordinary link is the underline, and it is not decoration. WCAG 1.4.1
 * says colour cannot be the only way of conveying information, and a cyan phrase in a grey
 * paragraph conveys "this is a link" by colour alone. The Phase 13 Lighthouse pass found it
 * on the Event Space page, as `link-in-text-block`, and it was the only thing keeping that
 * page off 100 for accessibility. Six places on the site had the same construction.
 *
 * The treatment is the one `globals.css` already gives links inside blog prose: a one pixel
 * underline at 45% of the accent colour, going solid on hover. Matching it is the point. A
 * link in a hand-written paragraph on the about page and a link in a published post are the
 * same thing to a reader, and they were rendering differently only because one went through
 * the prose styles and the other did not.
 *
 * This is for links that sit in running text. A link that stands alone, in its own cell, list
 * item or `dd`, does not need it: nothing surrounds it for it to be distinguished from, and
 * an underline there is noise. `location-section.tsx` and the contact routes are deliberately
 * left plain for that reason.
 *
 * Internal links go through `next/link` and external ones through a plain anchor, which is the
 * same split `RichText` makes: `edu.` and `cleaning.` are separate applications on separate
 * origins, and prefetching a URL this router cannot handle is a wasted request.
 *
 * A server component. There is nothing interactive in a paragraph.
 */
export function InlineLink({
  href,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & { href: string }) {
  const styles = cn(
    "text-primary font-medium underline decoration-1 underline-offset-[0.2em]",
    "decoration-primary/45 transition-[text-decoration-color] duration-200 hover:decoration-primary",
    className,
  );

  if (isExternalHref(href)) {
    return (
      <a href={href} rel="noopener" className={styles} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={styles} {...props}>
      {children}
    </Link>
  );
}
