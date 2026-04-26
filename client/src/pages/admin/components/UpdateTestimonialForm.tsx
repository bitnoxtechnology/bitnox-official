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

import { testimonialService } from "@/lib/services/testimonial-service";
import {
  updateTestimonialSchema,
  type UpdateTestimonialInput,
} from "@/lib/validations/testimonial-validator";

interface Props {
  selected: ITestimonial;
  onUpdated?: () => void;
  onCleared?: () => void;
}

const inputClassName =
  "h-[initial] w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!";

const UpdateTestimonialForm: React.FC<Props> = ({
  selected,
  onUpdated,
  onCleared,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateTestimonialInput>({
    resolver: zodResolver(updateTestimonialSchema),
    defaultValues: {
      clientName: "",
      position: "",
      company: "",
      testimonialText: "",
      rating: 5,
      image: undefined,
      featured: false,
    },
  });

  useEffect(() => {
    form.reset({
      clientName: selected.clientName || "",
      position: selected.position || "",
      company: selected.company || "",
      testimonialText: selected.testimonialText || "",
      rating: selected.rating,
      image: selected.image,
      featured: selected.featured,
    });
  }, [selected, form]);

  const onSubmit = async (data: UpdateTestimonialInput) => {
    setIsSubmitting(true);
    try {
      const res = await testimonialService.updateTestimonial(
        selected._id,
        data
      );
      if (res.success) {
        toast.success("Testimonial updated successfully!");
        onCleared?.();
        onUpdated?.();
      }
    } catch {
      toast.error("Failed to update testimonial.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        <Controller
          name="clientName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="clientName">Client Name</FieldLabel>
              <Input
                {...field}
                id="clientName"
                placeholder="Enter client name"
                disabled={isSubmitting}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="position"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="position">Position / Role</FieldLabel>
              <Input
                {...field}
                id="position"
                placeholder="e.g., CEO, Marketing Manager"
                disabled={isSubmitting}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="company"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="company">Company</FieldLabel>
              <Input
                {...field}
                id="company"
                placeholder="Enter company name"
                disabled={isSubmitting}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="testimonialText"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="testimonialText">Testimonial</FieldLabel>
              <Textarea
                {...field}
                id="testimonialText"
                placeholder="Enter the client's testimonial"
                disabled={isSubmitting}
                className={inputClassName}
                rows={5}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="rating"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="rating">Rating</FieldLabel>
              <FieldDescription>Enter a rating from 1 to 5</FieldDescription>
              <Input
                {...field}
                id="rating"
                type="number"
                min={1}
                max={5}
                disabled={isSubmitting}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className={inputClassName}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="image"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Client Photo (optional)</FieldLabel>
              <ImageUpload
                onUpload={(url) => field.onChange(url)}
                onRemove={() => field.onChange(undefined)}
                initialImages={field.value ? [field.value] : []}
                maxFiles={1}
                label="Upload client photo"
              />
            </Field>
          )}
        />
        <Controller
          name="featured"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldLabel htmlFor="featured">Featured Testimonial</FieldLabel>
              <Switch
                id="featured"
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
            "Update Testimonial"
          )}
        </Button>
      </div>
    </form>
  );
};

export default UpdateTestimonialForm;
