import Link from "next/link";

import { Reveal, SplitText } from "@/components/motion";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { CTABand } from "@/components/site/cta-band";
import { RichText } from "@/components/site/rich-text";
import { BUSINESS } from "@/content/business";
import type { LegalDocument, LegalSection } from "@/content/legal";
import { LEGAL_LAST_UPDATED_ISO } from "@/content/legal";

/**
 * The shape both legal documents are drawn in.
 *
 * One component, because the terms and the privacy policy are the same kind of page and two
 * copies of this layout would drift apart in exactly the way the legacy versions did. The
 * documents themselves are content in `src/content/legal.ts`; this decides the numbering, the
 * anchors, the table of contents and the rhythm, and holds no copy of its own beyond the
 * three labels around the edges.
 *
 * The section numbers are computed from position rather than written into the content, so
 * inserting a clause renumbers the document and its contents list together. The anchors are
 * not: they are stable ids from the content module, because these headings get linked to
 * from contracts and emails and a link that moves when a clause is added is a link that
 * breaks.
 *
 * The table of contents is a real list of in-page links rather than a sticky sidebar widget.
 * On a document somebody has been sent to read one clause of, jumping to it is the whole
 * requirement, and the browser does that on its own.
 *
 * Both pages are indexable. A legal page carries the name, address and undertakings of the
 * business and is one of the pages a search engine uses to decide the site is a real company,
 * so hiding it costs more than it saves.
 */
export function LegalPage({ document }: { document: LegalDocument }) {
  // The other document, so each page offers the one a reader is likely to want next.
  const counterpart =
    document.path === "/privacy"
      ? { label: "Read the terms", href: "/terms" }
      : { label: "Read the privacy policy", href: "/privacy" };

  return (
    <>
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: document.title, path: document.path },
        ]}
      />

      <section className="pt-section-sm pb-section-sm lg:pt-section">
        <div className="container-page">
          <nav aria-label="Breadcrumb">
            <ol className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 text-xs">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-foreground" aria-current="page">
                {document.title}
              </li>
            </ol>
          </nav>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
              {document.title}
            </p>

            <SplitText
              as="h1"
              by="word"
              delay={0.1}
              text={document.headline}
              className="text-foreground text-4xl font-semibold sm:text-5xl"
            />

            <Reveal delay={0.3}>
              <p className="text-muted-foreground text-lead mt-stack measure mx-auto">
                {document.lead}
              </p>
            </Reveal>

            <Reveal delay={0.4}>
              <dl className="text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
                <div className="flex gap-2">
                  <dt>Effective</dt>
                  <dd className="text-foreground">{document.effective}</dd>
                </div>
                <div className="flex gap-2">
                  <dt>Last updated</dt>
                  <dd className="text-foreground">
                    <time dateTime={LEGAL_LAST_UPDATED_ISO}>{document.lastUpdated}</time>
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt>Governed by</dt>
                  <dd className="text-foreground">the laws of {BUSINESS.country}</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pb-section-sm">
        <div className="container-page">
          <nav aria-labelledby="contents-heading" className="border-border border-y py-8">
            <h2
              id="contents-heading"
              className="text-2xs text-primary mb-6 font-medium tracking-[0.14em] uppercase"
            >
              Contents
            </h2>
            <ol className="grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
              {document.sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-muted-foreground hover:text-primary flex gap-3 text-sm transition-colors"
                  >
                    <span className="text-primary/70 tabular-nums">{number(index)}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      <div className="pb-section">
        <div className="container-page">
          <div className="mx-auto max-w-prose">
            {document.sections.map((section, index) => (
              <Section key={section.id} section={section} index={index} />
            ))}
          </div>
        </div>
      </div>

      <CTABand
        title="Ask before you sign, not after"
        description="If anything here needs clarifying for your situation, say which clause and what you need to know. We would rather answer it now than have it come up halfway through a project."
        action={{ label: "Ask a question", href: "/contact" }}
        secondaryAction={counterpart}
      />
    </>
  );
}

function Section({ section, index }: { section: LegalSection; index: number }) {
  return (
    // `scroll-mt` clears the sticky header, so a jump from the contents list lands on the
    // heading rather than under the bar.
    <section id={section.id} className="border-border scroll-mt-28 border-t py-10 first:border-t-0">
      <div className="mb-6 flex items-baseline gap-4">
        <span className="text-primary/70 text-sm tabular-nums">{number(index)}</span>
        <h2 className="text-foreground text-2xl font-semibold">{section.title}</h2>
      </div>

      <div className="space-y-5">
        {section.blocks.map((block, blockIndex) => {
          switch (block.type) {
            case "subheading":
              return (
                <h3 key={blockIndex} className="text-foreground pt-2 text-lg font-semibold">
                  {block.text}
                </h3>
              );

            case "list":
              return (
                <ul key={blockIndex} className="space-y-3">
                  {block.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-muted-foreground flex gap-3 text-base">
                      <span
                        className="bg-primary/60 mt-2.5 size-1 shrink-0 rounded-full"
                        aria-hidden
                      />
                      <span>
                        <RichText text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              );

            case "callout":
              return (
                <p
                  key={blockIndex}
                  className="border-primary text-foreground border-l-2 py-1 pl-5 text-base"
                >
                  <RichText text={block.text} />
                </p>
              );

            case "paragraph":
              return (
                <p key={blockIndex} className="text-muted-foreground text-base">
                  <RichText text={block.text} />
                </p>
              );
          }
        })}
      </div>
    </section>
  );
}

/** Two digits, so the numbers align in the contents grid and beside the headings. */
function number(index: number): string {
  return String(index + 1).padStart(2, "0");
}
