import { WindowFrame } from "@/components/graphics/window-frame";
import { cn } from "@/lib/utils";

/**
 * The order of work, on a calendar.
 *
 * The second graphic on IT Consulting, beside the process rail. The findings table shows what
 * the report says; this shows the half of the deliverable that decides whether anything
 * actually gets done, which is the sequence and what it costs in weeks.
 *
 * The point it makes visually is that the cheap fixes come first and the expensive one is
 * scheduled around them rather than blocking them. A reader looking at a six-month bar
 * starting in month two, with two one-month items finished before it, understands the shape
 * of the plan without reading a word of the section beside it.
 *
 * Grid columns rather than absolute positioning, so the bars stay aligned to the month rule
 * at every width and the whole thing reflows without measuring anything.
 */

const WORK = [
  { name: "Backups, tested and scheduled", start: 1, span: 1, now: true },
  { name: "Shared logins replaced with accounts", start: 1, span: 2, now: true },
  { name: "Duplicate reporting tool retired", start: 2, span: 1, now: false },
  { name: "Stock spreadsheet replaced with a system", start: 3, span: 3, now: false },
  { name: "Written policy and staff session", start: 5, span: 1, now: false },
  { name: "Review of what changed", start: 6, span: 1, now: false },
];

const MONTHS = ["M1", "M2", "M3", "M4", "M5", "M6"];

export function PlanTimeline() {
  return (
    <WindowFrame title="Order of work" meta="Six months">
      <div className="px-5 py-5">
        <div className="text-muted-foreground grid grid-cols-6 gap-1 font-mono text-[10px]">
          {MONTHS.map((month) => (
            <span key={month} className="border-border border-l pl-1.5">
              {month}
            </span>
          ))}
        </div>

        <ul className="mt-4 grid gap-3">
          {WORK.map((item) => (
            <li key={item.name}>
              <div className="grid grid-cols-6 gap-1">
                <div
                  className={cn("h-6", item.now ? "bg-primary" : "bg-muted-foreground/25")}
                  style={{ gridColumn: `${item.start} / span ${item.span}` }}
                />
              </div>
              <p
                className={cn(
                  "mt-1.5 text-[11px] leading-snug",
                  item.now ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.name}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <p className="border-border text-muted-foreground border-t px-5 py-3 text-[11px]">
        Cheap fixes first. The one that takes three months is scheduled around them, not in front of
        them.
      </p>
    </WindowFrame>
  );
}
