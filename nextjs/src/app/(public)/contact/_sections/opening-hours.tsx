import { getSiteSettings } from "@/lib/queries/site-settings";

/**
 * When the office is open.
 *
 * The hours come from `SiteSettings`, and they are an outstanding Phase 0 input, so on a
 * database that has not had them entered this renders the honest alternative instead of a
 * guess. That decision is the same one the `EventVenue` structured data makes: invented hours
 * would contradict the Google Business Profile, and contradicting it is worse than saying
 * nothing, because the profile is what the local ranking signal is built from.
 *
 * The days are written out from the ISO weekday number the model stores, in order, with the
 * closed ones shown rather than omitted. A reader looking for whether Saturday is open needs
 * to see Saturday.
 *
 * The times are converted from the stored 24-hour `HH:mm` to something a person reads. That
 * conversion is arithmetic on a string rather than a `Date`, because these are opening hours
 * rather than moments: parsing "09:00" into a date would attach today to it, and reading the
 * clock during a render is what puts a statically generated page back on a timer.
 */

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export async function OpeningHours() {
  const settings = await getSiteSettings();
  const hours = settings?.openingHours ?? [];

  if (hours.length === 0) {
    return (
      <p className="text-muted-foreground text-base">
        The office keeps ordinary working hours, Monday to Friday. Rather than publish times here
        that could disagree with our Google Business Profile, call before you set out and we will
        tell you who is in.
      </p>
    );
  }

  const byDay = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <dl className="border-border divide-border divide-y border-t">
      {byDay.map((day) => (
        <div key={day.dayOfWeek} className="flex items-baseline justify-between gap-6 py-3">
          <dt className="text-foreground text-base">{DAYS[day.dayOfWeek - 1]}</dt>
          <dd className="text-muted-foreground text-sm tabular-nums">
            {day.closed ? "Closed" : `${readableTime(day.opens)} to ${readableTime(day.closes)}`}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** `17:30` to `5.30pm`. String arithmetic, so nothing here reads the clock. */
function readableTime(value: string): string {
  const [rawHour = "0", rawMinute = "00"] = value.split(":");
  const hour = Number.parseInt(rawHour, 10);

  if (!Number.isFinite(hour)) return value;

  const suffix = hour < 12 ? "am" : "pm";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;

  return rawMinute === "00" ? `${twelve}${suffix}` : `${twelve}.${rawMinute}${suffix}`;
}
