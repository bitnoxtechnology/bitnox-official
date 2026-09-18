import Image from "next/image";

import { Parallax, StaggerGroup } from "@/components/motion";
import { ActionButton } from "@/components/site/action-button";
import { SectionHeading } from "@/components/site/section-heading";
import type { AboutTeamMember } from "@/content/about";
import { cn } from "@/lib/utils";

/**
 * The people, as two columns of portraits that drift past each other.
 *
 * Real photographs, which is the one kind of picture the standards ask for, and the reason
 * this section can carry a frame: each portrait is a distinct person with a picture, which is
 * what earns an image-led card its edge. The caption sits under the picture on the page
 * ground rather than inside a panel, so the frame is the photograph's and nothing else's.
 *
 * Two things move. The portraits arrive by `StaggerGroup`'s curtain, unmasked from the
 * bottom edge while the picture settles from slightly enlarged, one after another. And the
 * two columns are each a `Parallax` at a different rate, with the second one set lower, so
 * as the page scrolls they slide past each other by a few percent and the grid stops being a
 * grid. On hover, the picture eases in a little and a cyan line draws across the top of the
 * caption; both are CSS, so they cost nothing on a phone that has no hover.
 *
 * The heading column is sticky beside them, as the FAQ photograph is on the landing page.
 */
export function TeamGrid({ members }: { members: readonly AboutTeamMember[] }) {
  // Two columns, dealt alternately, so the reading order down the page is the order of the
  // array even though the second column starts lower.
  const columns = [
    members.map((member, index) => ({ member, index })).filter(({ index }) => index % 2 === 0),
    members.map((member, index) => ({ member, index })).filter(({ index }) => index % 2 === 1),
  ];

  return (
    <section aria-labelledby="about-team-heading" className="section-y">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionHeading
                eyebrow="The people"
                title={
                  <span id="about-team-heading">
                    The people who will actually be on your project.
                  </span>
                }
                description="There is no account manager between you and the person doing the work. Whoever reads your brief runs the build, and it is the same person you reach when something needs changing two years on."
              />

              <ActionButton href="/contact" variant="outline" size="sm" className="mt-8">
                Talk to one of us
              </ActionButton>
            </div>
          </div>

          <StaggerGroup
            effect="curtain"
            selector="figure"
            stagger={0.09}
            className="grid grid-cols-2 gap-4 sm:gap-6 lg:col-span-8 lg:gap-8"
          >
            {columns.map((column, columnIndex) => (
              <Parallax
                key={columnIndex}
                speed={columnIndex === 0 ? 2 : 6}
                className={cn(
                  "grid content-start gap-4 sm:gap-6 lg:gap-8",
                  columnIndex === 1 && "mt-12 sm:mt-20 lg:mt-28",
                )}
              >
                {column.map(({ member, index }) => (
                  <Portrait key={member.name} member={member} index={index} />
                ))}
              </Parallax>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}

function Portrait({ member, index }: { member: AboutTeamMember; index: number }) {
  return (
    <figure className="group">
      <div className="bg-muted relative aspect-4/5 overflow-hidden rounded-xl">
        {/* The entrance scale goes on this wrapper and the hover scale on the image, so the
            CSS transition never smooths over GSAP's per-frame updates during the arrival. */}
        <div data-stagger-media className="absolute inset-0">
          <Image
            src={member.photo.url}
            alt={member.photo.alt}
            fill
            sizes="(min-width: 1024px) 28vw, 45vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        </div>
        <span
          aria-hidden
          className="border-border pointer-events-none absolute inset-0 rounded-xl border"
        />
      </div>

      <figcaption className="border-border relative mt-4 flex items-baseline justify-between gap-4 border-t pt-4">
        <span
          aria-hidden
          className="bg-primary absolute -top-px left-0 h-px w-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
        <span className="min-w-0">
          <span className="text-foreground block text-base font-semibold sm:text-lg">
            {member.name}
          </span>
          <span className="text-muted-foreground block text-sm">{member.role}</span>
        </span>
        <span className="text-muted-foreground text-2xs shrink-0 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      </figcaption>
    </figure>
  );
}
