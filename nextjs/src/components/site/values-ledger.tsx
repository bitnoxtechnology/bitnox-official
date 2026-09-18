import { ScrollIndex, SplitText } from "@/components/motion";
import { SectionHeading } from "@/components/site/section-heading";
import type { AboutValue } from "@/content/about";

/**
 * The values, as a ledger read one row at a time.
 *
 * The legacy page set these as four boxes in a row, a number in each corner, which is the
 * layout the composition rules single out as filler: four equal cards whose shape says
 * "template" before the words say anything. Here they are ruled rows beside a heading that
 * stays put, so each value gets the full measure and the reader takes them in order.
 *
 * The movement is `ScrollIndex`: the row under the reader's eye is at full weight and the
 * others fall back, a large numeral beside the heading rolls to match, and a line down the
 * left of the rows draws with the reader's progress. On a phone the sticky column stacks
 * above the rows and the big numeral is left out, since there is no room beside the rows for
 * it to sit; each row carries its own small number either way.
 *
 * There are no panels. The numeral is an outline at the accent colour, the rows sit on the
 * page ground under hairlines, and the only fill anywhere is the progress line.
 */
export function ValuesLedger({ values }: { values: readonly AboutValue[] }) {
  const count = String(values.length).padStart(2, "0");

  return (
    <ScrollIndex asChild>
      <section aria-labelledby="about-values-heading" className="section-y">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-28">
                <SectionHeading
                  eyebrow="Core values"
                  title={
                    <span id="about-values-heading">
                      Each value, and what it looks like on a project.
                    </span>
                  }
                  description="A value that cannot be seen in the work is a decoration. Each of these is stated as the thing you would notice if you hired us."
                />

                {/* The rolling numeral. A mask one line tall over a column of every number,
                    which `ScrollIndex` slides so the current row's number is the one showing.
                    Decorative: the rows carry their own numbers for a screen reader. */}
                <div aria-hidden className="mt-12 hidden items-end gap-4 lg:flex">
                  <span className="font-heading block h-[1em] overflow-hidden text-[clamp(6rem,8.5vw,9rem)] leading-none font-semibold tracking-[-0.06em] tabular-nums select-none">
                    <span data-index="counter" className="block">
                      {values.map((value, index) => (
                        <span
                          key={value.name}
                          data-index="digit"
                          className="block h-[1em] text-transparent [-webkit-text-stroke:1px_color-mix(in_oklab,var(--primary)_55%,transparent)]"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="text-muted-foreground mb-3 text-sm tabular-nums">/ {count}</span>
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-7">
              {/* The progress line: a dashed track, and a solid line drawn over it as the
                  reader moves down the rows. Fully drawn is the resting state. */}
              <span
                aria-hidden
                className="rule-y absolute top-0 left-0 hidden h-full w-px sm:block"
              />
              <span
                aria-hidden
                data-index="progress"
                className="bg-primary absolute top-0 left-0 hidden h-full w-px origin-top sm:block"
              />

              <ol className="sm:pl-10">
                {values.map((value, index) => (
                  <li
                    key={value.name}
                    data-index="item"
                    className="border-border grid gap-x-8 gap-y-3 border-b py-10 first:border-t sm:grid-cols-[3.5rem_1fr]"
                  >
                    <span className="text-primary text-2xs pt-1 font-medium tracking-[0.16em] tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <p className="text-2xs text-muted-foreground font-medium tracking-[0.16em] uppercase">
                        {value.name}
                      </p>
                      <SplitText
                        as="h3"
                        trigger="scroll"
                        text={value.title}
                        className="text-foreground mt-3 text-2xl font-semibold sm:text-3xl"
                      />
                      <p className="text-muted-foreground measure mt-4 text-base sm:text-lg">
                        {value.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </ScrollIndex>
  );
}
