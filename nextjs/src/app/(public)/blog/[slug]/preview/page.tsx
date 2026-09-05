import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostBody } from "@/app/(public)/blog/_sections/post-body";
import { PostHeader } from "@/app/(public)/blog/_sections/post-header";
import { formatDate } from "@/components/site";
import { Badge } from "@/components/ui/badge";
import { verifyPreviewToken } from "@/lib/blog/preview";
import { requireUser } from "@/lib/auth/guards";
import { getPostBySlugForPreview } from "@/lib/queries/blog";

/**
 * A post in any state, for the person writing it.
 *
 * `/blog/[slug]` renders published posts only and 404s on everything else, which is right for
 * the public route and leaves a writer with no way to see a draft in the real layout. This is
 * that way, and it is guarded twice.
 *
 * `requireUser()` first, so the request has a session behind it. Then the token, which proves
 * the link was issued by this application for this slug. Either gate alone would be too weak:
 * a token becomes a public URL the moment it is forwarded, and a session alone would let any
 * signed-in account walk the slug space to read work in progress.
 *
 * The order matters. The session check redirects to sign-in, which is what somebody following
 * a preview link from an email should get. Checking the token first would 404 them instead
 * and tell them nothing.
 *
 * `noindex, nofollow` on the page, which is belt and braces rather than the mechanism: the
 * route reads a session cookie, so it is dynamic and a crawler is never signed in. Neither is
 * a reason to leave the directive off a URL that renders unpublished writing.
 *
 * Nothing here is cached. A draft changes on every save, and a cached preview is a preview of
 * a version that has already been replaced.
 */

/**
 * The one blocking route on the public side.
 *
 * Every other page here is a prerendered shell with the dynamic parts streamed in behind
 * Suspense, and that pattern cannot apply to this one. There is no shell to prerender: the
 * page must not render anything at all until the session and the token have been checked,
 * because what it renders is unpublished writing. Streaming the article in behind a boundary
 * would mean prerendering the frame around a draft for a visitor who turns out not to be
 * signed in.
 *
 * Declaring it blocking says exactly that, and it is the honest description. Nobody reaches
 * this URL from a link on the site; they follow it from the admin, once, having already
 * waited for a page load to get there.
 */
export const instant = false;

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false, nocache: true },
};

export default async function BlogPreviewPage({
  params,
  searchParams,
}: PageProps<"/blog/[slug]/preview">) {
  await requireUser();

  const { slug } = await params;
  const { token } = await searchParams;

  const supplied = Array.isArray(token) ? token[0] : token;

  if (!(await verifyPreviewToken(slug, supplied))) notFound();

  const post = await getPostBySlugForPreview(slug);

  if (!post) notFound();

  return (
    <>
      {/*
       * A banner, not a subtle badge. The page below it is pixel for pixel the published
       * layout, which is the point of a preview and also the way somebody ends up sending a
       * draft URL to a client believing it is live.
       */}
      <div className="border-primary/30 bg-accent/40 border-b">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-3">
          <p className="text-foreground flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="secondary" className="uppercase">
              Preview
            </Badge>
            <span>
              This post is <span className="text-primary font-medium">{post.status}</span>
              {post.status === "scheduled" && post.scheduledFor
                ? `, going out on ${formatDate(post.scheduledFor)}`
                : ""}
              . Only signed-in accounts with this link can see it.
            </span>
          </p>
          <Link href="/admin/blog" className="text-primary text-sm font-medium">
            Back to the blog admin
          </Link>
        </div>
      </div>

      <article>
        <PostHeader post={post} />

        <div className="pt-section-sm pb-section">
          <PostBody html={post.contentHtml} />
        </div>
      </article>
    </>
  );
}
