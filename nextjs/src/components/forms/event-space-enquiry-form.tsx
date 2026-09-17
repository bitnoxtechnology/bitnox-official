"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Controller, useWatch, type Control } from "react-hook-form";

import { FormAlert } from "@/components/forms/form-alert";
import { SpamGuard } from "@/components/forms/spam-guard";
import { SubmitButton } from "@/components/forms/submit-button";
import { useActionForm } from "@/components/forms/use-action-form";
import { RoomPlan } from "@/components/graphics/room-plans";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROOM_LAYOUTS } from "@/content/event-space";
import { eventSpaceEnquiryAction } from "@/lib/actions/enquiry-actions";
import { EVENT_SPACE_CAPACITY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPES,
  LAYOUT_UNDECIDED,
  eventSpaceEnquirySchema,
  type EventSpaceEnquiryInput,
} from "@/lib/validations/enquiry-schema";

/**
 * The Event Space booking enquiry.
 *
 * This form is the pricing mechanism for the page. Nothing on the site publishes a rate, so
 * every figure a visitor gets starts here, and it carries the weight a rate card would carry
 * on somebody else's venue page. That decided its shape: eight fields, all of them things
 * the first reply actually depends on, and no field that exists to feed a CRM.
 *
 * It is laid out as three numbered steps against one rule, in the order the reply is
 * written: the date, the head count and what the day is for; how the room should be set
 * out; who to send the answer to. The order is also an argument. Asking for the booking
 * before the name says the form is about the room and not about capturing a lead.
 *
 * The layout is chosen from the same four plans the page draws further down, not from a
 * list of words. A reader who has never hired a room does not know what "U-shape" means and
 * does know which picture looks like their meeting. "Not sure yet" is a fifth, honest
 * option, because the setup is one of the three things the rate depends on and a guess is
 * worse than a deferral.
 *
 * The strip above the button restates the booking in the four facts the reply will be
 * about. It is a summary, not a step, and it updates as the fields do, so a typo in the head
 * count is seen before it is sent rather than in the acknowledgement email.
 *
 * On success the form is replaced by a receipt of what was sent. Leaving a filled-in
 * booking form on screen beside a success message invites a second submission of the same
 * date; a receipt answers the question the person actually has, which is whether the right
 * date went through.
 */
export function EventSpaceEnquiryForm({
  source = "event-space",
  capacity = EVENT_SPACE_CAPACITY,
  className,
}: {
  source?: string;
  /** What the room seats in theatre layout. Admin-editable, so it is passed in. */
  capacity?: number;
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
      <EnquiryReceipt values={form.getValues()} message={state.message} className={className} />
    );
  }

  const { ref: dateFieldRef, ...dateField } = form.register("preferredDate");

  return (
    <form onSubmit={submit} className={cn("grid gap-10", className)} noValidate>
      <SpamGuard />
      <input type="hidden" name="source" value={source} />

      <ol className="border-border border-l">
        <Step
          number="01"
          title="The date and the day"
          description="Three facts, and the reply can be a yes, a no, or another date that week."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.preferredDate)}>
              <FieldLabel htmlFor="enquiry-date" className={labelClass}>
                Preferred date
              </FieldLabel>
              <Input
                id="enquiry-date"
                type="date"
                className={inputClass}
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
              <FieldLabel htmlFor="enquiry-attendees" className={labelClass}>
                People expected
              </FieldLabel>
              <Input
                id="enquiry-attendees"
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                placeholder="A rough number"
                className={inputClass}
                aria-invalid={Boolean(errors.expectedAttendees)}
                {...form.register("expectedAttendees")}
              />
              <CapacityNote control={form.control} capacity={capacity} />
              <FieldError errors={[errors.expectedAttendees]} />
            </Field>

            <Field data-invalid={Boolean(errors.eventType)} className="sm:col-span-2">
              <FieldLabel htmlFor="enquiry-event-type" className={labelClass}>
                What the day is for
              </FieldLabel>
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
                      className={cn(inputClass, "data-[size=default]:h-11")}
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
              <FieldDescription>
                Conferences, meetings, workshops, classes, tech gatherings and launches. Not
                weddings or parties.
              </FieldDescription>
              <FieldError errors={[errors.eventType]} />
            </Field>
          </div>
        </Step>

        <Step
          number="02"
          title="How the room is set out"
          description="The plans below are the same four the room is laid out in. Pick the one that looks like your day."
        >
          <Field data-invalid={Boolean(errors.layout)}>
            <FieldLabel id="enquiry-layout-label" className="sr-only">
              Layout
            </FieldLabel>
            <Controller
              control={form.control}
              name="layout"
              render={({ field }) => (
                <RadioGroup
                  name={field.name}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-labelledby="enquiry-layout-label"
                  aria-invalid={Boolean(errors.layout)}
                  className="border-border grid grid-cols-2 gap-0 border-t border-l sm:grid-cols-4"
                >
                  {ROOM_LAYOUTS.map((layout) => (
                    <LayoutTile
                      key={layout.name}
                      id={`enquiry-layout-${slugify(layout.name)}`}
                      value={layout.name}
                      title={layout.name}
                      description={layout.bestFor}
                      plan={
                        <RoomPlan
                          name={layout.name}
                          className="text-muted-foreground group-has-[[data-state=checked]]/field-label:text-primary w-full transition-colors duration-300"
                        />
                      }
                    />
                  ))}

                  <LayoutTile
                    id="enquiry-layout-undecided"
                    value={LAYOUT_UNDECIDED}
                    title={LAYOUT_UNDECIDED}
                    description="Tell us what the day is for and we will suggest one in the reply."
                    className="col-span-full"
                  />
                </RadioGroup>
              )}
            />
            <FieldError errors={[errors.layout]} />
          </Field>
        </Step>

        <Step
          number="03"
          title="Where to send the answer"
          description="A name and an address. The phone number is for a date that is close."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="enquiry-name" className={labelClass}>
                Your name
              </FieldLabel>
              <Input
                id="enquiry-name"
                autoComplete="name"
                className={inputClass}
                aria-invalid={Boolean(errors.name)}
                {...form.register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="enquiry-email" className={labelClass}>
                Email address
              </FieldLabel>
              <Input
                id="enquiry-email"
                type="email"
                autoComplete="email"
                className={inputClass}
                aria-invalid={Boolean(errors.email)}
                {...form.register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={Boolean(errors.phone)}>
              <FieldLabel htmlFor="enquiry-phone" className={labelClass}>
                Phone number
              </FieldLabel>
              <Input
                id="enquiry-phone"
                type="tel"
                autoComplete="tel"
                className={inputClass}
                aria-invalid={Boolean(errors.phone)}
                {...form.register("phone")}
              />
              <FieldDescription>Optional.</FieldDescription>
              <FieldError errors={[errors.phone]} />
            </Field>

            <Field data-invalid={Boolean(errors.message)} className="sm:col-span-2">
              <FieldLabel htmlFor="enquiry-message" className={labelClass}>
                The day itself
              </FieldLabel>
              <Textarea
                id="enquiry-message"
                rows={4}
                className="min-h-28 px-3.5 py-3"
                placeholder="Start and finish times, catering, equipment you are bringing, and anything the room has to have ready."
                aria-invalid={Boolean(errors.message)}
                {...form.register("message")}
              />
              <FieldError errors={[errors.message]} />
            </Field>
          </div>
        </Step>
      </ol>

      <EnquirySummary control={form.control} />

      <FormAlert state={state} />

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton pending={pending} pendingLabel="Sending" className="h-11 px-8 sm:w-auto">
          Check this date
        </SubmitButton>

        <p className="text-muted-foreground max-w-sm text-xs">
          We reply with availability and a rate, usually within one working day. Your details are
          used to answer the enquiry and nothing else.
        </p>
      </div>
    </form>
  );
}

/** The labels sit small and spaced above their fields, so the field itself carries the weight. */
const labelClass =
  "text-muted-foreground text-2xs font-medium tracking-[0.14em] uppercase group-data-[invalid=true]/field:text-destructive";

/** Taller than the kit default. A booking form is filled in once and should not feel cramped. */
const inputClass = "h-11 px-3.5";

/**
 * One numbered step on the rule.
 *
 * A list item so the three read as a sequence, a fieldset so each group of fields has one
 * accessible name. The number sits on the rule itself, cut out of it by the page ground,
 * which is what makes the rule read as a spine rather than as a left border.
 */
function Step({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <li className="relative pb-12 pl-7 last:pb-0 sm:pl-10">
      <span
        aria-hidden
        className="bg-background text-primary text-2xs absolute top-1.5 left-0 -translate-x-1/2 px-1.5 font-mono leading-4 tracking-[0.1em]"
      >
        {number}
      </span>

      <FieldSet className="gap-6">
        <FieldLegend className="text-foreground font-heading mb-0 text-xl font-semibold">
          {title}
        </FieldLegend>
        <FieldDescription className="max-w-md">{description}</FieldDescription>
        {children}
      </FieldSet>
    </li>
  );
}

/**
 * One choice in the layout picker.
 *
 * The kit's choice-card pattern: a label wrapping a field, with the radio inside it, so the
 * whole tile is the click target and the label's `has-data-checked` styling paints the
 * selected state. The card's own rounded border is turned off in favour of the hairline grid
 * it sits in, since four rounded boxes in a row is the shape this site avoids, and the
 * selected tile is drawn with an inset line rather than a fill so the plan stays legible.
 */
function LayoutTile({
  id,
  value,
  title,
  description,
  plan,
  className,
}: {
  id: string;
  value: string;
  title: string;
  description: string;
  plan?: ReactNode;
  className?: string;
}) {
  return (
    <FieldLabel
      htmlFor={id}
      className={cn(
        "border-border bg-background has-[>[data-slot=field]]:rounded-none has-[>[data-slot=field]]:border-0 has-[>[data-slot=field]]:border-r has-[>[data-slot=field]]:border-b",
        "*:data-[slot=field]:p-4",
        "has-data-checked:border-border has-data-checked:bg-primary/10 has-data-checked:ring-primary dark:has-data-checked:border-border dark:has-data-checked:bg-primary/10 has-data-checked:ring-1 has-data-checked:ring-inset",
        "transition-colors duration-200",
        className,
      )}
    >
      <Field orientation={plan ? "vertical" : "horizontal"} className={plan ? "gap-4" : "gap-3"}>
        {plan}

        <div className="flex w-full items-start justify-between gap-3">
          <FieldContent>
            <FieldTitle className="text-foreground text-sm">{title}</FieldTitle>
            <FieldDescription className="text-xs leading-snug">{description}</FieldDescription>
          </FieldContent>
          <RadioGroupItem id={id} value={value} className="mt-0.5" />
        </div>
      </Field>
    </FieldLabel>
  );
}

/**
 * The line under the head count.
 *
 * Sixty is the one number on the page, and it is the theatre figure. Past it the note changes
 * rather than the field refusing, because a group of eighty is a real enquiry the office
 * would rather have than lose, and the answer to it is a split or a second day, which is
 * a conversation and not a validation error.
 */
function CapacityNote({
  control,
  capacity,
}: {
  control: Control<EventSpaceEnquiryInput>;
  capacity: number;
}) {
  const raw = useWatch({ control, name: "expectedAttendees" });
  const count = Number(raw);

  if (Number.isFinite(count) && count > capacity) {
    return (
      <FieldDescription className="text-foreground">
        Above the {capacity} the room seats in theatre layout. Send it anyway and we will suggest a
        split or a second day.
      </FieldDescription>
    );
  }

  return <FieldDescription>The room seats {capacity} in theatre layout.</FieldDescription>;
}

/**
 * The booking in four facts, restated above the button.
 *
 * These are the four things the reply is written about, in the order the acknowledgement
 * email lists them, so what the person reads here is what they will read back in their
 * inbox. Each cell falls back to a quiet "not yet" rather than disappearing, which keeps the
 * strip the same shape while the form is being filled in.
 */
function EnquirySummary({ control }: { control: Control<EventSpaceEnquiryInput> }) {
  const [eventType, expectedAttendees, layout, preferredDate] = useWatch({
    control,
    name: ["eventType", "expectedAttendees", "layout", "preferredDate"],
  });

  const count = Number(expectedAttendees);
  const people =
    expectedAttendees !== undefined && expectedAttendees !== "" && Number.isFinite(count)
      ? `${count} ${count === 1 ? "person" : "people"}`
      : undefined;

  const cells: Array<{ label: string; value?: string }> = [
    { label: "What for", value: eventType },
    { label: "People", value: people },
    { label: "Layout", value: layout },
    { label: "Date", value: formatDay(preferredDate) },
  ];

  return (
    <dl className="border-border divide-border grid grid-cols-2 divide-x border-y sm:grid-cols-4">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="border-border min-w-0 px-4 py-3.5 nth-[n+3]:border-t max-sm:nth-[odd]:pl-0 sm:first:pl-0 sm:nth-[n+3]:border-t-0"
        >
          <dt className="text-muted-foreground text-2xs font-medium tracking-[0.14em] uppercase">
            {cell.label}
          </dt>
          <dd
            className={cn(
              "mt-1 truncate text-sm",
              cell.value ? "text-foreground" : "text-muted-foreground/70",
            )}
          >
            {cell.value ?? "Not yet"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * What replaces the form once the enquiry is in.
 *
 * A receipt rather than a thank-you, because the question a person has at this point is
 * whether the right date went through, and the answer is to show them. The values come from
 * the form's own state, which the hook keeps after a success, so nothing is refetched.
 */
function EnquiryReceipt({
  values,
  message,
  className,
}: {
  values: EventSpaceEnquiryInput;
  message?: string;
  className?: string;
}) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "What for", value: values.eventType ?? "" },
    { label: "Layout", value: values.layout ?? "" },
    { label: "Date", value: formatDay(values.preferredDate) ?? values.preferredDate },
    { label: "People", value: String(values.expectedAttendees ?? "") },
  ].filter((row) => row.value);

  return (
    <div className={cn("border-border border-t pt-8", className)} role="status">
      <p className="text-primary text-2xs font-mono tracking-[0.14em] uppercase">
        Enquiry received
      </p>
      <h3 className="text-foreground mt-4 text-2xl font-semibold">
        Thank you, {firstName(values.name)}. We have your date.
      </h3>
      <p className="text-muted-foreground mt-3 max-w-md text-sm">{message}</p>

      <dl className="border-border divide-border mt-8 divide-y border-y">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[7rem_1fr] gap-4 py-3 text-sm">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-muted-foreground mt-6 text-xs">
        A copy is on its way to {values.email}. Reply to it if anything above is wrong.
      </p>
    </div>
  );
}

/**
 * A `YYYY-MM-DD` from the date input, written the way a person reads it.
 *
 * Built from the string's own parts and formatted in UTC, so the day shown is the day picked
 * and not the one the reader's offset lands on. Anything that is not a complete date, which
 * is what an empty or half-typed input holds, comes back undefined and the caller shows its
 * placeholder instead.
 */
function formatDay(value: string | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;

  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "";
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
