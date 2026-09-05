"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Menu, UserRound } from "lucide-react";

import {
  AdminBreadcrumbs,
  AdminNav,
  SidebarToggle,
  useSidebarCollapsed,
} from "@/components/admin/admin-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * The admin chrome: a rail on the left, a header across the top, the page under it.
 *
 * This is the client half. Everything it needs about the person signed in arrives as plain
 * props from the layout, which does the session read on the server, so no part of the guard
 * or the session document crosses the boundary.
 *
 * Three widths, not two. Above `lg` the rail is a column of the grid and can be collapsed to
 * icons for a wider table. Below it the rail is a drawer behind the menu button, because a
 * two-hundred-pixel column on a phone leaves nothing for the content. The drawer and the rail
 * render the same `AdminNav`, so there is one list of links rather than a mobile copy that
 * drifts.
 */

export interface AdminShellProps {
  user: { name: string; email: string; role: string };
  isSuperAdmin: boolean;
  enquiryCount: number;
  /** The sign-out server action, passed down so this file imports no server module. */
  signOut: () => Promise<void>;
  children: React.ReactNode;
}

/** Two letters from the name, which is all an avatar with no photograph can honestly show. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminShell({
  user,
  isSuperAdmin,
  enquiryCount,
  signOut,
  children,
}: AdminShellProps) {
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "min-h-dvh lg:grid",
        collapsed ? "lg:grid-cols-[4rem_1fr]" : "lg:grid-cols-[15rem_1fr]",
      )}
    >
      <aside className="border-border/60 hidden border-r lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div
          className={cn(
            "flex h-14 items-center gap-2 px-3",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <Link
            href="/admin"
            className={cn(
              "text-foreground font-heading text-sm font-semibold tracking-tight",
              collapsed && "sr-only",
            )}
          >
            Bitnox admin
          </Link>
          <SidebarToggle collapsed={collapsed} onToggle={toggleCollapsed} />
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-6">
          <AdminNav isSuperAdmin={isSuperAdmin} enquiryCount={enquiryCount} collapsed={collapsed} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="border-border/60 bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                aria-label="Open the menu"
              >
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader>
                <SheetTitle>Bitnox admin</SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto px-2 pb-8">
                <AdminNav
                  isSuperAdmin={isSuperAdmin}
                  enquiryCount={enquiryCount}
                  onNavigate={() => setDrawerOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <AdminBreadcrumbs />
          </div>

          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/" target="_blank" rel="noopener">
              View the site
              <ExternalLink aria-hidden />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Account menu for ${user.name}`}
                className="rounded-full"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <span className="text-foreground block text-sm font-medium">{user.name}</span>
                <span className="text-muted-foreground block truncate text-xs">{user.email}</span>
                <span className="text-muted-foreground block text-xs">
                  {isSuperAdmin ? "Super admin" : "Admin"}
                </span>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/admin/profile">
                  <UserRound aria-hidden />
                  Your profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/*
               * A form rather than an onClick. Signing out is a mutation, it revokes the
               * session row and clears the cookie, and a POST is what a mutation is. It also
               * means the control still works before this component has hydrated.
               */}
              <form action={signOut}>
                <DropdownMenuItem asChild variant="destructive">
                  <button type="submit" className="w-full">
                    <LogOut aria-hidden />
                    Sign out
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
