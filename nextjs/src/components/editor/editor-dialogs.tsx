"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle } from "lucide-react";

import { UploadError } from "@/components/forms/upload-shared";
import {
  describeAcceptedTypes,
  useCloudinaryUpload,
} from "@/components/forms/use-cloudinary-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/**
 * The three things the editor asks for in a dialog rather than inline.
 *
 * A link needs a URL and the text it wraps, an image needs a file and alt text, a video needs
 * an address. None of them fits on a toolbar, and a prompt() has no room for the alt field
 * that makes the image legal to publish.
 *
 * Each is controlled from the editor shell, so the same dialog serves the toolbar button and
 * the slash menu item without either knowing about the other.
 */

// --- Link -------------------------------------------------------------------

/**
 * A URL with a protocol on it, or an internal path.
 *
 * `bitnox.com` typed into a link field resolves as a relative path against the post it is on,
 * which is a broken link that looks fine in the editor. The protocol is added rather than the
 * value rejected, because "add https://" is a message about a thing the form could have done.
 */
export function normaliseHref(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return null;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  if (/^[\w.-]+@[\w.-]+\.\w+$/.test(trimmed)) return `mailto:${trimmed}`;

  return `https://${trimmed}`;
}

export interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialHref: string;
  onSubmit: (href: string) => void;
}

export function LinkDialog({ open, onOpenChange, initialHref, onSubmit }: LinkDialogProps) {
  const [href, setHref] = React.useState(initialHref);
  const [error, setError] = React.useState<string | null>(null);

  /*
   * Reset when the dialog opens over a different selection, rather than keeping the last link
   * somebody typed in a field that now belongs to another word.
   *
   * Adjusted during render rather than in an effect. The state depends on a prop, so an effect
   * would render the stale value first and the correct one immediately after, which is a
   * wasted pass and a visible flash of the previous link.
   */
  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      setHref(initialHref);
      setError(null);
    }
  }

  function submit() {
    const normalised = normaliseHref(href);

    if (!normalised) {
      setError("Enter an address, or a path beginning with a slash");
      return;
    }

    onSubmit(normalised);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialHref ? "Edit link" : "Add link"}</DialogTitle>
          <DialogDescription>
            An address, or an internal path such as /event-space.
          </DialogDescription>
        </DialogHeader>

        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="editor-link">Address</FieldLabel>
          <Input
            id="editor-link"
            value={href}
            autoFocus
            placeholder="https://example.com"
            aria-invalid={Boolean(error)}
            onChange={(event) => setHref(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
          />
          {error ? <FieldError errors={[{ message: error }]} /> : null}
        </Field>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            {initialHref ? "Update" : "Add link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Image ------------------------------------------------------------------

export interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (image: { src: string; alt: string }) => void;
}

/**
 * Upload, then describe.
 *
 * The alt field is required and the insert button stays disabled until it is filled, which is
 * the only reliable way to keep alt text on the images in a long post. Image search and screen
 * readers both depend on it, and an optional field on a dialog somebody is trying to close is
 * an empty field.
 */
export function ImageDialog({ open, onOpenChange, onSubmit }: ImageDialogProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [src, setSrc] = React.useState("");
  const [alt, setAlt] = React.useState("");
  const { upload, progress, error } = useCloudinaryUpload("blog");
  const uploading = progress !== null;

  // Cleared as the dialog opens, so the picture from the last insertion is not offered again.
  // During render rather than in an effect, for the reason given on the link dialog above.
  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      setSrc("");
      setAlt("");
    }
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;

    const asset = await upload(file);
    if (asset) setSrc(asset.url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add an image</DialogTitle>
          <DialogDescription>{describeAcceptedTypes()}.</DialogDescription>
        </DialogHeader>

        {src ? (
          <div className="glass relative aspect-video w-full overflow-hidden rounded-xl">
            <Image
              src={src}
              alt={alt || "Uploaded image, not yet described"}
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover"
            />
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
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <Field>
          <FieldLabel htmlFor="editor-image-alt">Alt text</FieldLabel>
          <Input
            id="editor-image-alt"
            value={alt}
            placeholder="What is in the picture, in a sentence"
            onChange={(event) => setAlt(event.target.value)}
          />
          <FieldDescription>
            Read aloud by screen readers and used by image search. Describe the subject, not the
            file.
          </FieldDescription>
        </Field>

        <UploadError message={error} />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!src || alt.trim().length < 3}
            onClick={() => {
              onSubmit({ src, alt: alt.trim() });
              onOpenChange(false);
            }}
          >
            Insert image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- YouTube ----------------------------------------------------------------

export interface YoutubeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (url: string) => void;
}

export function YoutubeDialog({ open, onOpenChange, onSubmit }: YoutubeDialogProps) {
  const [url, setUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const [wasOpen, setWasOpen] = React.useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      setUrl("");
      setError(null);
    }
  }

  function submit() {
    // Checked here rather than left to the extension, which silently does nothing on an
    // address it does not recognise and leaves the writer wondering what they mistyped.
    if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url.trim())) {
      setError("Paste a youtube.com or youtu.be address");
      return;
    }

    onSubmit(url.trim());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Embed a video</DialogTitle>
          <DialogDescription>
            The embed uses youtube-nocookie.com, so no cookie is set until the video is played.
          </DialogDescription>
        </DialogHeader>

        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="editor-youtube">Video address</FieldLabel>
          <Input
            id="editor-youtube"
            value={url}
            autoFocus
            placeholder="https://www.youtube.com/watch?v=..."
            aria-invalid={Boolean(error)}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
          />
          {error ? <FieldError errors={[{ message: error }]} /> : null}
        </Field>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            Embed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
