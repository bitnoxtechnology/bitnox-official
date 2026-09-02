"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";

import { UploadError } from "@/components/forms/upload-shared";
import {
  describeAcceptedTypes,
  useCloudinaryUpload,
} from "@/components/forms/use-cloudinary-upload";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { UploadFolder } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ImageValue } from "@/lib/validations/image-schema";

/**
 * One image, with the alt text and caption that belong to it.
 *
 * The alt field is next to the picture and always visible, rather than behind a settings
 * icon, because an optional-looking field is an empty field. It is required by the schema on
 * the way in, so an admin cannot save a cover image nobody using a screen reader can read.
 *
 * The value reaches the server as a single hidden input holding JSON. `FormData` is flat, so
 * the alternative is inventing a `cover[url]` naming convention that every action then has
 * to reassemble. `input type="hidden"` is the one native control the UI kit does not
 * replace: the shadcn `Input` is a visible field and none of its styling applies here.
 */

export interface ImageUploadProps {
  /** The form field name. The JSON value lands under this key in `FormData`. */
  name: string;
  label: string;
  folder: UploadFolder;
  value?: ImageValue;
  onChange: (value: ImageValue | undefined) => void;
  description?: string;
  /** A server-side message for this field, from the action's `fieldErrors`. */
  error?: string;
  className?: string;
}

export function ImageUpload({
  name,
  label,
  folder,
  value,
  onChange,
  description,
  error,
  className,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { upload, progress, error: uploadError } = useCloudinaryUpload(folder);
  const uploading = progress !== null;

  async function handleFile(file: File | undefined) {
    if (!file) return;

    const asset = await upload(file);
    if (!asset) return;

    // Alt text survives a replacement, since swapping a photograph for a better version of
    // the same subject should not silently empty the description of it.
    onChange({ url: asset.url, alt: value?.alt ?? "", caption: value?.caption, sortOrder: 0 });
  }

  return (
    <Field className={cn("gap-3", className)} data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={`${name}-file`}>{label}</FieldLabel>

      <input type="hidden" name={name} value={value ? JSON.stringify(value) : ""} readOnly />

      {value?.url ? (
        <div className="glass relative aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={value.url}
            alt={value.alt || "Uploaded image, not yet described"}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            aria-label={`Remove the ${label.toLowerCase()}`}
            onClick={() => onChange(undefined)}
            className="absolute top-2 right-2"
          >
            <Trash2 />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="h-32 w-full flex-col gap-2 border-dashed"
        >
          {uploading ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden />
              Uploading, {progress}%
            </>
          ) : (
            <>
              <ImagePlus aria-hidden />
              Choose an image
            </>
          )}
        </Button>
      )}

      <input
        ref={inputRef}
        id={`${name}-file`}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          // Cleared so that choosing the same file twice still fires a change event.
          event.target.value = "";
        }}
      />

      {value?.url ? (
        <div className="grid gap-3">
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor={`${name}-alt`}>Alt text</FieldLabel>
            <Input
              id={`${name}-alt`}
              value={value.alt}
              placeholder="What is in the picture, in a sentence"
              onChange={(event) => onChange({ ...value, alt: event.target.value })}
              aria-invalid={Boolean(error)}
            />
            <FieldDescription>
              Read aloud by screen readers and used by image search. Describe the subject, not the
              file.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor={`${name}-caption`}>Caption</FieldLabel>
            <Textarea
              id={`${name}-caption`}
              rows={2}
              value={value.caption ?? ""}
              placeholder="Optional. Shown under the image."
              onChange={(event) => onChange({ ...value, caption: event.target.value || undefined })}
            />
          </Field>
        </div>
      ) : (
        <FieldDescription>{description ?? describeAcceptedTypes()}</FieldDescription>
      )}

      <UploadError message={uploadError} />
      {error ? <FieldError errors={[{ message: error }]} /> : null}
    </Field>
  );
}
