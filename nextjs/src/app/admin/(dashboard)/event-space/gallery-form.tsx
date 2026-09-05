"use client";

import { Controller } from "react-hook-form";

import { useJsonField } from "@/components/admin/json-field";
import { FormAlert } from "@/components/forms/form-alert";
import { MultiImageUpload } from "@/components/forms/multi-image-upload";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveEventSpaceGalleryFormAction } from "@/lib/actions/event-space-actions";
import type { EventSpaceImageDTO } from "@/lib/dto";
import {
  eventSpaceGallerySchema,
  type EventSpaceGalleryInput,
} from "@/lib/validations/event-space-schema";
import type { ImageValue } from "@/lib/validations/image-schema";

/**
 * The Event Space gallery.
 *
 * The whole list is submitted in its final order and the action replaces the collection with
 * it. A diff would have to match rows by URL, and re-uploading the same photograph produces a
 * different Cloudinary URL, so the match would fail exactly when somebody replaces a picture.
 *
 * The cover is chosen once for the whole set rather than ticked per row, which is what makes
 * "exactly one cover" true by construction. It is the photograph the landing page teaser shows
 * and the one the Open Graph card uses, so it is worth choosing on purpose.
 *
 * The alt text is required on every image by the schema. These are photographs of a room
 * somebody is deciding whether to book, and a gallery a screen reader cannot describe is a
 * gallery that does not work for the visitor who most needs to know what the space is like.
 */
export function GalleryForm({ images }: { images: EventSpaceImageDTO[] }) {
  const coverIndex = images.findIndex((image) => image.isCover);

  const { form, state, pending, submit } = useActionForm<EventSpaceGalleryInput>({
    schema: eventSpaceGallerySchema,
    action: saveEventSpaceGalleryFormAction,
    defaultValues: {
      images: JSON.stringify(
        images.map((image) => ({
          url: image.url,
          alt: image.alt,
          caption: image.caption,
          sortOrder: image.sortOrder,
        })),
      ),
      coverIndex: String(coverIndex >= 0 ? coverIndex : 0),
    },
  });

  const { errors } = form.formState;
  const [gallery, setGallery] = useJsonField<EventSpaceGalleryInput, ImageValue[]>(form, "images");
  const rows = gallery ?? [];

  return (
    <form action={submit} className="space-y-6" noValidate>
      <MultiImageUpload
        name="images"
        label="Photographs"
        folder="event-space"
        value={rows}
        onChange={(next) => {
          setGallery(next);

          // A cover pointing past the end of a shortened list would fall back to the first
          // image on the server. Clamping here means the select shows what will actually
          // happen rather than a choice that is silently overridden.
          const current = Number(form.getValues("coverIndex") ?? 0);
          if (current >= next.length) form.setValue("coverIndex", "0");
        }}
        error={errors.images?.message}
        description="Drag a row, or use the arrows, to change the order they appear in."
      />

      <Field data-invalid={Boolean(errors.coverIndex)}>
        <FieldLabel htmlFor="coverIndex">Cover photograph</FieldLabel>
        <Controller
          control={form.control}
          name="coverIndex"
          render={({ field }) => (
            <Select
              name={field.name}
              value={String(field.value ?? "0")}
              onValueChange={field.onChange}
              disabled={rows.length === 0}
            >
              <SelectTrigger id="coverIndex" className="w-full max-w-sm" onBlur={field.onBlur}>
                <SelectValue>
                  {rows.length === 0
                    ? "Add a photograph first"
                    : (rows[Number(field.value ?? 0)]?.alt ??
                      `Photograph ${Number(field.value ?? 0) + 1}`)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {rows.map((image, index) => (
                  <SelectItem key={`${image.url}-${index}`} value={String(index)}>
                    {image.alt || `Photograph ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldDescription>
          Shown in the teaser on the landing page and used as the social preview image for the Event
          Space page.
        </FieldDescription>
        <FieldError errors={[errors.coverIndex]} />
      </Field>

      <FormAlert state={state} />

      <SubmitButton pending={pending} pendingLabel="Saving" className="sm:w-auto sm:px-8">
        Save the gallery
      </SubmitButton>
    </form>
  );
}
