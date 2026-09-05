import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PostBody } from "@/app/(public)/blog/_sections/post-body";
import { Reveal, SplitText, StaggerGroup } from "@/components/motion";
import { BreadcrumbListSchema } from "@/components/seo/BreadcrumbListSchema";
import { ImageGallerySchema } from "@/components/seo/ImageGallerySchema";
import { CTABand, SectionHeading, formatDate } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { Gallery, type GalleryImage } from "@/components/site/gallery";
import { ProjectCard } from "@/components/site/project-card";
import { PortfolioGridSkeleton } from "@/components/skeleton";
import { Badge } from "@/components/ui/badge";
import { serviceName, servicePath } from "@/content/services";
import type { ServiceSlug } from "@/lib/constants";
import type { ProjectDTO } from "@/lib/dto";
import {
  getProjectBySlug,
  getPublishedProjectSlugs,
  getRelatedProjects,
} from "@/lib/queries/portfolio";
import { withPlaceholder } from "@/lib/static-params";

/**
 * One project.
 *
 * The page a proposal links to, so it is written to answer the three questions somebody has
 * about work that is not theirs: what the problem was, what was actually built, and what
 * changed afterwards. The facts strip under the hero carries the rest, which is the client,
 * the sector, the services involved and what it was built with.
 *
 * The case study body is `contentHtml`, the snapshot written when the project was saved, and
 * it is rendered through the same component the blog uses. Two renderers for stored editor
 * output would mean two sets of prose styles, and the second one would be the one that never
 * gets fixed.
 *
 * Every published slug is prerendered. As on the blog, `dynamicParams = false` is rejected by
 * Cache Components, so a slug outside the set reaches the page at request time and the
 * `notFound()` below answers it, which is also what makes a project published after the last
 * build reachable.
 *
 * The gallery carries `ImageObject` markup for the same reason the Event Space one does:
 * photographs of finished work are worth as much in image search as the page is in web
 * search, and the markup is what puts a caption and a source page on each one.
 */

export async function generateStaticParams() {
  return withPlaceholder(await getPublishedProjectSlugs(), "slug");
}

export async function generateMetadata({
  params,
}: PageProps<"/portfolio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return {};

  const title = project.seoTitle ?? project.title;
  const description = project.seoDescription ?? project.summary;
  const path = `/portfolio/${project.slug}`;
  const image = project.ogImage ?? project.coverImage;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title,
      description,
      ...(image ? { images: [{ url: image.url, alt: image.alt }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const gallery: GalleryImage[] = project.images.map((image) => ({
    url: image.url,
    alt: image.alt,
    caption: image.caption,
  }));

  return (
    <>
      <BreadcrumbListSchema
        crumbs={[
          { name: "Home", path: "/" },
          { name: "Portfolio", path: "/portfolio" },
          { name: project.title, path: `/portfolio/${project.slug}` },
        ]}
      />
      {gallery.length > 0 ? (
        <ImageGallerySchema
          images={gallery}
          name={`${project.title} gallery`}
          path={`/portfolio/${project.slug}`}
        />
      ) : null}

      <article>
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
                  <Link href="/portfolio" className="hover:text-foreground transition-colors">
                    Portfolio
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-foreground max-w-[16rem] truncate" aria-current="page">
                  {project.title}
                </li>
              </ol>
            </nav>

            <div className="mx-auto mt-10 max-w-4xl text-center">
              {project.client ? (
                <p className="text-2xs text-primary mb-4 font-medium tracking-[0.16em] uppercase">
                  {project.client}
                </p>
              ) : null}

              <SplitText
                as="h1"
                by="word"
                delay={0.1}
                text={project.title}
                className="text-foreground text-4xl font-semibold sm:text-5xl"
              />

              <Reveal delay={0.3}>
                <p className="text-muted-foreground text-lead mt-stack measure mx-auto">
                  {project.summary}
                </p>
              </Reveal>

              {project.liveUrl || project.repoUrl ? (
                <Reveal delay={0.4}>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    {project.liveUrl ? (
                      <ActionButton href={project.liveUrl} external size="sm">
                        Visit the site
                      </ActionButton>
                    ) : null}
                    {project.repoUrl ? (
                      <ActionButton href={project.repoUrl} external variant="outline" size="sm">
                        See the code
                      </ActionButton>
                    ) : null}
                  </div>
                </Reveal>
              ) : null}
            </div>

            {project.coverImage ? (
              <Reveal delay={0.5}>
                <figure className="mt-section-sm mx-auto max-w-5xl">
                  <div className="glass relative aspect-16/10 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={project.coverImage.url}
                      alt={project.coverImage.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 64rem"
                      priority
                      className="object-cover"
                    />
                  </div>
                  {project.coverImage.caption ? (
                    <figcaption className="text-muted-foreground mt-3 text-center text-sm">
                      {project.coverImage.caption}
                    </figcaption>
                  ) : null}
                </figure>
              </Reveal>
            ) : null}
          </div>
        </header>

        <ProjectFacts project={project} />

        {project.contentHtml ? (
          <div className="pt-section-sm">
            <PostBody html={project.contentHtml} />
          </div>
        ) : null}

        {gallery.length > 0 ? (
          <section className="section-y">
            <div className="container-page">
              <SectionHeading
                eyebrow="The work"
                title="Screens from the finished build"
                description="What the people who use it see, rather than a mock-up of what it was meant to look like."
              />
              <Gallery
                images={gallery}
                label={`${project.title} gallery`}
                priorityFirst={false}
                className="mt-section-sm"
              />
            </div>
          </section>
        ) : null}
      </article>

      <Suspense fallback={<RelatedFallback />}>
        <RelatedProjects slug={project.slug} services={project.services} />
      </Suspense>

      <CTABand
        title="Something like this, for you"
        description="Tell us what has to change and who uses the thing today. We will come back with questions first, then a scope, a schedule and a figure."
        action={{ label: "Start a project", href: "/contact" }}
        secondaryAction={{ label: "See more work", href: "/portfolio" }}
      />
    </>
  );
}

/**
 * The facts under the hero.
 *
 * A ruled definition list rather than a row of cards, per the page composition rule. Every
 * row is omitted when it has nothing in it, because plenty of work is under an agreement that
 * does not allow the client's name and an empty "Client" label draws attention to the gap.
 */
function ProjectFacts({ project }: { project: ProjectDTO }) {
  const completed = project.completedAt ? formatDate(project.completedAt) : undefined;

  return (
    <section className="pt-section-sm">
      <div className="container-page">
        <dl className="border-border divide-border mx-auto grid max-w-5xl divide-y border-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {project.client ? (
            <Fact label="Client">
              <span className="text-foreground">{project.client}</span>
            </Fact>
          ) : null}

          {project.industry ? (
            <Fact label="Sector">
              <span className="text-foreground">{project.industry}</span>
            </Fact>
          ) : null}

          {project.services.length > 0 ? (
            <Fact label="Services">
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {project.services.map((slug) => (
                  <li key={slug}>
                    <Link href={servicePath(slug)} className="text-primary">
                      {serviceName(slug)}
                    </Link>
                  </li>
                ))}
              </ul>
            </Fact>
          ) : null}

          {completed ? (
            <Fact label="Completed">
              <time dateTime={project.completedAt} className="text-foreground">
                {completed}
              </time>
            </Fact>
          ) : null}
        </dl>

        {project.techStack.length > 0 ? (
          <div className="mx-auto mt-8 max-w-5xl">
            <h2 className="text-2xs text-muted-foreground mb-3 font-medium tracking-[0.14em] uppercase">
              Built with
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.techStack.map((item) => (
                <li key={item}>
                  <Badge variant="secondary">{item}</Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-0 py-6 sm:px-6 lg:first:pl-0">
      <dt className="text-2xs text-primary mb-2 font-medium tracking-[0.14em] uppercase">
        {label}
      </dt>
      <dd className="text-muted-foreground text-base">{children}</dd>
    </div>
  );
}

async function RelatedProjects({
  slug,
  services,
}: {
  slug: string;
  services: readonly ServiceSlug[];
}) {
  const projects = await getRelatedProjects(slug, services, 3);

  if (projects.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="More work"
            title="Other projects worth a look"
            description="Work in the same services first, then the rest of the portfolio."
          />
          <ActionButton href="/portfolio" variant="outline" size="sm">
            See everything
          </ActionButton>
        </div>

        <StaggerGroup
          asChild
          selector="li"
          className="mt-section-sm grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <ul>
            {projects.map((project) => (
              <li key={project.id} className="h-full">
                <ProjectCard project={project} className="h-full" />
              </li>
            ))}
          </ul>
        </StaggerGroup>
      </div>
    </section>
  );
}

function RelatedFallback() {
  return (
    <section className="section-y">
      <div className="container-page">
        <PortfolioGridSkeleton count={3} />
      </div>
    </section>
  );
}
