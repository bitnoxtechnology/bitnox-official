import Image from "next/image";

import { CLIENT_LOGOS, TRUSTED_BY_HEADING } from "@/content/clients";
import { cn } from "@/lib/utils";

/**
 * The trusted-by row.
 *
 * A server component with no JavaScript at all. The loop is a CSS animation on a track that
 * holds the logo list twice and travels exactly half its own width, so at the moment the
 * first copy leaves the viewport the second copy is sitting where the first began. Measuring
 * widths in an effect, which is how most marquee components work, would ship a client bundle
 * and a layout read for something a keyframe already does.
 *
 * The duplicate is `aria-hidden`. A screen reader hears the eight logos once, not sixteen,
 * and the heading above tells it what the row is.
 *
 * Responsiveness is the part these usually get wrong. The row is not a grid that reflows, so
 * a narrow viewport shows fewer logos rather than smaller ones, and the gap and logo height
 * step down at `sm` so the marks stay legible on a phone instead of shrinking to slivers.
 * The duration is set per breakpoint through a custom property, because the same speed across
 * a 375px viewport looks roughly three times faster than across a desktop one.
 *
 * The fade at both edges is a mask rather than two gradient overlays, so it works over the
 * page ground without a hardcoded colour that would have to be updated with the palette.
 *
 * The spacing between logos is trailing padding on each item, not `gap` on the track, and
 * that detail is what makes the loop seamless rather than nearly seamless. `gap` sits between
 * items and not after the last one, so a track of sixteen logos is sixteen logos plus fifteen
 * gaps, and half of that is eight logos plus seven and a half. Travelling 50% would then land
 * half a gap short of where the second copy begins and the row would visibly jump every time
 * it came round. Padding is part of each item's own box, so all sixteen boxes are identical
 * and half the track is exactly one copy.
 */
export function LogoMarquee({ className }: { className?: string }) {
  const track = [...CLIENT_LOGOS, ...CLIENT_LOGOS];

  return (
    <section aria-labelledby="trusted-by" className={cn("overflow-hidden", className)}>
      <h2
        id="trusted-by"
        className="text-muted-foreground text-center text-sm font-medium sm:text-base"
      >
        {TRUSTED_BY_HEADING}
      </h2>

      {/* `overflow-hidden` here as well as on the section, because a mask defaults to
          repeating: without a clip of its own this box would tile the fade across the part of
          the track that overflows it and paint a row of gradient bands. */}
      <div className="relative mt-8 overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [--marquee-duration:28s] sm:[--marquee-duration:45s]">
        <ul className="animate-marquee flex w-max items-center">
          {track.map((logo, index) => (
            <li
              key={`${logo.src}-${index}`}
              // The second pass through the list is the seam that makes the loop continuous.
              // It is the same eight logos, so it is hidden from assistive technology.
              aria-hidden={index >= CLIENT_LOGOS.length}
              className="shrink-0 pr-10 sm:pr-16"
            >
              <Image
                src={logo.src}
                alt={index >= CLIENT_LOGOS.length ? "" : logo.name}
                width={logo.width}
                height={logo.height}
                className="h-7 w-auto opacity-45 sm:h-9"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
