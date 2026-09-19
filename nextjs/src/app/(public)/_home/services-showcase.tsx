import Image from "next/image";

import { Reveal, ScrollStage, SplitText } from "@/components/motion";
import { SectionHeading } from "@/components/site";
import { ActionButton } from "@/components/site/action-button";
import { Button } from "@/components/ui/button";
import { SERVICE_IMAGES } from "@/content/service-media";
import { SERVICES, servicePath, type Service } from "@/content/services";
import { cn } from "@/lib/utils";

/**
 * The services, shown one at a time.
 *
 * This replaced a two-by-two grid of glass cards, each with an icon, the name, the summary
 * and three capabilities. The grid said the right things and looked like every agency site
 * built from the same kit, which on the one page whose job is to say what Bitnox actually
 * makes is the wrong impression to leave.
 *
 * What is here instead is the layout product companies use to walk through a system: the
 * copy for each service is a chapter that scrolls, and beside it a stage stays put and shows
 * that service's picture. As the reader reaches the next chapter the stage turns to the next
 * one, the picture in front of them tipping away and the new one rising into place. By the
 * bottom of the section they have seen all four without opening anything, which is a far
 * better answer to "what do you do" than four icons.
 *
 * The pictures come from `content/service-media.ts` and are placeholders until real ones are
 * dropped over them. They replaced the drawn interfaces from `components/graphics/` here
 * only. The services hub and the service pages still show the drawings.
 *
 * Under the stage, a strip of tabs names each service and draws a line across itself as the
 * reader moves through that chapter. It is the reader's position, scrubbed to the scroll
 * bar, and pressing a tab scrolls to its chapter, so the strip is a table of contents as
 * much as a progress bar.
 *
 * On a phone there is no room beside the copy for a stage, so each chapter carries its own
 * picture beneath its capability list instead and the stage is not rendered. The two never
 * appear together.
 *
 * The section is a server component. `ScrollStage` finds the chapters, slides and tabs by
 * role and sets their state; the movement between states is CSS on the elements here, and
 * the only GSAP is the scrubbed line in the strip. Nothing in the pictures or the copy goes
 * through a client bundle.
 *
 * The composition rules hold. There are no cards: the chapters are ruled blocks on the page
 * ground, the capabilities are ruled rows, and the one rounded panel in the section is the
 * frame around each picture, which is the frame the photographs elsewhere on the site sit
 * in. The lines around the stage are the page's construction lines from the hero, drawn
 * again here so the stage reads as a place on the page rather than a picture floating over
 * it.
 *
 * Cloud infrastructure, digital marketing and cybersecurity appear in the capability rows
 * rather than as chapters of their own, which is where the keywords live without the site
 * pretending to have seven services.
 */
export function ServicesShowcase() {
  const count = String(SERVICES.length).padStart(2, "0");

  return (
    <ScrollStage asChild>
      <section id="services" aria-labelledby="services-heading" className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we do"
            title={
              <span id="services-heading">
                Our services, and the work that sits inside each one
              </span>
            }
            description="Most projects start in one of these and end up touching two."
          />

          <div className="mt-section-sm grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-20">
            <div className="lg:col-span-5">
              {SERVICES.map((service, index) => (
                <Chapter key={service.slug} service={service} index={index} count={count} />
              ))}
            </div>

            {/* The stage. `lg` and up only; below that each chapter shows its own graphic. */}
            <div className="hidden lg:col-span-7 lg:block">
              <div className="lg:sticky lg:top-28">
                <Stage />
              </div>
            </div>
          </div>
        </div>
      </section>
    </ScrollStage>
  );
}

/**
 * One service, as a chapter.
 *
 * A number and the tagline, the name rising out of its mask on arrival, the summary, every
 * capability as a ruled row, and the link to the page. The rows sit back at half weight
 * until the chapter is the current one, then slide into place one after another, which is
 * the moment the stage beside them is turning to this service's screen.
 *
 * `SplitText` owns the heading's `aria-label`, so the id the chapter is labelled by sits on
 * a visually hidden copy rather than on the split markup.
 */
function Chapter({ service, index, count }: { service: Service; index: number; count: string }) {
  const number = String(index + 1).padStart(2, "0");
  const headingId = `service-chapter-${service.slug}`;

  return (
    <section
      data-stage="chapter"
      data-state={index === 0 ? "active" : "idle"}
      aria-labelledby={headingId}
      className="group/chapter border-border flex flex-col justify-center border-t py-12 last:border-b lg:min-h-[72svh] lg:py-16"
    >
      <Reveal>
        <p className="text-2xs text-primary flex items-center gap-3 font-medium tracking-[0.16em] uppercase">
          <span className="shrink-0 whitespace-nowrap tabular-nums">
            {number}
            <span className="text-muted-foreground"> / {count}</span>
          </span>
          <span aria-hidden className="bg-border h-px w-8 shrink-0" />
          <span>{service.tagline}</span>
        </p>
      </Reveal>

      <span id={headingId} className="sr-only">
        {service.name}
      </span>
      <SplitText
        as="h3"
        trigger="scroll"
        text={service.name}
        className="text-foreground mt-5 text-3xl font-semibold sm:text-4xl"
      />

      <Reveal delay={0.1}>
        <p className="text-muted-foreground measure mt-5 text-base sm:text-lg">{service.summary}</p>
      </Reveal>

      {/* <ol className="border-border mt-8 border-t">
        {service.capabilities.map((capability, capabilityIndex) => (
          <li
            key={capability}
            style={{ "--i": capabilityIndex } as CSSProperties}
            className={cn(
              "border-border flex items-baseline gap-4 border-b py-3 text-sm",
              // Each row waits its turn: seventy milliseconds more than the one above it.
              "transition-[opacity,translate] [transition-delay:calc(var(--i)*70ms)] duration-500 ease-out",
              "-translate-x-2 opacity-50",
              "group-data-[state=active]/chapter:translate-x-0 group-data-[state=active]/chapter:opacity-100",
            )}
          >
            <span className="text-2xs text-muted-foreground group-data-[state=active]/chapter:text-primary w-6 shrink-0 font-medium tracking-[0.16em] tabular-nums transition-colors [transition-delay:calc(var(--i)*70ms)] duration-500">
              {String(capabilityIndex + 1).padStart(2, "0")}
            </span>
            <span className="text-foreground">{capability}</span>
          </li>
        ))}
      </ol> */}

      <Reveal delay={0.15} className="mt-8">
        <ActionButton href={servicePath(service.slug)} size="sm">
          Read about {service.name}
        </ActionButton>
      </Reveal>

      {/* The chapter's own picture, for the widths where there is no stage beside it. */}
      <div className="mt-10 lg:hidden">
        <ServiceImage service={service} sizes="100vw" />
      </div>
    </section>
  );
}

/**
 * The stage and the strip under it.
 *
 * Every slide sits in the same grid cell and every picture is the same 16:10 box, so the
 * stage is one fixed height and nothing shifts when the slide changes. A reader is never
 * looking at a panel that resizes under them.
 *
 * One slide is visible at a time. A slide the reader has
 * passed has tipped back and up; one still to come waits below, tipped the other way; the
 * current one is flat and full. The move between those is a single CSS transition on
 * `transform` and `opacity`, with `visibility` riding along so a hidden slide is also out
 * of the accessibility tree and takes no clicks.
 *
 * The construction lines run a step outside the stage on all four sides, with a small mark
 * at each corner, the way a drawing is registered on a sheet.
 */
function Stage() {
  return (
    <div>
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute -inset-6">
          <span className="rule-x absolute inset-x-0 top-0 h-px" />
          <span className="rule-x absolute inset-x-0 bottom-0 h-px" />
          <span className="rule-y absolute inset-y-0 left-0 w-px" />
          <span className="rule-y absolute inset-y-0 right-0 w-px" />
          <CornerMark className="top-0 left-0" />
          <CornerMark className="top-0 right-0" />
          <CornerMark className="bottom-0 left-0" />
          <CornerMark className="right-0 bottom-0" />
        </div>

        <div className="grid [perspective:1600px]">
          {SERVICES.map((service, index) => (
            <div
              key={service.slug}
              data-stage="slide"
              data-state={index === 0 ? "active" : "after"}
              className={cn(
                "col-start-1 row-start-1 self-center",
                "invisible opacity-0 transition-[opacity,transform,visibility] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform [backface-visibility:hidden]",
                "data-[state=before]:[transform:translateY(-7%)_scale(0.94)_rotateX(8deg)]",
                "data-[state=after]:[transform:translateY(9%)_scale(0.94)_rotateX(-8deg)]",
                "data-[state=active]:visible data-[state=active]:[transform:none] data-[state=active]:opacity-100",
                // The frame casts onto the page, so the stage reads as lifted rather than
                // printed. Dark, not cyan: a shadow, not a glow.
                "[&_figure]:shadow-[0_48px_90px_-40px_rgba(0,0,0,0.85)]",
              )}
            >
              {/* Half the grid at `lg`, a little under half the 80rem page at `xl`. */}
              <ServiceImage service={service} sizes="(max-width: 1024px) 100vw, 45vw" />
            </div>
          ))}
        </div>
      </div>

      <nav aria-label="Services on the stage" className="mt-8">
        <ol className="grid auto-cols-fr grid-flow-col gap-4">
          {SERVICES.map((service, index) => (
            <li key={service.slug}>
              <Button
                type="button"
                variant="ghost"
                data-stage="tab"
                aria-current={index === 0 ? "true" : undefined}
                className="group/tab h-auto w-full flex-col items-stretch gap-3 rounded-none px-0 py-2 text-left whitespace-normal hover:bg-transparent dark:hover:bg-transparent"
              >
                {/* The rail, and the line that draws along it with the reader. Drawn is
                    the resting state. */}
                <span className="bg-border relative block h-px w-full overflow-hidden">
                  <span data-stage="fill" className="bg-primary absolute inset-0 origin-left" />
                </span>
                {/* Number above name, so every tab is the same height whatever the name's
                    length and the strip reads as one row. */}
                <span className="text-2xs text-muted-foreground group-aria-[current=true]/tab:text-primary block font-medium tracking-[0.16em] tabular-nums transition-colors">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-muted-foreground group-hover/tab:text-foreground group-aria-[current=true]/tab:text-foreground block text-xs font-medium transition-colors">
                  {service.name}
                </span>
              </Button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

/**
 * The picture that stands for one service.
 *
 * A fixed 16:10 box with the image cropped to fill it, so the stage is the same height on
 * every slide and swapping a file cannot change the layout. That matters more here than on
 * an ordinary figure: the four slides share one grid cell, and a picture that sized itself
 * would resize the stage under the reader every time the chapter changed.
 *
 * `sizes` is passed in rather than fixed, because the same component is the full width of a
 * phone in a chapter and a little under half the page on the stage, and one value for both
 * would have every phone downloading the desktop file.
 *
 * The frame is the one the photographs elsewhere on the site use: the glass surface, the
 * hairline and the same radius. It is one of the two rounded panels this page is allowed.
 */
function ServiceImage({ service, sizes }: { service: Service; sizes: string }) {
  const image = SERVICE_IMAGES[service.slug];

  return (
    <figure className="glass relative aspect-16/10 w-full overflow-hidden rounded-xl">
      <Image src={image.url} alt={image.alt} fill sizes={sizes} className="object-cover" />
    </figure>
  );
}

/** A registration mark: a small cross where two construction lines meet. */
function CornerMark({ className }: { className: string }) {
  return (
    <span
      className={cn(
        "absolute size-3 -translate-x-1/2 -translate-y-1/2",
        "before:bg-primary before:absolute before:inset-x-0 before:top-1/2 before:h-px",
        "after:bg-primary after:absolute after:inset-y-0 after:left-1/2 after:w-px",
        className,
      )}
    />
  );
}
