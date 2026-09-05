"use client";

import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveEventSpaceDetailsFormAction } from "@/lib/actions/event-space-actions";
import {
  eventSpaceDetailsSchema,
  type EventSpaceDetailsInput,
} from "@/lib/validations/event-space-schema";

/**
 * Capacity, amenities and the availability copy.
 *
 * There is no rate field, and that is a decision rather than an omission. Pricing on this site
 * is on request, the enquiry form is the mechanism, and a number typed here would end up on a
 * public page. The availability copy is what answers the question a visitor is really asking
 * when they go looking for a price: how a date is held, and how quickly somebody replies.
 *
 * Amenities are one per line rather than comma-separated. They are phrases, not tags, and half
 * of them have a comma in them.
 */
export function EventSpaceDetailsForm({
  capacity,
  amenities,
  availabilityCopy,
}: {
  capacity: number;
  amenities: string[];
  availabilityCopy: string;
}) {
  const { form, state, pending, submit } = useActionForm<EventSpaceDetailsInput>({
    schema: eventSpaceDetailsSchema,
    action: saveEventSpaceDetailsFormAction,
    defaultValues: {
      capacity: String(capacity),
      amenities: amenities.join("\n"),
      availabilityCopy,
    },
  });

  const { errors } = form.formState;

  return (
    <form action={submit} className="max-w-xl space-y-6" noValidate>
      <Field data-invalid={Boolean(errors.capacity)}>
        <FieldLabel htmlFor="capacity">Seated capacity</FieldLabel>
        <Input
          id="capacity"
          type="number"
          min={1}
          aria-invalid={Boolean(errors.capacity)}
          {...form.register("capacity")}
        />
        <FieldDescription>
          Read by the Event Space page, the landing band and the structured data.
        </FieldDescription>
        <FieldError errors={[errors.capacity]} />
      </Field>

      <Field data-invalid={Boolean(errors.amenities)}>
        <FieldLabel htmlFor="amenities">Amenities</FieldLabel>
        <Textarea
          id="amenities"
          rows={8}
          placeholder={"Air conditioning\nProjector and screen\nBackup power"}
          aria-invalid={Boolean(errors.amenities)}
          {...form.register("amenities")}
        />
        <FieldDescription>
          One per line. Name what is actually in the room, not what could be arranged.
        </FieldDescription>
        <FieldError errors={[errors.amenities]} />
      </Field>

      <Field data-invalid={Boolean(errors.availabilityCopy)}>
        <FieldLabel htmlFor="availabilityCopy">Availability</FieldLabel>
        <Textarea
          id="availabilityCopy"
          rows={4}
          aria-invalid={Boolean(errors.availabilityCopy)}
          {...form.register("availabilityCopy")}
        />
        <FieldDescription>
          How a date is confirmed and how quickly a reply comes. No rates, ranges or figures: they
          depend on the date, the duration and the setup, and the enquiry form is where that
          conversation starts.
        </FieldDescription>
        <FieldError errors={[errors.availabilityCopy]} />
      </Field>

      <FormAlert state={state} />

      <SubmitButton pending={pending} pendingLabel="Saving" className="sm:w-auto sm:px-8">
        Save the details
      </SubmitButton>
    </form>
  );
}
