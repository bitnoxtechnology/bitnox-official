"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu } from "lucide-react";

import { PropertyList, PropertySwitcher } from "@/components/site/property-switcher";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EDU_URL } from "@/content/properties";
import { SERVICES, servicePath } from "@/content/services";
import { cn } from "@/lib/utils";

/**
 * The public header.
 *
 * Five destinations and one call to action, which is as many as a header can carry before it
 * stops being navigable. The four services sit inside one dropdown rather than as four
 * top-level entries, because four service links plus four page links is eight items and
 * nobody reads eight.
 *
 * Courses are the exception that earns its own button. A visitor looking for training is on
 * the wrong domain and has no way of knowing it, so the route to `edu.bitnoxsolution.com`
 * is a filled button in the header rather than a line in a menu. It also appears in the
 * hero, on the Technology Training service page, in its own band on the landing page and in
 * the footer, which is deliberate repetition: it is the single most common reason somebody
 * arrives here and cannot find what they came for.
 *
 * Two states, and one rule that makes the change between them work: the header occupies the
 * same height in both. At the top of the page the bar is transparent, full width and tall.
 * The moment the page moves it becomes a floating card, shorter, inset from the top, rounded,
 * with the glass surface and a shadow under it, so it reads as having lifted off the page
 * rather than as a strip that changed colour.
 *
 * The heights are chosen to cancel out. Tall state is 4.5rem on a phone and 5.5rem above it;
 * the floating state is 3.5rem plus 0.5rem of margin above and below, and 4rem plus 0.75rem,
 * which comes to the same 4.5rem and 5.5rem. A sticky element still occupies its space in the
 * document, so a header that grew or shrank would shove the whole page up or down by the
 * difference at the exact moment somebody started scrolling. Keeping the total fixed is what
 * makes the transition smooth instead of a jump.
 *
 * The border is present in both states and only changes colour, for the same reason: a border
 * that appears would add two pixels to the height of the bar as it animated.
 *
 * The glass treatment is written out here as its separate declarations rather than applied
 * with the `glass` utility. The utility sets the `border` shorthand, which would win over the
 * transparent border of the top state depending on which rule the stylesheet emits last, and
 * a shorthand cannot be transitioned to a different colour on its own. The values are the
 * same tokens the utility uses, so nothing here pins a literal.
 *
 * The backdrop blur is on in both states, and only the background colour moves. A filter is a
 * list rather than a number, so browsers switch between `blur(12px)` and none in one step
 * instead of interpolating, and that step is visible as a snap in the middle of an otherwise
 * smooth 500ms change. Leaving it on costs nothing at the top of the page, where there is
 * nothing behind the header to blur.
 *
 * The threshold is a single pixel of scroll. The reference behaviour is that the bar lifts as
 * soon as the page moves at all, and a larger threshold leaves it flat over the first screen
 * of content.
 */

type NavLink = { href: string; label: string };

const PAGES: readonly NavLink[] = [
  { href: "/event-space", label: "Event Space" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    // Read once on mount as well as on scroll, because a page restored mid-scroll, or one
    // opened on an anchor, starts below the fold and the bar has to already be lifted.
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    // Passive, because this listener never calls preventDefault and the browser should not
    // have to wait for it before scrolling.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Nothing here watches the pathname to close the sheet on navigation. Every link inside it
  // is wrapped in `SheetClose`, which is Radix's own way of saying "this control dismisses
  // the sheet", and it fires on the same click that navigates. An effect that reset the open
  // state when the path changed would be a second mechanism doing the same job, one render
  // later, for the cases the first already covered.
  const servicesActive = isActive(pathname, "/services");

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={cn(
          "container-page flex items-center gap-4 border backdrop-blur-[var(--glass-blur)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled
            ? "border-border my-2 h-14 rounded-2xl bg-[var(--glass-bg)] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9)] sm:my-3 sm:h-16"
            : "my-0 h-18 rounded-none border-transparent bg-transparent shadow-none sm:h-22",
        )}
      >
        <Link href="/" className="flex shrink-0 items-center" aria-label="Bitnox, home">
          <Image
            src="/logo.svg"
            alt="Bitnox Technology Solutions"
            width={345}
            height={85}
            priority
            className="h-7 w-auto"
          />
        </Link>

        <NavigationMenu className="mx-auto hidden lg:flex" viewport={false}>
          <NavigationMenuList className="gap-1">
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(servicesActive && "text-primary")}
                data-active={servicesActive || undefined}
              >
                Services
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[34rem] grid-cols-2 gap-1 p-1">
                  {SERVICES.map((service) => (
                    <li key={service.slug}>
                      <NavigationMenuLink asChild>
                        <Link href={servicePath(service.slug)} className="flex-col items-start">
                          <span className="text-foreground font-medium">{service.name}</span>
                          <span className="text-muted-foreground text-xs">{service.tagline}</span>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                  <li className="col-span-2">
                    <NavigationMenuLink asChild>
                      <Link href="/services" className="text-primary text-xs font-medium">
                        See how the four fit together
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {PAGES.map((page) => (
              <NavigationMenuItem key={page.href}>
                <NavigationMenuLink
                  asChild
                  active={isActive(pathname, page.href)}
                  className={navigationMenuTriggerStyle()}
                >
                  <Link href={page.href}>{page.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <PropertySwitcher className="hidden xl:inline-flex" />

          <Button asChild size="lg" className="hidden sm:inline-flex">
            <a href={EDU_URL} rel="noopener">
              Browse courses
              <ArrowUpRight aria-hidden />
            </a>
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-lg" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(22rem,90vw)] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Services, pages and the other Bitnox sites.
                </SheetDescription>
              </SheetHeader>

              <nav className="grid gap-8 px-4 pb-8">
                <div className="grid gap-1">
                  <p className="text-2xs text-primary mb-1 font-medium tracking-[0.16em] uppercase">
                    Services
                  </p>
                  {SERVICES.map((service) => (
                    <SheetClose key={service.slug} asChild>
                      <Link
                        href={servicePath(service.slug)}
                        className="hover:bg-muted -mx-2 rounded-lg px-2 py-2 text-sm transition-colors"
                      >
                        <span className="text-foreground block font-medium">{service.name}</span>
                        <span className="text-muted-foreground text-xs">{service.tagline}</span>
                      </Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link
                      href="/services"
                      className="text-primary -mx-2 px-2 py-2 text-xs font-medium"
                    >
                      See how the four fit together
                    </Link>
                  </SheetClose>
                </div>

                <div className="grid gap-1">
                  <p className="text-2xs text-primary mb-1 font-medium tracking-[0.16em] uppercase">
                    Pages
                  </p>
                  {PAGES.map((page) => (
                    <SheetClose key={page.href} asChild>
                      <Link
                        href={page.href}
                        aria-current={isActive(pathname, page.href) ? "page" : undefined}
                        className={cn(
                          "hover:bg-muted -mx-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                          isActive(pathname, page.href) ? "text-primary" : "text-foreground",
                        )}
                      >
                        {page.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>

                <Button asChild size="lg" className="w-full">
                  <a href={EDU_URL} rel="noopener">
                    Browse courses
                    <ArrowUpRight aria-hidden />
                  </a>
                </Button>

                <div className="grid gap-3">
                  <p className="text-2xs text-primary font-medium tracking-[0.16em] uppercase">
                    Bitnox properties
                  </p>
                  <PropertyList />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
