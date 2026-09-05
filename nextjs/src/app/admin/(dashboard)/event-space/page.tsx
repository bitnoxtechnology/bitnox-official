import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink } from "lucide-react";

import { EventSpaceDetailsForm } from "@/app/admin/(dashboard)/event-space/details-form";
import { GalleryForm } from "@/app/admin/(dashboard)/event-space/gallery-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EVENT_SPACE_CAPACITY } from "@/lib/constants";
import { requireUser } from "@/lib/auth/guards";
import { listEventSpaceImages } from "@/lib/queries/admin/event-space";
import { getSiteSettingsForAdmin } from "@/lib/queries/admin/site-settings";

export const metadata: Metadata = { title: "Event Space" };

/**
 * The Event Space.
 *
 * Two tabs, because the two halves change on different days: the gallery when new photographs
 * arrive, the room's own details roughly never. Putting them on one long form would mean
 * scrolling past sixteen photographs to correct the capacity.
 *
 * Tabs are safe here in a way they would not be on the blog form. Each panel is its own form
 * with its own submit, so a validation error can never be hidden behind a tab that is not open.
 */
export default function EventSpaceAdminPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Event Space"
        description="The 60-seat room in Abeokuta. Pricing stays on request, so nothing here sets a rate."
        actions={
          <Button variant="outline" asChild>
            <Link href="/event-space" target="_blank" rel="noopener">
              <ExternalLink aria-hidden />
              View the page
            </Link>
          </Button>
        }
      />

      <Suspense fallback={<PanelSkeleton />}>
        <Panels />
      </Suspense>
    </div>
  );
}

async function Panels() {
  const [, images, settings] = await Promise.all([
    requireUser(),
    listEventSpaceImages(),
    getSiteSettingsForAdmin(),
  ]);

  return (
    <Tabs defaultValue="gallery" className="mt-8">
      <TabsList>
        <TabsTrigger value="gallery">Gallery</TabsTrigger>
        <TabsTrigger value="details">The room</TabsTrigger>
      </TabsList>

      <TabsContent value="gallery" className="mt-6">
        <GalleryForm images={images} />
      </TabsContent>

      <TabsContent value="details" className="mt-6">
        <EventSpaceDetailsForm
          // The constant is the fallback for a database that has not been seeded, so the form
          // opens with the real capacity rather than a zero somebody has to correct.
          capacity={settings?.eventSpace.capacity ?? EVENT_SPACE_CAPACITY}
          amenities={settings?.eventSpace.amenities ?? []}
          availabilityCopy={settings?.eventSpace.availabilityCopy ?? ""}
        />
      </TabsContent>
    </Tabs>
  );
}

function PanelSkeleton() {
  return (
    <div className="mt-8 space-y-4" aria-hidden>
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}
