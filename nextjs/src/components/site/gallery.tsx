"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * The shape of an image everywhere on this site: an object with required alt text.
 *
 * Declared here rather than imported from `src/lib/dto.ts` so a client component does not
 * take a type dependency on the module that imports the Mongoose models.
 */
export type GalleryImage = {
  url: string;
  alt: string;
  caption?: string;
};

type GalleryProps = {
  images: GalleryImage[];
  /** Columns at the widest breakpoint. Two for large photographs, three for a set. */
  columns?: 2 | 3;
  /** Used in the lightbox heading, so a screen reader knows which gallery opened. */
  label: string;
  className?: string;
};

/**
 * A grid of photographs that opens into a lightbox.
 *
 * Built for the Event Space page, reused by portfolio projects. The first image is eager and
 * high priority because on the Event Space page it is the largest thing on screen and
 * usually the LCP element; the rest are lazy.
 *
 * The tiles are real buttons, not clickable divs, so the whole gallery is reachable by
 * keyboard for free, and the lightbox is a Radix dialog, so focus trapping, Escape and the
 * inert background come with it. Left and right arrows move between images.
 */
export function Gallery({ images, columns = 3, label, className }: GalleryProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const current = openIndex === null ? undefined : images[openIndex];

  const step = React.useCallback(
    (direction: 1 | -1) => {
      setOpenIndex((index) => {
        if (index === null) return index;
        return (index + direction + images.length) % images.length;
      });
    },
    [images.length],
  );

  if (images.length === 0) return null;

  return (
    <div className={className}>
      <ul className={cn("grid gap-4 sm:grid-cols-2", columns === 3 && "lg:grid-cols-3")}>
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpenIndex(index)}
              // A tile is a full-bleed surface rather than a control with a label, so the
              // size, padding and nowrap that come with the variant are unset. What is kept
              // is the reason to use `Button` at all: the focus ring, the disabled handling
              // and the press response are the same here as on every other clickable thing
              // on the site, instead of a second set hand-written for this one component.
              //
              // `group` drives the zoom on the image inside. The scale is on the image and
              // the clip is on the tile, so the frame stays put while the photograph moves.
              className="glass group relative block aspect-4/3 h-auto w-full overflow-hidden rounded-xl p-0 whitespace-normal hover:bg-transparent"
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes={
                  columns === 3
                    ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    : "(max-width: 640px) 100vw, 50vw"
                }
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {image.caption ? (
                <span className="from-background/90 text-foreground absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-4 pt-8 pb-3 text-left text-sm">
                  {image.caption}
                </span>
              ) : null}
            </Button>
          </li>
        ))}
      </ul>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent
          showCloseButton
          className="w-[min(96vw,72rem)] max-w-none gap-3 bg-transparent p-0 ring-0"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
          }}
        >
          <DialogTitle className="sr-only">{label}</DialogTitle>
          <DialogDescription className="sr-only">
            {current?.alt ?? ""} Image {(openIndex ?? 0) + 1} of {images.length}. Use the left and
            right arrow keys to move between images.
          </DialogDescription>

          {current ? (
            <figure className="relative">
              <div className="glass relative aspect-3/2 w-full overflow-hidden rounded-xl">
                <Image
                  src={current.url}
                  alt={current.alt}
                  fill
                  sizes="96vw"
                  className="object-contain"
                />
              </div>

              <figcaption className="text-muted-foreground mt-3 flex items-center justify-between gap-4 text-sm">
                <span>{current.caption ?? current.alt}</span>
                <span className="tabular-nums">
                  {(openIndex ?? 0) + 1} / {images.length}
                </span>
              </figcaption>

              {images.length > 1 ? (
                <>
                  <Button
                    variant="outline"
                    size="icon-lg"
                    aria-label="Previous image"
                    onClick={() => step(-1)}
                    className="absolute top-1/2 left-3 -translate-y-1/2"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-lg"
                    aria-label="Next image"
                    onClick={() => step(1)}
                    className="absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    <ChevronRight />
                  </Button>
                </>
              ) : null}
            </figure>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
