"use client";

import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Faq } from "@/content/faqs";
import { cn } from "@/lib/utils";

/**
 * The FAQ accordion, with its answers kept in the document.
 *
 * Radix unmounts a collapsed panel. That is the right default for most disclosures and the
 * wrong one here: the page carries `FAQPage` structured data describing these answers, and
 * Google's requirement is that the marked-up content is on the page. A crawler does not click
 * accordions, so with the answers unmounted the markup described nine answers that were
 * nowhere in the HTML. Content behind a collapsed accordion is allowed; content that is not
 * in the DOM at all is not, and the whole reason this application exists is search.
 *
 * `forceMount` puts them back. It also disables Radix's own hiding, because with the panel
 * permanently present its internal open check is always true and the `hidden` attribute is
 * never applied, so the collapsing is done here instead: the inner element's height goes to
 * zero and the outer one already clips. The height animation is unaffected, since it runs on
 * the outer element between zero and the measured height either way.
 *
 * `inert` is what keeps that honest for anybody not looking at the screen. A panel that is
 * present but visually collapsed would otherwise still be read out and still be tabbable,
 * which would make the trigger's `aria-expanded="false"` a lie. `inert` takes the closed
 * panel out of the accessibility tree and out of the tab order, so a screen reader hears
 * exactly what a sighted reader sees, and the crawler still gets the text.
 *
 * Controlled state is the price of knowing which panel is open at render time, which is what
 * `inert` needs. It is the only reason this is a client component.
 */
export function FaqAccordion({ faqs }: { faqs: readonly Faq[] }) {
  const [open, setOpen] = React.useState("");

  return (
    <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="w-full">
      {faqs.map((faq, index) => {
        const value = `faq-${index}`;
        const isOpen = open === value;

        return (
          <AccordionItem key={faq.question} value={value}>
            <AccordionTrigger className="text-foreground py-5 text-base font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent
              forceMount
              inert={!isOpen}
              className={cn("text-muted-foreground pb-5 text-sm", !isOpen && "h-0 pb-0")}
            >
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
