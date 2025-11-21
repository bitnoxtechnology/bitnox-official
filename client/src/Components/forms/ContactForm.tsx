"use client";

import React from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  contactSchema,
  type ContactFormType,
} from "@/lib/validations/contact-validator";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { MESSAGE_TEMPLATES } from "@/lib/data";
import API from "@/lib/services/axios-client";
import { Spinner } from "../ui/spinner";

const ContactForm = () => {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<ContactFormType>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ContactFormType) => {
    startTransition(async () => {
      try {
        await API.post("/email/contact-us", data);
        toast.success("Message sent successfully! We'll get back to you soon.");
        form.reset();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log(error);
        toast.error(
          "Failed to send message. Please try again later or contact us directly at info@bitnoxsolution.com."
        );
      }
    });
  };

  const handleTemplateClick = (templateMessage: string) => {
    form.setValue("message", templateMessage);
  };

  return (
    <>
      <form
        id="contact-us-form"
        className=""
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup className="flex flex-col sm:flex-row justify-between">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  {...field}
                  id="name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your Full name"
                  autoComplete="name"
                  disabled={isPending}
                  className="h-[initial] w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="example@email.com"
                  autoComplete="email"
                  disabled={isPending}
                  className="h-[initial] w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!"
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <FieldGroup className="mt-4!">
          <Controller
            name="message"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="message">Message</FieldLabel>
                <Textarea
                  {...field}
                  id="message"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your message"
                  autoComplete="message"
                  disabled={isPending}
                  className="h-34 w-full py-4! px-5! rounded-lg border! transition-all duration-300 ease-in border-secondary-500! placeholder:text-tertiary-400! focus:outline-none! focus:border-primary-500! focus:ring-1! focus:ring-primary-500! focus:shadow-form-input!"
                />

                <FieldDescription>
                  Quick Start with a template:
                </FieldDescription>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {Object.entries(MESSAGE_TEMPLATES).map(([key, template]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTemplateClick(template.message)}
                      className="px-3 py-2! text-sm font-medium rounded-lg border border-secondary-500 text-text-primary hover:bg-secondary-500 hover:border-primary-500 transition-all duration-300"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <Field orientation="horizontal" className="w-full">
          <Button
            disabled={isPending}
            className="w-full contact-form-submit"
            type="submit"
          >
            {isPending ? <Spinner /> : "Send Message"}
          </Button>
        </Field>
      </form>
    </>
  );
};

export default ContactForm;
