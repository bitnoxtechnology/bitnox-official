"use client";

import * as React from "react";
import Link from "next/link";
import { Controller } from "react-hook-form";
import { ExternalLink } from "lucide-react";

import { useJsonField } from "@/components/admin/json-field";
import { SerpPreview } from "@/components/admin/serp-preview";
import { clearDraft, RichTextEditor } from "@/components/editor/rich-text-editor";
import { FormAlert } from "@/components/forms/form-alert";
import { ImageUpload } from "@/components/forms/image-upload";
import { MultiImageUpload } from "@/components/forms/multi-image-upload";
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
import { SERVICES } from "@/content/services";
import type { ActionState } from "@/lib/actions/action-state";
import { PUBLISH_STATUSES, type PublishStatus, type ServiceSlug } from "@/lib/constants";
import type { ProjectEditorDTO } from "@/lib/dto";
import { slugify } from "@/lib/slug";
import type { ImageValue } from "@/lib/validations/image-schema";
import { projectSchema, type ProjectInput } from "@/lib/validations/project-schema";

/**
 * A portfolio project.
 *
 * The blog form's shape with the fields a case study needs on top. The one that earns its
 * place is `services`: it decides which service pages the project appears on, so it is a set
 * of checkboxes over the real service list rather than a free-text field somebody can misspell
 * into a project that never surfaces anywhere.
 *
 * A checkbox group is the one control the UI kit has no primitive for, so these are native
 * inputs. That is deliberate rather than a shortcut: several entries under one `FormData` key
 * is exactly what a checkbox group posts, and no wrapper improves on it.
 */

const STATUS_LABELS: Record<PublishStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

/** `datetime-local` wants local time in `YYYY-MM-DDTHH:mm`, which `toISOString` is not. */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";

  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

export interface ProjectFormProps {
  project?: ProjectEditorDTO;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}

export function ProjectForm({ project, action, submitLabel }: ProjectFormProps) {
  const draftScope = project ? `project:${project.id}` : "project:new";

  const { form, state, pending, submit } = useActionForm<ProjectInput>({
    schema: projectSchema,
    action,
    defaultValues: {
      title: project?.title ?? "",
      slug: project?.slug ?? "",
      summary: project?.summary ?? "",
      contentJson: JSON.stringify(project?.contentJson ?? { type: "doc" }),
      coverImage: project?.coverImage ? JSON.stringify(project.coverImage) : "",
      images: JSON.stringify(project?.images ?? []),
      ogImage: project?.ogImage ? JSON.stringify(project.ogImage) : "",
      client: project?.client ?? "",
      industry: project?.industry ?? "",
      services: project?.services ?? [],
      techStack: project?.techStack.join(", ") ?? "",
      completedAt: toLocalInput(project?.completedAt),
      liveUrl: project?.liveUrl ?? "",
      repoUrl: project?.repoUrl ?? "",
      tags: project?.tags.join(", ") ?? "",
      status: project?.status ?? "draft",
      featured: project?.featured ? "on" : "",
      order: String(project?.order ?? 0),
    },
  });

  const { errors } = form.formState;
  const [cover, setCover] = useJsonField<ProjectInput, ImageValue>(form, "coverImage");
  const [gallery, setGallery] = useJsonField<ProjectInput, ImageValue[]>(form, "images");
  const [ogImage, setOgImage] = useJsonField<ProjectInput, ImageValue>(form, "ogImage");

  const values = form.watch();

  React.useEffect(() => {
    if (state.status === "success") clearDraft(draftScope);
  }, [state.status, draftScope]);

  return (
    <form action={submit} className="mt-8" noValidate>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Field data-invalid={Boolean(errors.title)}>
            <FieldLabel htmlFor="title">Project title</FieldLabel>
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
              placeholder={values.title ? slugify(values.title) : "derived-from-the-title"}
              aria-invalid={Boolean(errors.slug)}
              {...form.register("slug")}
            />
            <FieldError errors={[errors.slug]} />
          </Field>

          <Field data-invalid={Boolean(errors.summary)}>
            <FieldLabel htmlFor="summary">Summary</FieldLabel>
            <Textarea
              id="summary"
              rows={3}
              aria-invalid={Boolean(errors.summary)}
              {...form.register("summary")}
            />
            <FieldDescription>
              The card text on the portfolio index and on the service pages. Say what was built and
              what it does.
            </FieldDescription>
            <FieldError errors={[errors.summary]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="project-body">Case study</FieldLabel>
            <RichTextEditor
              name="contentJson"
              label="Case study"
              initialContent={project?.contentJson}
              draftScope={draftScope}
              onChange={(json) =>
                form.setValue("contentJson", json, { shouldDirty: true, shouldValidate: false })
              }
            />
            <FieldError errors={[errors.contentJson]} />
          </Field>

          <MultiImageUpload
            name="images"
            label="Gallery"
            folder="portfolio"
            value={gallery ?? []}
            onChange={setGallery}
            error={errors.images?.message}
          />

          <section aria-labelledby="seo-panel" className="space-y-5 pt-4">
            <h2 id="seo-panel" className="text-foreground text-sm font-semibold">
              Search result
            </h2>

            <SerpPreview
              path={`/portfolio/${values.slug ? slugify(values.slug) : slugify(values.title ?? "")}`}
              title={values.title ?? ""}
              description={values.summary ?? ""}
              seoTitle={values.seoTitle}
              seoDescription={values.seoDescription}
            />

            <Field data-invalid={Boolean(errors.seoTitle)}>
              <FieldLabel htmlFor="seoTitle">SEO title</FieldLabel>
              <Input id="seoTitle" {...form.register("seoTitle")} />
              <FieldError errors={[errors.seoTitle]} />
            </Field>

            <Field data-invalid={Boolean(errors.seoDescription)}>
              <FieldLabel htmlFor="seoDescription">Meta description</FieldLabel>
              <Textarea id="seoDescription" rows={2} {...form.register("seoDescription")} />
              <FieldError errors={[errors.seoDescription]} />
            </Field>

            <ImageUpload
              name="ogImage"
              label="Social image"
              folder="portfolio"
              value={ogImage}
              onChange={setOgImage}
              description="Optional. The cover image is used when this is empty."
            />
          </section>
        </div>

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

            <fieldset>
              <legend className="text-foreground mb-2 text-sm font-medium">Services</legend>
              <p className="text-muted-foreground mb-3 text-xs leading-5">
                Decides which service pages this project appears on.
              </p>
              <Controller
                control={form.control}
                name="services"
                render={({ field }) => {
                  const selected = (field.value ?? []) as ServiceSlug[];

                  return (
                    <div className="space-y-2">
                      {SERVICES.map((service) => (
                        <label
                          key={service.slug}
                          className="text-foreground flex items-center gap-2.5 text-sm"
                        >
                          <input
                            type="checkbox"
                            name="services"
                            value={service.slug}
                            checked={selected.includes(service.slug)}
                            onChange={(event) =>
                              field.onChange(
                                event.target.checked
                                  ? [...selected, service.slug]
                                  : selected.filter((slug) => slug !== service.slug),
                              )
                            }
                            className="accent-primary size-4"
                          />
                          {service.name}
                        </label>
                      ))}
                    </div>
                  );
                }}
              />
              <FieldError errors={[errors.services]} />
            </fieldset>

            <Field data-invalid={Boolean(errors.client)}>
              <FieldLabel htmlFor="client">Client</FieldLabel>
              <Input id="client" {...form.register("client")} />
              <FieldError errors={[errors.client]} />
            </Field>

            <Field data-invalid={Boolean(errors.industry)}>
              <FieldLabel htmlFor="industry">Industry</FieldLabel>
              <Input id="industry" {...form.register("industry")} />
              <FieldError errors={[errors.industry]} />
            </Field>

            <Field data-invalid={Boolean(errors.techStack)}>
              <FieldLabel htmlFor="techStack">Built with</FieldLabel>
              <Input
                id="techStack"
                placeholder="next.js, mongodb, tailwind"
                {...form.register("techStack")}
              />
              <FieldDescription>Separated by commas.</FieldDescription>
              <FieldError errors={[errors.techStack]} />
            </Field>

            <Field data-invalid={Boolean(errors.tags)}>
              <FieldLabel htmlFor="tags">Tags</FieldLabel>
              <Input id="tags" {...form.register("tags")} />
              <FieldError errors={[errors.tags]} />
            </Field>

            <Field data-invalid={Boolean(errors.completedAt)}>
              <FieldLabel htmlFor="completedAt">Completed</FieldLabel>
              <Input id="completedAt" type="datetime-local" {...form.register("completedAt")} />
              <FieldError errors={[errors.completedAt]} />
            </Field>

            <Field data-invalid={Boolean(errors.liveUrl)}>
              <FieldLabel htmlFor="liveUrl">Live URL</FieldLabel>
              <Input id="liveUrl" placeholder="https://" {...form.register("liveUrl")} />
              <FieldError errors={[errors.liveUrl]} />
            </Field>

            <Field data-invalid={Boolean(errors.repoUrl)}>
              <FieldLabel htmlFor="repoUrl">Repository</FieldLabel>
              <Input id="repoUrl" placeholder="https://" {...form.register("repoUrl")} />
              <FieldError errors={[errors.repoUrl]} />
            </Field>

            <Field data-invalid={Boolean(errors.order)}>
              <FieldLabel htmlFor="order">Order</FieldLabel>
              <Input id="order" type="number" min={0} {...form.register("order")} />
              <FieldDescription>Lower numbers come first. Featured work leads.</FieldDescription>
              <FieldError errors={[errors.order]} />
            </Field>

            <ImageUpload
              name="coverImage"
              label="Cover image"
              folder="portfolio"
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

            {project?.status === "published" ? (
              <Button type="button" variant="outline" className="w-full" asChild>
                <Link href={`/portfolio/${project.slug}`} target="_blank" rel="noopener">
                  <ExternalLink aria-hidden />
                  View it live
                </Link>
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </form>
  );
}
