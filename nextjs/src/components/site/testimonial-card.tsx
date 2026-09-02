import { Star } from "lucide-react";

import { GlassCard } from "@/components/site/glass-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TestimonialDTO } from "@/lib/dto";
import { cn } from "@/lib/utils";

/**
 * A client quote.
 *
 * `blockquote` with a `cite` inside a `figcaption`, which is the markup a quote and its
 * attribution are supposed to have. It costs nothing and it is what lets a screen reader
 * announce where the quote ends and the name begins.
 *
 * The rating is optional and is drawn only when a real one was entered. Filling the gap with
 * five stars by default would be inventing social proof, which is the one thing this site
 * does not do: no star ratings nobody gave, no client counts nobody counted.
 *
 * The initials fallback is not decoration. Most testimonials arrive without a photograph,
 * and a card with a hole where the picture should be reads as broken.
 */
export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: TestimonialDTO;
  className?: string;
}) {
  const attribution = [testimonial.position, testimonial.company].filter(Boolean).join(", ");

  return (
    <GlassCard asChild className={cn("flex flex-col", className)}>
      <figure>
        {testimonial.rating ? (
          <p className="mb-4 flex gap-0.5" aria-label={`Rated ${testimonial.rating} out of 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                aria-hidden
                className={cn(
                  "size-4",
                  index < (testimonial.rating ?? 0)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/40",
                )}
              />
            ))}
          </p>
        ) : null}

        <blockquote className="text-foreground flex-1 text-sm leading-relaxed">
          {testimonial.testimonialText}
        </blockquote>

        <figcaption className="mt-6 flex items-center gap-3">
          <Avatar className="size-10">
            {/* Radix's own image, not next/image: it is what hides the fallback once the
                photograph has loaded, and a forty pixel avatar has no optimisation to gain. */}
            {testimonial.image ? (
              <AvatarImage src={testimonial.image.url} alt={testimonial.image.alt} />
            ) : null}
            <AvatarFallback>{initials(testimonial.clientName)}</AvatarFallback>
          </Avatar>
          <span>
            <cite className="text-foreground block text-sm font-medium not-italic">
              {testimonial.clientName}
            </cite>
            {attribution ? (
              <span className="text-muted-foreground block text-xs">{attribution}</span>
            ) : null}
          </span>
        </figcaption>
      </figure>
    </GlassCard>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
