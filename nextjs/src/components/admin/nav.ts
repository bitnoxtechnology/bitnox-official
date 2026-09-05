import {
  CalendarRange,
  FileText,
  Folder,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * The admin navigation, as data.
 *
 * One list, read by the sidebar, the mobile drawer and the breadcrumb trail. Three copies of
 * the same seven links is how a renamed section ends up called two different things on the
 * same screen, and how a new one arrives in the sidebar but not in the breadcrumbs.
 *
 * `superAdminOnly` is a display decision and nothing more. It keeps a link a plain admin
 * cannot use off their sidebar, which is a courtesy. The authorisation is `requireSuperAdmin()`
 * inside the page and inside every action behind it, because a link that is not rendered is
 * still a URL anybody can type.
 */

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
  /** Shown as a count beside the label. Only the inbox has one. */
  badge?: "enquiries";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/portfolio", label: "Portfolio", icon: Folder },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/event-space", label: "Event Space", icon: CalendarRange },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, badge: "enquiries" },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail, superAdminOnly: true },
      { href: "/admin/users", label: "Users", icon: Users, superAdminOnly: true },
    ],
  },
  {
    title: "Site",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings, superAdminOnly: true }],
  },
];

/**
 * Whether a nav link is the one the current URL belongs to.
 *
 * The dashboard is matched exactly, because every admin path starts with `/admin` and a prefix
 * match would light it up on every screen. Everything else matches its own subtree, so the
 * blog link stays highlighted while a post is being edited.
 */
export function isActivePath(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The section label for a path, used by the breadcrumb trail and the document title. */
export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_SECTIONS.flatMap((section) => section.items)
    .filter((item) => item.href !== "/admin")
    .find((item) => isActivePath(item.href, pathname));
}
