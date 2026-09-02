"use client";

import * as React from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  LoaderCircle,
  Trash2,
} from "lucide-react";

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
 * A set of images that has an order, used by the Event Space gallery and by portfolio
 * projects.
 *
 * Order matters here in a way it does not for a single cover image: the first photograph is
 * the one the landing page teaser shows and the one the Open Graph card uses, so an admin
 * needs to be able to put the best one first.
 *
 * Reordering works two ways on purpose. Dragging is what most people reach for, and it is
 * built on the browser's own drag events rather than on a drag-and-drop library, because one
 * list on two admin screens does not justify the dependency or the bundle. The up and down
 * buttons beside each row are not a fallback for old browsers: they are how the list is
 * reordered with a keyboard, which dragging cannot be. Both write the same sortOrder.
 */

export interface MultiImageUploadProps {
  name: string;
  label: string;
  folder: UploadFolder;
  value: ImageValue[];
  onChange: (value: ImageValue[]) => void;
  description?: string;
  error?: string;
  className?: string;
}

/** Rewrites sortOrder to match array position, which is the only thing that decides it. */
function resequence(images: ImageValue[]): ImageValue[] {
  return images.map((image, index) => ({ ...image, sortOrder: index }));
}

function move(images: ImageValue[], from: number, to: number): ImageValue[] {
  if (to < 0 || to >= images.length || from === to) return images;

  const next = [...images];
  const [moved] = next.splice(from, 1);
  if (!moved) return images;

  next.splice(to, 0, moved);
  return resequence(next);
}

/** Three characters is not a description, and an admin who typed one meant to type more. */
function altIsMissing(image: ImageValue): boolean {
  return image.alt.trim().length < 3;
}

export function MultiImageUpload({
  name,
  label,
  folder,
  value,
  onChange,
  description,
  error,
  className,
}: MultiImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const { upload, progress, error: uploadError } = useCloudinaryUpload(folder);
  const uploading = progress !== null;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    // Sequential rather than parallel. Several large files at once on a mobile connection
    // starve each other, and the single progress figure stops meaning anything.
    const added: ImageValue[] = [];

    for (const file of Array.from(files)) {
      const asset = await upload(file);
      if (asset) added.push({ url: asset.url, alt: "", caption: undefined, sortOrder: 0 });
    }

    if (added.length > 0) onChange(resequence([...value, ...added]));
  }

  function update(index: number, patch: Partial<ImageValue>) {
    const current = value[index];
    if (!current) return;

    const next = [...value];
    next[index] = { ...current, ...patch };
    onChange(next);
  }

  const missingAlt = value.filter(altIsMissing).length;

  return (
    <Field className={cn("gap-3", className)} data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={`${name}-file`}>{label}</FieldLabel>

      <input type="hidden" name={name} value={JSON.stringify(value)} readOnly />

      {value.length > 0 ? (
        <ul className="grid gap-3">
          {value.map((image, index) => (
            <li
              key={`${image.url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex !== null) onChange(move(value, dragIndex, index));
                setDragIndex(null);
              }}
              className={cn(
                "glass rounded-xl p-3 transition-opacity",
                dragIndex === index && "opacity-50",
              )}
            >
              <div className="flex gap-3">
                <div
                  className="text-muted-foreground flex cursor-grab items-center active:cursor-grabbing"
                  aria-hidden
                >
                  <GripVertical className="size-4" />
                </div>

                <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={image.url}
                    alt={image.alt || "Uploaded image, not yet described"}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="grid flex-1 gap-2">
                  <Field data-invalid={altIsMissing(image)}>
                    <FieldLabel htmlFor={`${name}-alt-${index}`} className="sr-only">
                      Alt text for image {index + 1}
                    </FieldLabel>
                    <Input
                      id={`${name}-alt-${index}`}
                      value={image.alt}
                      placeholder="Alt text. What is in the picture?"
                      aria-invalid={altIsMissing(image)}
                      onChange={(event) => update(index, { alt: event.target.value })}
                    />
                  </Field>
                  <Textarea
                    rows={1}
                    value={image.caption ?? ""}
                    placeholder="Caption. Optional."
                    aria-label={`Caption for image ${index + 1}`}
                    onChange={(event) =>
                      update(index, { caption: event.target.value || undefined })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move image ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => onChange(move(value, index, index - 1))}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move image ${index + 1} down`}
                    disabled={index === value.length - 1}
                    onClick={() => onChange(move(value, index, index + 1))}
                  >
                    <ChevronDown />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() =>
                      onChange(resequence(value.filter((_, position) => position !== index)))
                    }
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <Button
        type="button"
        variant="outline"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn("w-full border-dashed", value.length === 0 && "h-32 flex-col gap-2")}
      >
        {uploading ? (
          <>
            <LoaderCircle className="animate-spin" aria-hidden />
            Uploading, {progress}%
          </>
        ) : (
          <>
            <ImagePlus aria-hidden />
            {value.length === 0 ? "Choose images" : "Add more"}
          </>
        )}
      </Button>

      <input
        ref={inputRef}
        id={`${name}-file`}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="sr-only"
        onChange={(event) => {
          void handleFiles(event.target.files);
          // Cleared so choosing the same file again still fires a change event.
          event.target.value = "";
        }}
      />

      <FieldDescription>
        {description ?? `${describeAcceptedTypes()}. Drag a row, or use the arrows, to reorder.`}
      </FieldDescription>

      {missingAlt > 0 ? (
        <FieldDescription className="text-destructive">
          {missingAlt === 1
            ? "One image still needs alt text."
            : `${missingAlt} images still need alt text.`}
        </FieldDescription>
      ) : null}

      <UploadError message={uploadError} />
      {error ? <FieldError errors={[{ message: error }]} /> : null}
    </Field>
  );
}
