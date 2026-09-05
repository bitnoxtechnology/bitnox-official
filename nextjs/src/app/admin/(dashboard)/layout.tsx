import { Suspense } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { logoutAction } from "@/lib/actions/auth-actions";
import { isSuperAdmin, requireUser } from "@/lib/auth/guards";
import { countEnquiries } from "@/lib/queries/admin/enquiries";

/**
 * The dashboard shell, wrapped around every screen that needs a signed-in admin.
 *
 * It sits in a route group rather than at `/admin` so that the sign-in, verify, invitation and
 * password-reset pages do not get a sidebar. Those are reached by somebody who has no session
 * yet, and a navigation rail on a sign-in form is a rail full of links that redirect straight
 * back to it. The group changes no URLs.
 *
 * `requireUser()` here is what decides whether any of this is drawn, and the chrome waits
 * behind it rather than rendering first and being redirected away a moment later. The guard is
 * repeated in every page and every action below: `proxy.ts` sees a signed cookie and nothing
 * more, so it cannot know that a session was revoked or an account deactivated.
 *
 * The boundary is here rather than in `src/app/admin/layout.tsx` on purpose. On a client
 * navigation from one admin page to another that outer layout is already mounted, so a
 * Suspense boundary up there would sit above everything that re-renders and catch nothing.
 * This layout is inside the group and remounts with the session read it depends on.
 */
export default function DashboardLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  // Both reads at once. The session is needed to render anything at all and the unanswered
  // count is needed for the badge beside the inbox, and running them in sequence would add a
  // round trip to every admin page load for a number.
  const [user, enquiries] = await Promise.all([requireUser(), countEnquiries()]);

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role }}
      isSuperAdmin={isSuperAdmin(user)}
      enquiryCount={enquiries.new}
      signOut={logoutAction}
    >
      {children}
    </AdminShell>
  );
}

function ShellSkeleton() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_1fr]" aria-hidden>
      <div className="border-border/60 hidden border-r p-3 lg:block">
        <Skeleton className="h-8 w-32" />
        <div className="mt-8 space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <div>
        <div className="border-border/60 flex h-14 items-center border-b px-6">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-4 px-6 py-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
