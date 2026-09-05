import type { Metadata } from "next";
import { Suspense } from "react";

import { SettingsForm } from "@/app/admin/(dashboard)/settings/settings-form";
import { PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getSiteSettingsForAdmin } from "@/lib/queries/admin/site-settings";

export const metadata: Metadata = { title: "Settings" };

/**
 * The values every page reads.
 *
 * Super admins only, here and in the action behind it. A mistake in this form is a mistake in
 * the footer, the contact page and the structured data of every page at once, which is a
 * different weight of change from correcting a blog post.
 *
 * The settings are read fresh rather than through the cached public query. An admin who saves
 * the phone number and lands back on this form has to see the number they just typed, not the
 * cached one from before the revalidation propagated.
 */
export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Site settings"
        description="Address, social accounts, sister sites and analytics. Changing these does not need a deploy."
      />

      <Suspense fallback={<FormSkeleton />}>
        <Form />
      </Suspense>
    </div>
  );
}

async function Form() {
  const [, settings] = await Promise.all([requireSuperAdmin(), getSiteSettingsForAdmin()]);

  return <SettingsForm settings={settings} />;
}

function FormSkeleton() {
  return (
    <div className="mt-8 max-w-2xl space-y-5" aria-hidden>
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}
