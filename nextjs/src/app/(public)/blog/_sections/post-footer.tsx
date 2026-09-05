import Link from "next/link";

import { ShareLinks } from "@/app/(public)/blog/_sections/share-links";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Badge } from "@/components/ui/badge";
import type { BlogDTO } from "@/lib/dto";

/**
 * What sits under the last paragraph.
 *
 * Three things, in the order somebody who has finished reading wants them: the tags, so the
 * subject can be followed sideways; the share row, repeated here because the one in the
 * header was passed before the post had been read; and the newsletter, which is the only
 * thing on the page asking for something.
 *
 * It is set at the same measure as the post rather than at full width, so the end of the
 * article and the end of the reading column are the same edge.
 *
 * There are no author bios and no "you might also like" tiles here. The byline is in the
 * header where it belongs, and the related posts have their own section below with room to
 * show what they are.
 */
export function PostFooter({ post }: { post: BlogDTO }) {
  return (
    <section className="pt-section-sm">
      <div className="container-page">
        <div className="mx-auto max-w-prose">
          {post.tags.length > 0 ? (
            <div className="border-border border-t pt-8">
              <h2 className="text-2xs text-primary mb-4 font-medium tracking-[0.14em] uppercase">
                Filed under
              </h2>
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`/blog/tag/${tag}`}>
                      <Badge
                        variant="secondary"
                        className="hover:border-primary/40 transition-colors"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="border-border mt-10 border-t pt-8">
            <ShareLinks title={post.title} path={`/blog/${post.slug}`} />
          </div>

          <div className="border-border mt-10 border-t pt-8">
            <h2 className="text-foreground text-xl font-semibold">Get the next one by email</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              What we have built, what we learned building it, and news from the Event Space. A few
              times a month, and one click to stop.
            </p>
            <NewsletterForm source="blog-post" className="mt-5 max-w-md" />
          </div>
        </div>
      </div>
    </section>
  );
}
