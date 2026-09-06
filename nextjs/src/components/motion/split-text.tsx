"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { MOTION_OK, useGsapEffect } from "./gsap";

type SplitTextProps = {
  /** The heading. A newline starts a new line, which is how the hero breaks its two clauses. */
  text: string;
  /** Word by word reads as writing. Character by character reads as a machine. */
  by?: "word" | "char";
  as?: "h1" | "h2" | "p" | "span" | "div";
  /** Seconds before the first item moves. */
  delay?: number;
  /** Play on mount, or wait until the element scrolls into view. Heroes are on mount. */
  trigger?: "mount" | "scroll";
  /**
   * Line indexes, zero based, to paint in the accent colour.
   *
   * For a headline whose last clause is the claim and the rest is the setup. The alternative
   * is passing a ReactNode and giving up the `aria-label`, which is what keeps a screen
   * reader hearing one heading instead of a list of fragments.
   */
  accentLines?: number[];
  className?: string;
};

/**
 * The headline reveal, ported from the legacy hero.
 *
 * What the original did: split every character, animate `opacity`, `y: 100` and
 * `rotationX: -90` with a 0.02 stagger over 1 second. Three problems with that, all fixed
 * here.
 *
 * The 3D rotation on every character of a two-line headline was doing perspective maths on
 * roughly forty elements at once and dropped frames on a mid-range phone, which is most of
 * the traffic. It is gone.
 *
 * Character splitting on a headline this long ran for nearly a second before the last letter
 * landed, and letters arriving one at a time is not how anyone reads. The default is now
 * word by word, which reveals the sentence in the order it is read. `by="char"` is still
 * there for a short label where it suits.
 *
 * The words now rise out of a mask rather than fading through the background, which is a
 * cleaner edge and removes the half-opaque frames that make text look blurry mid-animation.
 *
 * The text is in the server-rendered HTML either way. `aria-label` on the element and
 * `aria-hidden` on the pieces mean a screen reader is read one heading rather than a list of
 * fragments.
 */
export function SplitText({
  text,
  by = "word",
  as: Tag = "h1",
  delay = 0.1,
  trigger = "mount",
  accentLines,
  className,
}: SplitTextProps) {
  const ref = React.useRef<HTMLElement>(null);
  const lines = text.split("\n");

  useGsapEffect(
    (gsap) => {
      const element = ref.current;
      if (!element) return;

      const items = gsap.utils.toArray<HTMLElement>("[data-split-item]", element);
      if (items.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from(items, {
          yPercent: 115,
          duration: by === "char" ? 0.7 : 0.9,
          delay,
          // A long settle on a large heading. `power4` decelerates harder than the
          // `power3` the rest of the site uses, which the size of the type can carry.
          ease: "power4.out",
          stagger: by === "char" ? 0.018 : 0.05,
          scrollTrigger:
            trigger === "scroll" ? { trigger: element, start: "top 85%", once: true } : undefined,
        });
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [text, by, delay, trigger] },
  );

  return (
    <Tag
      // @ts-expect-error one ref covers every element this renders as
      ref={ref}
      aria-label={text.replace(/\n/g, " ")}
      className={cn(className)}
    >
      {lines.map((line, lineIndex) => (
        <span
          key={lineIndex}
          aria-hidden
          className={cn("block", accentLines?.includes(lineIndex) && "text-primary")}
        >
          {splitLine(line, by)}
        </span>
      ))}
    </Tag>
  );
}

/**
 * Each piece sits in a mask that clips it while it is below its resting position.
 *
 * The mask needs `overflow: hidden`, and `overflow: hidden` on a line of type clips
 * descenders. The padding and the matching negative margin give the descender room without
 * changing where the line sits.
 */
function Piece({ children }: { children: React.ReactNode }) {
  return (
    <span className="-mb-[0.16em] inline-block overflow-hidden pb-[0.16em] align-bottom">
      <span data-split-item className="inline-block">
        {children}
      </span>
    </span>
  );
}

function splitLine(line: string, by: "word" | "char") {
  const words = line.split(" ");

  if (by === "char") {
    return words.map((word, wordIndex) => (
      <React.Fragment key={wordIndex}>
        <span className="inline-block whitespace-nowrap">
          {Array.from(word).map((char, charIndex) => (
            <Piece key={charIndex}>{char}</Piece>
          ))}
        </span>
        {wordIndex < words.length - 1 ? " " : null}
      </React.Fragment>
    ));
  }

  return words.map((word, wordIndex) => (
    <React.Fragment key={wordIndex}>
      <Piece>{word}</Piece>
      {wordIndex < words.length - 1 ? " " : null}
    </React.Fragment>
  ));
}
