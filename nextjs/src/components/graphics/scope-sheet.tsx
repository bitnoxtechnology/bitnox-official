import { WindowFrame } from "@/components/graphics/window-frame";

/**
 * The scope document, drawn.
 *
 * The second graphic on Software Development, beside the process rail. The page's strongest
 * claim is that you are told what will be built, what will not be, what it costs and roughly
 * when, before anybody writes code. That claim is worth showing rather than repeating,
 * because the half a reader cares about is the half nobody publishes: the list of things that
 * are not included.
 *
 * So the "not in this build" column is the same size as the "in this build" column and sits
 * beside it rather than under it. An agency that will write that column down in advance is a
 * different proposition from one that discovers it in month three.
 *
 * No figure appears. Prices depend on the job and nothing on this site publishes one, so the
 * footer says what is fixed rather than what it costs, which is the honest version of the
 * same reassurance.
 */

const IN_SCOPE = [
  "Order entry, picking and dispatch",
  "Stock levels across two locations",
  "Invoices, receipts and a monthly summary",
  "Staff accounts with four permission levels",
  "Migration of 3 years of order history",
  "Hosting, backups and monitoring",
];

const OUT_OF_SCOPE = [
  "Payroll, which stays in the existing package",
  "A customer-facing store, quoted separately",
  "Integration with the bank feed, phase two",
  "Hardware, scanners and label printers",
];

export function ScopeSheet() {
  return (
    <WindowFrame title="Scope, agreed before build" meta="v1.2, signed">
      <div className="px-5 py-5">
        <p className="text-foreground text-sm font-semibold">Order and stock system</p>
        <p className="text-muted-foreground mt-1 text-[11px]">
          Wholesale food distributor, two locations, 14 staff
        </p>

        <div className="border-border mt-5 grid gap-6 border-t pt-5 @xl:grid-cols-2 @xl:gap-8">
          <div>
            <p className="text-primary text-[10px] font-medium tracking-[0.12em] uppercase">
              In this build
            </p>
            <ul className="mt-3 grid gap-2.5">
              {IN_SCOPE.map((item) => (
                <li key={item} className="text-foreground flex gap-2.5 text-[11px] leading-snug">
                  <span className="bg-primary mt-1.5 size-1 shrink-0 rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-muted-foreground text-[10px] font-medium tracking-[0.12em] uppercase">
              Not in this build
            </p>
            <ul className="mt-3 grid gap-2.5">
              {OUT_OF_SCOPE.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex gap-2.5 text-[11px] leading-snug"
                >
                  <span className="bg-muted-foreground/50 mt-2 h-px w-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <dl className="border-border grid grid-cols-3 border-t">
        <Term label="Price" value="Fixed" />
        <Term label="Build" value="9 weeks" />
        <Term label="Changes" value="Quoted, not absorbed" />
      </dl>
    </WindowFrame>
  );
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border border-r px-5 py-3 last:border-r-0">
      <dt className="text-muted-foreground text-[10px] tracking-[0.12em] uppercase">{label}</dt>
      <dd className="text-foreground mt-1 text-xs font-medium">{value}</dd>
    </div>
  );
}
