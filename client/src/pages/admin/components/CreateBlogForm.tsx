import React, { useState, useRef } from "react";
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
import EditorMDX from "@/components/editor/mdx-editor";
import type { MDXEditorMethods } from "@mdxeditor/editor";

import { blogService } from "@/lib/services/blog-service";
import {
  blogSchema,
  type CreateBlogInput,
} from "@/lib/validations/blog-validator";

interface Props {
  onCreated?: () => void;
}

const CreateBlogForm: React.FC<Props> = ({ onCreated }) => {
  const editorRef = useRef<MDXEditorMethods>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createForm = useForm<CreateBlogInput>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      contentHtml: "",
      coverImage: undefined,
      images: [],
      videos: [],
      tags: [],
      isPublished: false,
    },
  });

  const onSubmit = async (data: CreateBlogInput) => {
    setIsSubmitting(true);
    try {
      const res = await blogService.createBlog(data);
      if (res.success) {
        toast.success("Blog created successfully!");
        createForm.reset();
        onCreated?.();
      }
    } catch (error) {
      toast.error(`Failed to create blog.`);
      console.error("Blog submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-secondary-900 rounded-lg shadow-lg mb-8">
      <h2 className="text-lg font-semibold mt-4! md:mt-6! mb-4! text-white">
        Create New Blog Post
      </h2>
      <form onSubmit={createForm.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <Controller
            name="title"
            control={createForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  {...field}
                  id="title"
                  placeholder="Enter blog title"
                  disabled={isSubmitting}
                  className="h-[initial] w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="excerpt"
            control={createForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
                <Textarea
                  {...field}
                  id="excerpt"
                  placeholder="Enter a brief excerpt"
                  disabled={isSubmitting}
                  className="h-[initial] w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="contentHtml"
            control={createForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="contentHtml">Content</FieldLabel>
                <EditorMDX
                  value={field.value}
                  fieldChange={field.onChange}
                  editorRef={editorRef}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="coverImage"
            control={createForm.control}
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
            control={createForm.control}
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
                />
              </Field>
            )}
          />
          <Controller
            name="videos"
            control={createForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="videos">
                  Video URLs (YouTube/Vimeo)
                </FieldLabel>
                <FieldDescription>
                  Enter full URLs, separated by commas.
                </FieldDescription>
                <Input
                  {...field}
                  id="videos"
                  placeholder="e.g., https://www.youtube.com/watch?v=xyz, https://vimeo.com/abc"
                  disabled={isSubmitting}
                  value={
                    Array.isArray(field.value)
                      ? field.value.join(", ")
                      : field.value || ""
                  }
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.split(",").map((url) => url.trim())
                    )
                  }
                  className="h-[initial] w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="tags"
            control={createForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="tags">Tags</FieldLabel>
                <FieldDescription>
                  Enter tags, separated by commas.
                </FieldDescription>
                <Input
                  {...field}
                  id="tags"
                  placeholder="e.g., technology, web development, tutorial"
                  disabled={isSubmitting}
                  value={
                    Array.isArray(field.value)
                      ? field.value.join(", ")
                      : field.value || ""
                  }
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.split(",").map((tag) => tag.trim())
                    )
                  }
                  className="h-[initial] w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="isPublished"
            control={createForm.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <FieldLabel htmlFor="isPublished">Publish Post</FieldLabel>
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
                <Spinner /> Creating...
              </span>
            ) : (
              "Create Blog"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogForm;
