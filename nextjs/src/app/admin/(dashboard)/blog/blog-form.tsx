"use client";

import * as React from "react";
import Link from "next/link";
import { Controller } from "react-hook-form";
import { ExternalLink, Eye } from "lucide-react";
import { toast } from "sonner";

import { useJsonField } from "@/components/admin/json-field";
import { SerpPreview } from "@/components/admin/serp-preview";
import { clearDraft, RichTextEditor } from "@/components/editor/rich-text-editor";
import { FormAlert } from "@/components/forms/form-alert";
import { ImageUpload } from "@/components/forms/image-upload";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getPreviewLinkAction, suggestExcerptAction } from "@/lib/actions/blog-actions";
import { PUBLISH_STATUSES, type PublishStatus } from "@/lib/constants";
import { blogSchema, type BlogInput } from "@/lib/validations/blog-schema";
import type { ImageValue } from "@/lib/validations/image-schema";
import type { ActionState } from "@/lib/actions/action-state";
import type { BlogEditorDTO } from "@/lib/dto";
import { slugify } from "@/lib/slug";

/**
 * The post form, used to create and to edit.
 *
 * One component for both, because they are the same form with a different action bound to it.
 * Splitting them would mean two copies of eleven fields, and the copies would drift the first
 * time a field was added to one.
 *
 * The Zod schema validates here through the resolver and again inside the server action. The
 * client pass is for a fast message under the field; the server pass is the one that decides
 * anything.
 *
 * The body is the only field that is not a plain input. The editor owns its own hidden input,
 * which is what carries the document in `FormData`, and reports each change back into the form
 * state so the same schema can check it in the browser rather than on the round trip.
 */

const STATUS_LABELS: Record<PublishStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

/** `datetime-local` wants `YYYY-MM-DDTHH:mm` in local time, which `toISOString` is not. */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";

  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export interface BlogFormProps {
  post?: BlogEditorDTO;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}

export function BlogForm({ post, action, submitLabel }: BlogFormProps) {
  const draftScope = post ? `blog:${post.id}` : "blog:new";

  const { form, state, pending, submit } = useActionForm<BlogInput>({
    schema: blogSchema,
    action,
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      contentJson: JSON.stringify(post?.contentJson ?? { type: "doc" }),
      coverImage: post?.coverImage ? JSON.stringify(post.coverImage) : "",
      ogImage: post?.ogImage ? JSON.stringify(post.ogImage) : "",
      status: post?.status ?? "draft",
      scheduledFor: toLocalInput(post?.scheduledFor),
      tags: post?.tags.join(", ") ?? "",
      category: post?.category ?? "",
      seoTitle: post?.seoTitle ?? "",
      seoDescription: post?.seoDescription ?? "",
      canonicalUrl: post?.canonicalUrl ?? "",
      featured: post?.featured ? "on" : "",
    },
  });

  const { errors } = form.formState;
  const [cover, setCover] = useJsonField<BlogInput, ImageValue>(form, "coverImage");
  const [ogImage, setOgImage] = useJsonField<BlogInput, ImageValue>(form, "ogImage");

  const values = form.watch();
  const status = values.status as PublishStatus;

  // The saved copy is only stale once the record is safely written, so the recovery draft is
  // cleared on success rather than on submit.
  React.useEffect(() => {
    if (state.status === "success") clearDraft(draftScope);
  }, [state.status, draftScope]);

  async function openPreview() {
    if (!post) return;

    const path = await getPreviewLinkAction(post.slug);
    window.open(path, "_blank", "noopener");
  }

  async function fillExcerpt() {
    const suggestion = await suggestExcerptAction(form.getValues("contentJson"));

    if (!suggestion) {
      toast.error("Write a paragraph first, then this can suggest one.");
      return;
    }

    form.setValue("excerpt", suggestion.slice(0, 320), { shouldDirty: true, shouldValidate: true });
  }

  return (
    <form action={submit} className="mt-8" noValidate>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Field data-invalid={Boolean(errors.title)}>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input
              id="title"
              aria-invalid={Boolean(errors.title)}
              className="h-11 text-lg"
              {...form.register("title")}
            />
            <FieldError errors={[errors.title]} />
          </Field>

          <Field data-invalid={Boolean(errors.slug)}>
            <FieldLabel htmlFor="slug">Slug</FieldLabel>
            <Input
              id="slug"
              aria-invalid={Boolean(errors.slug)}
              placeholder={values.title ? slugify(values.title) : "derived-from-the-title"}
              {...form.register("slug")}
            />
            <FieldDescription>
              {post
                ? "This is the published URL. Changing it costs a redirect and a re-crawl, so change it only to fix a mistake."
                : "Left blank, it is taken from the title. It is set once, when the post is created."}
            </FieldDescription>
            <FieldError errors={[errors.slug]} />
          </Field>

          <Field data-invalid={Boolean(errors.excerpt)}>
            <div className="flex items-center justify-between gap-3">
              <FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
              <Button type="button" variant="ghost" size="sm" onClick={() => void fillExcerpt()}>
                Suggest from the body
              </Button>
            </div>
            <Textarea
              id="excerpt"
              rows={3}
              aria-invalid={Boolean(errors.excerpt)}
              {...form.register("excerpt")}
            />
            <FieldDescription>
              The card text on the blog index and the fallback search snippet. Write it as a
              sentence somebody would click.
            </FieldDescription>
            <FieldError errors={[errors.excerpt]} />
          </Field>

          <Field data-invalid={Boolean(errors.contentJson)}>
            <FieldLabel htmlFor="post-body">Body</FieldLabel>
            <RichTextEditor
              name="contentJson"
              label="Post body"
              initialContent={post?.contentJson}
              draftScope={draftScope}
              onChange={(json) =>
                form.setValue("contentJson", json, { shouldDirty: true, shouldValidate: false })
              }
            />
            <FieldError errors={[errors.contentJson]} />
          </Field>

          <section aria-labelledby="seo-panel" className="space-y-5 pt-4">
            <div>
              <h2 id="seo-panel" className="text-foreground text-sm font-semibold">
                Search result
              </h2>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                Leave these blank and the title and excerpt above are used. Fill them in when the
                heading is written for the page and the result needs something shorter.
              </p>
            </div>

            <SerpPreview
              path={`/blog/${values.slug ? slugify(values.slug) : slugify(values.title ?? "")}`}
              title={values.title ?? ""}
              description={values.excerpt ?? ""}
              seoTitle={values.seoTitle}
              seoDescription={values.seoDescription}
            />

            <Field data-invalid={Boolean(errors.seoTitle)}>
              <FieldLabel htmlFor="seoTitle">SEO title</FieldLabel>
              <Input
                id="seoTitle"
                aria-invalid={Boolean(errors.seoTitle)}
                {...form.register("seoTitle")}
              />
              <FieldError errors={[errors.seoTitle]} />
            </Field>

            <Field data-invalid={Boolean(errors.seoDescription)}>
              <FieldLabel htmlFor="seoDescription">Meta description</FieldLabel>
              <Textarea
                id="seoDescription"
                rows={2}
                aria-invalid={Boolean(errors.seoDescription)}
                {...form.register("seoDescription")}
              />
              <FieldError errors={[errors.seoDescription]} />
            </Field>

            <Field data-invalid={Boolean(errors.canonicalUrl)}>
              <FieldLabel htmlFor="canonicalUrl">Canonical URL</FieldLabel>
              <Input
                id="canonicalUrl"
                aria-invalid={Boolean(errors.canonicalUrl)}
                placeholder="https://"
                {...form.register("canonicalUrl")}
              />
              <FieldDescription>
                Only for a post first published somewhere else. Left blank, the post is its own
                canonical.
              </FieldDescription>
              <FieldError errors={[errors.canonicalUrl]} />
            </Field>

            <ImageUpload
              name="ogImage"
              label="Social image"
              folder="blog"
              value={ogImage}
              onChange={setOgImage}
              description="Optional. The cover image is used when this is empty."
            />
          </section>
        </div>

        {/* Sticky, because the save button belongs beside the post at whatever point in it
            the writer has scrolled to, not two thousand words below. */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="glass space-y-5 rounded-xl p-4">
            <Field data-invalid={Boolean(errors.status)}>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status" className="w-full" onBlur={field.onBlur}>
                      <SelectValue>{STATUS_LABELS[field.value as PublishStatus]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PUBLISH_STATUSES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {STATUS_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.status]} />
            </Field>

            {status === "scheduled" ? (
              <Field data-invalid={Boolean(errors.scheduledFor)}>
                <FieldLabel htmlFor="scheduledFor">Goes out at</FieldLabel>
                <Input
                  id="scheduledFor"
                  type="datetime-local"
                  aria-invalid={Boolean(errors.scheduledFor)}
                  {...form.register("scheduledFor")}
                />
                <FieldDescription>
                  Your local time. A scheduled post is published by the hourly job, so it can appear
                  a few minutes late.
                </FieldDescription>
                <FieldError errors={[errors.scheduledFor]} />
              </Field>
            ) : null}

            <Field orientation="horizontal">
              <FieldLabel htmlFor="featured">Featured</FieldLabel>
              <Controller
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <Switch
                    id="featured"
                    name={field.name}
                    checked={field.value === "on"}
                    onCheckedChange={(checked) => field.onChange(checked ? "on" : "")}
                  />
                )}
              />
            </Field>

            <Field data-invalid={Boolean(errors.tags)}>
              <FieldLabel htmlFor="tags">Tags</FieldLabel>
              <Input
                id="tags"
                aria-invalid={Boolean(errors.tags)}
                placeholder="seo, web development"
                {...form.register("tags")}
              />
              <FieldDescription>
                Separated by commas. Tags decide the archive pages and the reading list on a service
                page.
              </FieldDescription>
              <FieldError errors={[errors.tags]} />
            </Field>

            <Field data-invalid={Boolean(errors.category)}>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Input id="category" {...form.register("category")} />
              <FieldError errors={[errors.category]} />
            </Field>

            <ImageUpload
              name="coverImage"
              label="Cover image"
              folder="blog"
              value={cover}
              onChange={setCover}
              error={errors.coverImage?.message}
            />
          </div>

          <div className="mt-4 space-y-3">
            <FormAlert state={state} />

            <SubmitButton pending={pending} pendingLabel="Saving">
              {submitLabel}
            </SubmitButton>

            {post ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => void openPreview()}
                >
                  <Eye aria-hidden />
                  Preview
                </Button>

                {post.status === "published" ? (
                  <Button type="button" variant="outline" className="flex-1" asChild>
                    <Link href={`/blog/${post.slug}`} target="_blank" rel="noopener">
                      <ExternalLink aria-hidden />
                      Live
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </form>
  );
}
