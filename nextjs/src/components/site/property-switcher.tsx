"use client";

import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PROPERTIES, type Property } from "@/content/properties";
import { cn } from "@/lib/utils";

/**
 * The way between the three Bitnox sites.
 *
 * A visitor who wants a course or wants laundry has arrived at the wrong domain, and the
 * cost of not telling them is that they leave. The switcher says all three exist and takes
 * them to the right one, which is also why cleaning gets no space anywhere else on this site:
 * one honest signpost is worth more than cleaning copy diluting a technology landing page.
 *
 * Two shapes for two places. The header has no room for three destinations beside the
 * services, so it gets the menu. The footer has room, so it gets the list with the
 * descriptions visible, where somebody scanning for "laundry" will actually find the word.
 */

function isExternal(property: Property): boolean {
  return !property.href.startsWith("/");
}

export function PropertySwitcher({ className }: { className?: string }) {
  const current = PROPERTIES.find((property) => property.current) ?? PROPERTIES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("text-muted-foreground", className)}>
          {current?.name}
          <ChevronDown aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>Bitnox properties</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {PROPERTIES.map((property) => (
          <DropdownMenuItem key={property.id} asChild>
            <PropertyLink property={property} className="flex-col items-start gap-0.5">
              <span className="flex w-full items-center gap-2">
                <span className="font-medium">{property.name}</span>
                {property.current ? (
                  <Check className="text-primary ml-auto size-4" aria-label="You are here" />
                ) : (
                  <ArrowUpRight className="text-muted-foreground ml-auto size-3.5" aria-hidden />
                )}
              </span>
              <span className="text-muted-foreground text-xs">{property.description}</span>
            </PropertyLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The footer's version. Same three destinations, descriptions on show. */
export function PropertyList({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-3", className)}>
      {PROPERTIES.map((property) => (
        <li key={property.id}>
          <PropertyLink
            property={property}
            className="group hover:text-primary text-muted-foreground block text-sm transition-colors"
          >
            <span className="text-foreground group-hover:text-primary flex items-center gap-1.5 font-medium transition-colors">
              {property.name}
              {isExternal(property) ? <ArrowUpRight className="size-3.5" aria-hidden /> : null}
            </span>
            <span className="text-muted-foreground">{property.description}</span>
          </PropertyLink>
        </li>
      ))}
    </ul>
  );
}

/**
 * `next/link` for this site, a plain anchor for the other two.
 *
 * `Link` prefetches, and prefetching a different origin does nothing but waste a request.
 * `rel="noopener"` on the outbound ones because they open in the same tab but still should
 * not hand the destination a handle on this window.
 */
function PropertyLink({
  property,
  className,
  children,
}: {
  property: Property;
  className?: string;
  children: React.ReactNode;
}) {
  if (isExternal(property)) {
    return (
      <a href={property.href} rel="noopener" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={property.href} className={className}>
      {children}
    </Link>
  );
}
