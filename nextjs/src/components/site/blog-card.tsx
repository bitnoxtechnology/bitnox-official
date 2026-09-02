import Image from "next/image";
import Link from "next/link";

import { GlassCard } from "@/components/site/glass-card";
import { Badge } from "@/components/ui/badge";
import type { BlogCardDTO } from "@/lib/dto";
import { cn } from "@/lib/utils";

/**
 * A post in a list.
 *
 * Built once here because the landing page, the blog index and the tag pages all show the
 * same thing, and three copies of a card is how three pages end up with three slightly
 * different reading-time formats.
 *
 * The whole card is one link rather than a link on the title with a separate "read more"
 * underneath. Two links to the same place is one extra stop for anybody tabbing through, and
 * it doubles what a screen reader has to announce for each post.
 */
export function BlogCard({
  post,
  priority = false,
  className,
}: {
  post: BlogCardDTO;
  /** True only for a card above the fold, so the browser is not told everything is urgent. */
  priority?: boolean;
  className?: string;
}) {
  return (
    <GlassCard asChild interactive padding="none" className={cn("overflow-hidden", className)}>
      <article>
        <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
          {post.coverImage ? (
            <div className="bg-muted relative aspect-16/9 w-full overflow-hidden">
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ) : null}

          <div className="flex flex-1 flex-col p-6">
            {post.category ? (
              <Badge variant="secondary" className="mb-3 w-fit">
                {post.category}
              </Badge>
            ) : null}

            <h3 className="text-foreground text-xl font-semibold">{post.title}</h3>
            <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">{post.excerpt}</p>

            <p className="text-muted-foreground mt-4 flex items-center gap-2 pt-2 text-xs">
              {post.publishedAt ? (
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              ) : null}
              <span aria-hidden>.</span>
              <span>{post.readingMinutes} minute read</span>
            </p>
          </div>
        </Link>
      </article>
    </GlassCard>
  );
}

/**
 * British long form, and always `en-GB`.
 *
 * Without the explicit locale the date is formatted by whichever locale the rendering
 * machine happens to have, so a build server in another region silently changes every date
 * on the site.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
