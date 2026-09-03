import { WindowFrame } from "@/components/graphics/window-frame";

/**
 * The three numbers a page is judged on.
 *
 * The second graphic on Web Development, beside the process rail. It shows Google's own Core
 * Web Vitals thresholds rather than scores from a site we built, and that choice is the
 * point: a panel of nineties and hundreds attached to no named project is the kind of
 * decoration a reader discounts on sight, and it would be fabricated social proof besides.
 * Published thresholds are checkable, useful to somebody who has never heard of them, and
 * they say what the work is measured against without claiming a result.
 *
 * Each row is a real distribution: the good band, the needs-work band and the poor band at
 * their actual boundaries, with the numbers written where the bands change. Anybody who has
 * opened PageSpeed Insights will recognise it, and anybody who has not can read it anyway.
 */

const VITALS = [
  {
    metric: "LCP",
    name: "Largest Contentful Paint",
    plain: "How long until the main thing on screen has loaded",
    good: "2.5s",
    poor: "4.0s",
    /** Percentage widths of the good, middling and poor bands. */
    split: [46, 24, 30],
  },
  {
    metric: "INP",
    name: "Interaction to Next Paint",
    plain: "How long a tap waits before the page responds",
    good: "200ms",
    poor: "500ms",
    split: [40, 26, 34],
  },
  {
    metric: "CLS",
    name: "Cumulative Layout Shift",
    plain: "How much the page moves under a finger while it loads",
    good: "0.1",
    poor: "0.25",
    split: [40, 22, 38],
  },
];

export function VitalsMeters() {
  return (
    <WindowFrame title="Core Web Vitals" meta="Google thresholds">
      <ul className="divide-border divide-y">
        {VITALS.map((vital) => (
          <li key={vital.metric} className="px-5 py-5">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-foreground text-sm font-semibold">
                <span className="font-mono">{vital.metric}</span>
                <span className="text-muted-foreground ml-2 text-xs font-normal">{vital.name}</span>
              </p>
            </div>

            <p className="text-muted-foreground mt-1 text-[11px]">{vital.plain}</p>

            <div className="mt-3 flex h-1.5 w-full overflow-hidden">
              <span className="bg-primary" style={{ width: `${vital.split[0]}%` }} />
              <span className="bg-muted-foreground/35" style={{ width: `${vital.split[1]}%` }} />
              <span className="bg-destructive/60" style={{ width: `${vital.split[2]}%` }} />
            </div>

            <div className="text-muted-foreground mt-2 flex justify-between font-mono text-[10px]">
              <span className="text-primary">Good under {vital.good}</span>
              <span>Poor over {vital.poor}</span>
            </div>
          </li>
        ))}
      </ul>

      <p className="border-border text-muted-foreground border-t px-5 py-3 text-[11px]">
        Measured on a mid-range Android over 4G, not on a laptop over office fibre.
      </p>
    </WindowFrame>
  );
}
