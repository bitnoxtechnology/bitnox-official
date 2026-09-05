import Image from "next/image";
import Link from "next/link";

import { ShareLinks } from "@/app/(public)/blog/_sections/share-links";
import { Reveal, SplitText } from "@/components/motion";
import { formatDate } from "@/components/site";
import { Badge } from "@/components/ui/badge";
import type { BlogDTO } from "@/lib/dto";

/**
 * The top of a post.
 *
 * It follows the page composition rule the rest of the site follows: breadcrumb, eyebrow,
 * `SplitText` headline, one lead paragraph at reading measure, then something real
 * underneath at `max-w-5xl`. On a post the real thing is the cover photograph, which is also
 * the Open Graph image and the likely LCP element, so it is the one image on the page marked
 * priority.
 *
 * The headline is the post's own title rather than a claim written for it, which is the one
 * departure from the hero rule and the correct one: a reader arrived here from a search
 * result carrying that title, and showing them a different sentence is a bounce.
 *
 * The byline row carries the four things a reader checks before committing: who wrote it,
 * when, how long it takes and whether it has been revised. The updated date appears only
 * when the post has actually been edited since publication, for the same reason the
 * structured data omits it: every document has an `updatedAt`, and showing it unconditionally
 * would mark every post as revised on the day it went out.
 */
export function PostHeader({ post }: { post: BlogDTO }) {
  const updated =
    post.publishedAt && post.updatedAt > post.publishedAt ? post.updatedAt : undefined;

  return (
    <header className="pt-section-sm lg:pt-section">
      <div className="container-page">
        <nav aria-label="Breadcrumb">
          <ol className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-xs">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground max-w-[16rem] truncate" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        <div className="mx-auto mt-10 max-w-4xl text-center">
          {post.category ? (
            <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
              {post.category}
            </p>
          ) : null}

          <SplitText
            as="h1"
            by="word"
            delay={0.1}
            text={post.title}
            className="text-foreground text-4xl font-semibold sm:text-5xl"
          />

          <Reveal delay={0.3}>
            <p className="text-muted-foreground text-lead mt-stack measure mx-auto">
              {post.excerpt}
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
              {post.author ? <span className="text-foreground">{post.author.name}</span> : null}
              {post.publishedAt ? (
                <>
                  <span aria-hidden>.</span>
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                </>
              ) : null}
              <span aria-hidden>.</span>
              <span>{post.readingMinutes} minute read</span>
              {updated ? (
                <>
                  <span aria-hidden>.</span>
                  <span>
                    Updated <time dateTime={updated}>{formatDate(updated)}</time>
                  </span>
                </>
              ) : null}
            </div>
          </Reveal>

          {post.tags.length > 0 ? (
            <Reveal delay={0.45}>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
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
            </Reveal>
          ) : null}

          <Reveal delay={0.5}>
            <ShareLinks
              title={post.title}
              path={`/blog/${post.slug}`}
              className="mt-8 justify-center"
            />
          </Reveal>
        </div>

        {post.coverImage ? (
          <Reveal delay={0.55}>
            <figure className="mt-section-sm mx-auto max-w-5xl">
              <div className="glass relative aspect-16/9 w-full overflow-hidden rounded-2xl">
                <Image
                  src={post.coverImage.url}
                  alt={post.coverImage.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 64rem"
                  priority
                  className="object-cover"
                />
              </div>
              {post.coverImage.caption ? (
                <figcaption className="text-muted-foreground mt-3 text-center text-sm">
                  {post.coverImage.caption}
                </figcaption>
              ) : null}
            </figure>
          </Reveal>
        ) : null}
      </div>
    </header>
  );
}
