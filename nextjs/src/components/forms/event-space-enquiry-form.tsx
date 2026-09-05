"use client";

import { useEffect, useRef } from "react";
import { Controller } from "react-hook-form";

import { FormAlert } from "@/components/forms/form-alert";
import { SpamGuard } from "@/components/forms/spam-guard";
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
import { Textarea } from "@/components/ui/textarea";
import { eventSpaceEnquiryAction } from "@/lib/actions/enquiry-actions";
import {
  EVENT_TYPES,
  eventSpaceEnquirySchema,
  type EventSpaceEnquiryInput,
} from "@/lib/validations/enquiry-schema";
import { cn } from "@/lib/utils";

/**
 * The Event Space booking enquiry.
 *
 * This form is the pricing mechanism for the page. Nothing on the site publishes a rate, so
 * every figure a visitor gets starts here, and it carries the weight a rate card would carry
 * on somebody else's venue page. That decided its shape: seven fields, all of them things
 * the first reply actually depends on, and no field that exists to feed a CRM.
 *
 * The three in the middle are the ones that matter. A date, a head count and what the room is
 * for are enough to answer with a yes, a no or an alternative date and a figure, instead of
 * three more questions and two days.
 *
 * What the room is for is a fixed list rather than free text, and the list is also the
 * clearest statement on the page of what the room is not for. "Event Space" attracts wedding
 * and party enquiries; a menu that offers a conference, a meeting, a workshop, a class, a
 * tech gathering and a product launch answers that without a line of copy having to.
 *
 * On success the form is replaced by the confirmation. Leaving a filled-in booking form on
 * screen beside a success message invites a second submission of the same date.
 */
export function EventSpaceEnquiryForm({
  source = "event-space",
  className,
}: {
  source?: string;
  className?: string;
}) {
  const { form, state, pending, submit } = useActionForm<EventSpaceEnquiryInput>({
    // The conversion the site exists for, so it is an event of its own rather than a
    // `form_submit` a container has to filter for. See `src/lib/analytics.ts`.
    analytics: { event: "event_space_enquiry" },
    schema: eventSpaceEnquirySchema,
    action: eventSpaceEnquiryAction,
    defaultValues: { name: "", email: "", phone: "", preferredDate: "", message: "" },
  });

  const { errors } = form.formState;
  const dateRef = useRef<HTMLInputElement>(null);

  // Today's date, written onto the date input after mount so the calendar greys out days
  // that have already gone. It is set in an effect rather than rendered, because this form
  // sits on a statically generated page: reading the clock during the render would bake the
  // build date into the HTML and put every page in this tree back on a timer. The server
  // action re-checks the date either way, which is the pass that decides anything.
  useEffect(() => {
    if (dateRef.current) dateRef.current.min = new Date().toISOString().slice(0, 10);
  }, []);

  if (state.status === "success") {
    return (
      <div className={cn("glass rounded-2xl p-8", className)} role="status">
        <p className="text-foreground text-lg font-medium">Thank you, we have your enquiry.</p>
        <p className="text-muted-foreground mt-3 text-sm">{state.message}</p>
      </div>
    );
  }

  const { ref: dateFieldRef, ...dateField } = form.register("preferredDate");

  return (
    <form action={submit} className={cn("grid gap-5", className)} noValidate>
      <SpamGuard />
      <input type="hidden" name="source" value={source} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="enquiry-name">Your name</FieldLabel>
          <Input
            id="enquiry-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="enquiry-email">Email address</FieldLabel>
          <Input
            id="enquiry-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.phone)}>
          <FieldLabel htmlFor="enquiry-phone">Phone number</FieldLabel>
          <Input
            id="enquiry-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...form.register("phone")}
          />
          <FieldDescription>Optional. Useful if your date is close.</FieldDescription>
          <FieldError errors={[errors.phone]} />
        </Field>

        <Field data-invalid={Boolean(errors.eventType)}>
          <FieldLabel htmlFor="enquiry-event-type">What the room is for</FieldLabel>
          {/*
           * A Radix select is not a native `<select>`, so `form.register` has nothing to bind
           * to and the field goes through `Controller`. `name` on the root is what makes
           * Radix render its hidden native select, which is what puts the value into the
           * `FormData` the server action reads.
           */}
          <Controller
            control={form.control}
            name="eventType"
            render={({ field }) => (
              <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id="enquiry-event-type"
                  className="h-10 w-full"
                  aria-invalid={Boolean(errors.eventType)}
                  onBlur={field.onBlur}
                >
                  {/* The label is passed rather than left to Radix. With the menu closed its
                      items live in a fragment that only exists after hydration, so an empty
                      `SelectValue` renders a blank trigger on the server. */}
                  <SelectValue placeholder="Choose one">{field.value}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.eventType]} />
        </Field>

        <Field data-invalid={Boolean(errors.preferredDate)}>
          <FieldLabel htmlFor="enquiry-date">Preferred date</FieldLabel>
          <Input
            id="enquiry-date"
            type="date"
            className="h-10"
            aria-invalid={Boolean(errors.preferredDate)}
            {...dateField}
            ref={(node) => {
              dateFieldRef(node);
              dateRef.current = node;
            }}
          />
          <FieldDescription>
            If you have more than one date in mind, say so in the message.
          </FieldDescription>
          <FieldError errors={[errors.preferredDate]} />
        </Field>

        <Field data-invalid={Boolean(errors.expectedAttendees)}>
          <FieldLabel htmlFor="enquiry-attendees">People expected</FieldLabel>
          <Input
            id="enquiry-attendees"
            type="number"
            inputMode="numeric"
            min={1}
            max={500}
            className="h-10"
            aria-invalid={Boolean(errors.expectedAttendees)}
            {...form.register("expectedAttendees")}
          />
          <FieldDescription>A rough number is fine.</FieldDescription>
          <FieldError errors={[errors.expectedAttendees]} />
        </Field>
      </div>

      <Field data-invalid={Boolean(errors.message)}>
        <FieldLabel htmlFor="enquiry-message">What you need the room for</FieldLabel>
        <Textarea
          id="enquiry-message"
          rows={4}
          placeholder="The start and finish times, the layout you want, and anything the room has to have on the day."
          aria-invalid={Boolean(errors.message)}
          {...form.register("message")}
        />
        <FieldError errors={[errors.message]} />
      </Field>

      <FormAlert state={state} />

      <SubmitButton pending={pending} pendingLabel="Sending" className="sm:w-auto sm:px-8">
        Check this date
      </SubmitButton>

      <p className="text-muted-foreground text-xs">
        We reply with availability and a rate, usually within one working day. Your details are used
        to answer the enquiry and nothing else.
      </p>
    </form>
  );
}
