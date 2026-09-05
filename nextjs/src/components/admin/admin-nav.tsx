"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { NAV_SECTIONS, findNavItem, isActivePath, type NavItem } from "@/components/admin/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The sidebar's links, and the breadcrumb trail above the page.
 *
 * Both are client components because both depend on the current path, and `usePathname` is
 * the only thing either of them needs. Keeping them here rather than in the shell means the
 * shell itself stays a server component and the session read in it never crosses the boundary.
 *
 * The collapsed state is remembered in `localStorage` rather than in a cookie, because it is a
 * preference belonging to one person at one screen size and the server has no use for it.
 */

const COLLAPSED_KEY = "bitnox:admin:sidebar-collapsed";
const COLLAPSED_EVENT = "bitnox:admin:sidebar";

/**
 * `localStorage` read the way React wants an external store read.
 *
 * The obvious version, an effect that reads storage and calls `setState`, renders the wrong
 * width once and corrects it on the next pass. `useSyncExternalStore` is the API for exactly
 * this: it takes a server snapshot for the first render and the hydration that matches it, then
 * subscribes, so there is no mismatch and no correcting pass.
 *
 * Two events are listened for. `storage` fires in the *other* tabs when one of them writes, and
 * the custom event covers this tab, which the browser deliberately does not notify.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(COLLAPSED_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(COLLAPSED_EVENT, onChange);
  };
}

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    // Storage blocked outright, which some browsers do. Expanded is the sensible default.
    return false;
  }
}

export function useSidebarCollapsed(): [boolean, () => void] {
  // The server has no preference to read, so it renders the expanded rail and the client
  // hydrates to match before applying whatever this browser last chose.
  const collapsed = React.useSyncExternalStore(subscribe, readCollapsed, () => false);

  const toggle = React.useCallback(() => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, readCollapsed() ? "0" : "1");
    } catch {
      // Nothing to do, and nothing worth telling anybody about. The rail stays as it is.
    }

    window.dispatchEvent(new Event(COLLAPSED_EVENT));
  }, []);

  return [collapsed, toggle];
}

export interface AdminNavProps {
  isSuperAdmin: boolean;
  enquiryCount: number;
  collapsed?: boolean;
  /** Closes the mobile drawer when a link inside it is followed. */
  onNavigate?: () => void;
}

export function AdminNav({ isSuperAdmin, enquiryCount, collapsed, onNavigate }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-6">
      {NAV_SECTIONS.map((section) => {
        const items = section.items.filter((item) => isSuperAdmin || !item.superAdminOnly);

        if (items.length === 0) return null;

        return (
          <div key={section.title}>
            {/* Hidden visually when the rail is narrow, but still read out, so the grouping
                survives for a screen reader that has no width to lose. */}
            <h2
              className={cn(
                "text-muted-foreground text-2xs px-3 font-medium tracking-wider uppercase",
                collapsed && "sr-only",
              )}
            >
              {section.title}
            </h2>

            <ul className={cn("mt-2 space-y-0.5", collapsed && "mt-0")}>
              {items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    active={isActivePath(item.href, pathname)}
                    collapsed={collapsed}
                    count={item.badge === "enquiries" ? enquiryCount : 0}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  count,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed?: boolean;
  count: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={cn(
        "focus-visible:ring-ring flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        collapsed && "justify-center px-0",
      )}
    >
      <item.icon className="size-4 shrink-0" aria-hidden />
      <span className={cn("flex-1 truncate", collapsed && "sr-only")}>{item.label}</span>
      {count > 0 ? (
        <Badge variant={active ? "default" : "outline"} className={cn(collapsed && "sr-only")}>
          {count > 99 ? "99+" : count}
          <span className="sr-only"> unanswered</span>
        </Badge>
      ) : null}
    </Link>
  );
}

/** The rail's own collapse control, beside the links it collapses. */
export function SidebarToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}
      aria-expanded={!collapsed}
      onClick={onToggle}
    >
      {collapsed ? <PanelLeftOpen aria-hidden /> : <PanelLeftClose aria-hidden />}
    </Button>
  );
}

/**
 * Dashboard, then the section, then whatever the page names itself.
 *
 * Derived from the path rather than passed down, so a new admin route gets a trail without
 * anybody wiring one. The leaf is optional because a list page's own name is already the
 * section name, and repeating it reads as a stutter.
 */
export function AdminBreadcrumbs({ leaf }: { leaf?: string }) {
  const pathname = usePathname();
  const section = findNavItem(pathname);

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="text-muted-foreground flex items-center gap-1 text-sm">
        <li>
          <Link href="/admin" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
        </li>

        {section ? (
          <>
            <Separator />
            <li className="min-w-0">
              {leaf ? (
                <Link href={section.href} className="hover:text-foreground transition-colors">
                  {section.label}
                </Link>
              ) : (
                <span className="text-foreground">{section.label}</span>
              )}
            </li>
          </>
        ) : null}

        {leaf ? (
          <>
            <Separator />
            <li className="text-foreground min-w-0 truncate">{leaf}</li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

function Separator() {
  return (
    <li aria-hidden className="text-muted-foreground/50">
      <ChevronRight className="size-3.5" />
    </li>
  );
}
