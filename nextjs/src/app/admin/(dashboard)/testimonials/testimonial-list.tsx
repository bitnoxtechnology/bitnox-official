"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, GripVertical, Pencil, Star, Trash2 } from "lucide-react";

import { ConfirmAction, useServerAction } from "@/components/admin/row-actions";
import { StatusBadge } from "@/components/admin/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  deleteTestimonialAction,
  reorderTestimonialsAction,
  toggleTestimonialFeaturedAction,
} from "@/lib/actions/testimonial-actions";
import type { TestimonialDTO } from "@/lib/dto";
import { cn } from "@/lib/utils";

/**
 * The testimonials, in the order they appear on the site.
 *
 * A list rather than a table, because the row's content is a quote and a quote does not fit in
 * a cell. What the row needs to show is the sentence, who said it, and the three controls that
 * change how it is presented.
 *
 * Reordering works two ways on purpose, the same arrangement the gallery upload uses. Dragging
 * is what most people reach for, built on the browser's own drag events rather than on a
 * library, because one list on one screen does not justify the dependency. The up and down
 * buttons are not a fallback: they are how the list is reordered with a keyboard, which
 * dragging cannot be.
 *
 * The new order is held optimistically and written in one call when the drag ends, so a row
 * moved three places does not produce three round trips.
 */
export function TestimonialList({ testimonials }: { testimonials: TestimonialDTO[] }) {
  const [order, setOrder] = React.useState(testimonials);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const { run } = useServerAction();

  // Re-synced when the server sends a new list, which happens after a delete or an edit.
  // Adjusted during render rather than in an effect, so a deleted row is gone in the same pass
  // rather than lingering for one frame after the refresh lands.
  const [lastServerOrder, setLastServerOrder] = React.useState(testimonials);

  if (testimonials !== lastServerOrder) {
    setLastServerOrder(testimonials);
    setOrder(testimonials);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) return;

    const next = [...order];
    const [moved] = next.splice(from, 1);
    if (!moved) return;

    next.splice(to, 0, moved);
    setOrder(next);

    run(() => reorderTestimonialsAction(next.map((item) => item.id)), { success: "Order saved." });
  }

  return (
    <ul className="mt-6 space-y-3">
      {order.map((testimonial, index) => (
        <li
          key={testimonial.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragEnd={() => setDragIndex(null)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (dragIndex !== null) move(dragIndex, index);
            setDragIndex(null);
          }}
          className={cn(
            "glass flex gap-3 rounded-xl p-4 transition-opacity",
            dragIndex === index && "opacity-50",
          )}
        >
          <div
            className="text-muted-foreground flex cursor-grab items-start pt-1 active:cursor-grabbing"
            aria-hidden
          >
            <GripVertical className="size-4" />
          </div>

          <Avatar className="mt-0.5 size-10 shrink-0">
            {testimonial.image ? (
              <AvatarImage src={testimonial.image.url} alt={testimonial.image.alt} />
            ) : null}
            <AvatarFallback className="text-xs">
              {testimonial.clientName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-foreground line-clamp-2 text-sm leading-6">
              {testimonial.testimonialText}
            </p>
            <p className="text-muted-foreground mt-1.5 text-xs">
              {testimonial.clientName}
              {testimonial.company ? `, ${testimonial.company}` : null}
              {testimonial.rating ? ` · ${testimonial.rating} out of 5` : null}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={testimonial.status} />
            </div>
          </div>

          <div className="flex shrink-0 items-start gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Move ${testimonial.clientName} up`}
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
            >
              <ChevronUp aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Move ${testimonial.clientName} down`}
              disabled={index === order.length - 1}
              onClick={() => move(index, index + 1)}
            >
              <ChevronDown aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-pressed={testimonial.featured}
              aria-label={
                testimonial.featured
                  ? `Stop featuring ${testimonial.clientName}`
                  : `Feature ${testimonial.clientName}`
              }
              onClick={() =>
                run(() => toggleTestimonialFeaturedAction(testimonial.id), {
                  success: "Saved.",
                })
              }
            >
              <Star
                className={cn(testimonial.featured && "fill-primary text-primary")}
                aria-hidden
              />
            </Button>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link
                href={`/admin/testimonials/${testimonial.id}`}
                aria-label={`Edit the testimonial from ${testimonial.clientName}`}
              >
                <Pencil aria-hidden />
              </Link>
            </Button>
            <ConfirmAction
              title={`Delete the testimonial from ${testimonial.clientName}?`}
              description="It is removed from the landing page and from any service page showing it."
              confirmLabel="Delete it"
              onConfirm={() => deleteTestimonialAction(testimonial.id)}
              trigger={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete the testimonial from ${testimonial.clientName}`}
                >
                  <Trash2 aria-hidden />
                </Button>
              }
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
