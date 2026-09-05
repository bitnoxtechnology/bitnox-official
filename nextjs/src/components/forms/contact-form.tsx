"use client";

import { FormAlert } from "@/components/forms/form-alert";
import { SpamGuard } from "@/components/forms/spam-guard";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactEnquiryAction } from "@/lib/actions/enquiry-actions";
import { contactEnquirySchema, type ContactEnquiryInput } from "@/lib/validations/enquiry-schema";
import { cn } from "@/lib/utils";

/**
 * The general contact form.
 *
 * Five fields, two of them optional, because this is the first thing somebody sends before
 * they know what they need and every extra box is a reason to close the tab. The Event Space
 * form asks for more, and it earns that: a date, a head count and a purpose are what let the
 * first reply be an answer rather than three more questions.
 *
 * There is no subject dropdown and no "how did you hear about us". A list of enquiry types
 * makes the sender categorise their own problem before they have described it, which is the
 * one thing this form should not ask them to do.
 *
 * On success the form is replaced by the confirmation. Leaving a filled-in form on screen
 * beside a success message invites the same message being sent twice.
 */
export function ContactForm({
  source = "contact",
  className,
}: {
  source?: string;
  className?: string;
}) {
  const { form, state, pending, submit } = useActionForm<ContactEnquiryInput>({
    analytics: { event: "form_submit", form_name: "contact" },
    schema: contactEnquirySchema,
    action: contactEnquiryAction,
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const { errors } = form.formState;

  if (state.status === "success") {
    return (
      <div className={cn("glass rounded-2xl p-8", className)} role="status">
        <p className="text-foreground text-lg font-medium">Thank you, we have your message.</p>
        <p className="text-muted-foreground mt-3 text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={submit} className={cn("grid gap-5", className)} noValidate>
      <SpamGuard />
      <input type="hidden" name="source" value={source} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="contact-name">Your name</FieldLabel>
          <Input
            id="contact-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="contact-email">Email address</FieldLabel>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.phone)}>
          <FieldLabel htmlFor="contact-phone">Phone number</FieldLabel>
          <Input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...form.register("phone")}
          />
          <FieldDescription>Optional. Faster than email if it is urgent.</FieldDescription>
          <FieldError errors={[errors.phone]} />
        </Field>

        <Field data-invalid={Boolean(errors.subject)}>
          <FieldLabel htmlFor="contact-subject">What it is about</FieldLabel>
          <Input
            id="contact-subject"
            aria-invalid={Boolean(errors.subject)}
            {...form.register("subject")}
          />
          <FieldDescription>Optional. A few words is enough.</FieldDescription>
          <FieldError errors={[errors.subject]} />
        </Field>
      </div>

      <Field data-invalid={Boolean(errors.message)}>
        <FieldLabel htmlFor="contact-message">What you need</FieldLabel>
        <Textarea
          id="contact-message"
          rows={6}
          placeholder="What has to change, who uses it now, and when you need it. The problem is more useful to us than the solution."
          aria-invalid={Boolean(errors.message)}
          {...form.register("message")}
        />
        <FieldError errors={[errors.message]} />
      </Field>

      <FormAlert state={state} />

      <SubmitButton pending={pending} pendingLabel="Sending" className="sm:w-auto sm:px-8">
        Send the message
      </SubmitButton>

      <p className="text-muted-foreground text-xs">
        We read every enquiry and reply within one to two working days. Your details are used to
        answer it and nothing else, as the privacy policy sets out.
      </p>
    </form>
  );
}
