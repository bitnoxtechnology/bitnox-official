import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { ImageUpload } from "@/components/ui/image-upload";
import { Switch } from "@/components/ui/switch";

import { portfolioService } from "@/lib/services/portfolio-service";
import {
  updateProjectSchema,
  type UpdateProjectInput,
} from "@/lib/validations/portfolio-validator";

interface Props {
  selected: IProject;
  onUpdated?: () => void;
  onCleared?: () => void;
}

const inputClassName =
  "h-[initial] w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!";

const UpdatePortfolioForm: React.FC<Props> = ({
  selected,
  onUpdated,
  onCleared,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      coverImage: undefined,
      images: [],
      link: undefined,
      tags: [],
      featured: false,
      order: 0,
      isPublished: false,
    },
  });

  useEffect(() => {
    form.reset({
      title: selected.title || "",
      description: selected.description || "",
      coverImage: selected.coverImage,
      images: selected.images || [],
      link: selected.link,
      tags: selected.tags || [],
      featured: selected.featured,
      order: selected.order,
      isPublished: selected.isPublished,
    });
    setTagInput((selected.tags || []).join(", "));
  }, [selected, form]);

  const onSubmit = async (data: UpdateProjectInput) => {
    setIsSubmitting(true);
    try {
      const res = await portfolioService.updateProject(selected._id, data);
      if (res.success) {
        toast.success("Project updated successfully!");
        onCleared?.();
        onUpdated?.();
      }
    } catch {
      toast.error("Failed to update project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">Project Title</FieldLabel>
              <Input
                {...field}
                id="title"
                placeholder="Enter project title"
                disabled={isSubmitting}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                {...field}
                id="description"
                placeholder="Enter project description"
                disabled={isSubmitting}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="coverImage"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Cover Image</FieldLabel>
              <ImageUpload
                onUpload={(url) => field.onChange(url)}
                onRemove={() => field.onChange(undefined)}
                initialImages={field.value ? [field.value] : []}
                maxFiles={1}
                label="Upload Cover Image"
              />
            </Field>
          )}
        />
        <Controller
          name="images"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Additional Images</FieldLabel>
              <ImageUpload
                onUpload={(url) =>
                  field.onChange([...(field.value || []), url])
                }
                onRemove={(urlToRemove) =>
                  field.onChange(
                    field.value?.filter((url) => url !== urlToRemove)
                  )
                }
                initialImages={field.value || []}
                multiple
                label="Upload additional images"
                maxFiles={8}
              />
            </Field>
          )}
        />
        <Controller
          name="link"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="link">Project URL</FieldLabel>
              <Input
                {...field}
                value={field.value || ""}
                id="link"
                placeholder="https://example.com"
                disabled={isSubmitting}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="tags"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="tags">Tags</FieldLabel>
              <FieldDescription>Enter tags separated by commas.</FieldDescription>
              <Input
                id="tags"
                placeholder="e.g., React, Next.js, Web Design"
                disabled={isSubmitting}
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  field.onChange(
                    e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                  );
                }}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="order"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="order">Display Order</FieldLabel>
              <Input
                {...field}
                id="order"
                type="number"
                min={0}
                disabled={isSubmitting}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="featured"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldLabel htmlFor="featured">Featured Project</FieldLabel>
              <Switch
                id="featured"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            </Field>
          )}
        />
        <Controller
          name="isPublished"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldLabel htmlFor="isPublished">Publish Project</FieldLabel>
              <Switch
                id="isPublished"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            </Field>
          )}
        />
      </FieldGroup>
      <div className="mt-6!">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-300 hover:bg-primary-100"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner /> Updating...
            </span>
          ) : (
            "Update Project"
          )}
        </Button>
      </div>
    </form>
  );
};

export default UpdatePortfolioForm;
