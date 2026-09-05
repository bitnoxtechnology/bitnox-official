"use client";

import { Controller } from "react-hook-form";

import { useJsonField } from "@/components/admin/json-field";
import { FormAlert } from "@/components/forms/form-alert";
import { ImageUpload } from "@/components/forms/image-upload";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
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
import { PUBLISH_STATUSES, type PublishStatus } from "@/lib/constants";
import type { TestimonialDTO } from "@/lib/dto";
import type { ImageValue } from "@/lib/validations/image-schema";
import { testimonialSchema, type TestimonialInput } from "@/lib/validations/testimonial-schema";

/**
 * A testimonial.
 *
 * The rating is optional and has no default. Inventing a star count for a quote that did not
 * carry one is fabricated social proof, so the field offers "not given" as a real choice and
 * the card renders without stars when it is chosen.
 *
 * The related project links the quote to the case study it belongs to, which is what lets a
 * reader check the claim. It is optional because plenty of good testimonials are about work
 * that has no public write-up.
 */

const STATUS_LABELS: Record<PublishStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export interface TestimonialFormProps {
  testimonial?: TestimonialDTO;
  projects: { id: string; title: string }[];
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
}

export function TestimonialForm({
  testimonial,
  projects,
  action,
  submitLabel,
}: TestimonialFormProps) {
  const { form, state, pending, submit } = useActionForm<TestimonialInput>({
    schema: testimonialSchema,
    action,
    defaultValues: {
      clientName: testimonial?.clientName ?? "",
      position: testimonial?.position ?? "",
      company: testimonial?.company ?? "",
      testimonialText: testimonial?.testimonialText ?? "",
      rating: testimonial?.rating ? String(testimonial.rating) : "",
      image: testimonial?.image ? JSON.stringify(testimonial.image) : "",
      relatedProject: testimonial?.relatedProjectId ?? "",
      service: testimonial?.service ?? "",
      status: testimonial?.status ?? "draft",
      featured: testimonial?.featured ? "on" : "",
      sortOrder: String(testimonial?.sortOrder ?? 0),
    },
  });

  const { errors } = form.formState;
  const [avatar, setAvatar] = useJsonField<TestimonialInput, ImageValue>(form, "image");

  return (
    <form action={submit} className="mt-8 max-w-2xl space-y-6" noValidate>
      <Field data-invalid={Boolean(errors.testimonialText)}>
        <FieldLabel htmlFor="testimonialText">The quote</FieldLabel>
        <Textarea
          id="testimonialText"
          rows={5}
          aria-invalid={Boolean(errors.testimonialText)}
          {...form.register("testimonialText")}
        />
        <FieldDescription>
          In their words, not edited into marketing copy. A specific sentence about what changed is
          worth more than a general compliment.
        </FieldDescription>
        <FieldError errors={[errors.testimonialText]} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.clientName)}>
          <FieldLabel htmlFor="clientName">Name</FieldLabel>
          <Input
            id="clientName"
            aria-invalid={Boolean(errors.clientName)}
            {...form.register("clientName")}
          />
          <FieldError errors={[errors.clientName]} />
        </Field>

        <Field data-invalid={Boolean(errors.company)}>
          <FieldLabel htmlFor="company">Company</FieldLabel>
          <Input id="company" {...form.register("company")} />
          <FieldError errors={[errors.company]} />
        </Field>

        <Field data-invalid={Boolean(errors.position)}>
          <FieldLabel htmlFor="position">Job title</FieldLabel>
          <Input id="position" {...form.register("position")} />
          <FieldError errors={[errors.position]} />
        </Field>

        <Field data-invalid={Boolean(errors.rating)}>
          <FieldLabel htmlFor="rating">Rating</FieldLabel>
          <Controller
            control={form.control}
            name="rating"
            render={({ field }) => (
              <Select
                name={field.name}
                value={String(field.value ?? "")}
                onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
              >
                <SelectTrigger id="rating" className="w-full" onBlur={field.onBlur}>
                  <SelectValue>{field.value ? `${field.value} out of 5` : "Not given"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not given</SelectItem>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <SelectItem key={value} value={String(value)}>
                      {value} out of 5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldDescription>
            Leave it as not given unless they actually gave one. The card shows no stars then.
          </FieldDescription>
          <FieldError errors={[errors.rating]} />
        </Field>
      </div>

      <ImageUpload
        name="image"
        label="Photograph"
        folder="testimonials"
        value={avatar}
        onChange={setAvatar}
        description="Optional. Their initials are shown when there is no photograph."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.service)}>
          <FieldLabel htmlFor="service">Service</FieldLabel>
          <Controller
            control={form.control}
            name="service"
            render={({ field }) => (
              <Select
                name={field.name}
                value={field.value || "none"}
                onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
              >
                <SelectTrigger id="service" className="w-full" onBlur={field.onBlur}>
                  <SelectValue>
                    {SERVICES.find((service) => service.slug === field.value)?.name ??
                      "Not tied to one"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not tied to one</SelectItem>
                  {SERVICES.map((service) => (
                    <SelectItem key={service.slug} value={service.slug}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldDescription>Decides which service page can show it.</FieldDescription>
          <FieldError errors={[errors.service]} />
        </Field>

        <Field data-invalid={Boolean(errors.relatedProject)}>
          <FieldLabel htmlFor="relatedProject">Related project</FieldLabel>
          <Controller
            control={form.control}
            name="relatedProject"
            render={({ field }) => (
              <Select
                name={field.name}
                value={field.value || "none"}
                onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
              >
                <SelectTrigger id="relatedProject" className="w-full" onBlur={field.onBlur}>
                  <SelectValue>
                    {projects.find((project) => project.id === field.value)?.title ?? "None"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldDescription>Links the quote to the work it is about.</FieldDescription>
          <FieldError errors={[errors.relatedProject]} />
        </Field>

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

        <Field data-invalid={Boolean(errors.sortOrder)}>
          <FieldLabel htmlFor="sortOrder">Order</FieldLabel>
          <Input id="sortOrder" type="number" min={0} {...form.register("sortOrder")} />
          <FieldDescription>Lower numbers come first.</FieldDescription>
          <FieldError errors={[errors.sortOrder]} />
        </Field>
      </div>

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

      <FormAlert state={state} />

      <SubmitButton pending={pending} pendingLabel="Saving" className="sm:w-auto sm:px-8">
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
