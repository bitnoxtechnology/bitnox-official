import type { Metadata } from "next";
import { Suspense } from "react";

import { UnsubscribeForm } from "@/app/(public)/newsletter/unsubscribe/unsubscribe-form";
import { SectionHeading } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * One click out of the newsletter.
 *
 * Not in the public route map in `CLAUDE.md`, and deliberately so: it is not a page anybody
 * navigates to, it is the destination of the unsubscribe link in every newsletter email.
 * Bulk senders increasingly require one, and a list that is hard to leave is a list that
 * gets marked as spam instead, which costs the deliverability of every other message the
 * site sends, including the sign-in codes.
 *
 * `noindex`, because a URL that only means anything with a token attached has nothing to
 * offer a search result.
 *
 * The token is read inside a Suspense boundary. Reading the query string is a dynamic
 * operation, and with Cache Components that has to be a boundary rather than something that
 * quietly opts the whole route out of static rendering.
 */
export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage(props: PageProps<"/newsletter/unsubscribe">) {
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="mx-auto max-w-lg">
          <SectionHeading
            as="h1"
            title="Leave the newsletter"
            description="One click and the address below stops receiving posts. Nothing else about you changes, and you can subscribe again at any time."
          />
          <div className="mt-8">
            <Suspense fallback={<Skeleton className="h-11 w-full rounded-lg" />}>
              <TokenPanel searchParams={props.searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

async function TokenPanel({
  searchParams,
}: {
  searchParams: PageProps<"/newsletter/unsubscribe">["searchParams"];
}) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";

  if (!value) {
    return (
      <p className="text-muted-foreground text-sm">
        This link is missing its token, so there is nothing to remove. Use the unsubscribe link at
        the bottom of any newsletter email, or reply to one and we will take the address off by
        hand.
      </p>
    );
  }

  return <UnsubscribeForm token={value} />;
}
