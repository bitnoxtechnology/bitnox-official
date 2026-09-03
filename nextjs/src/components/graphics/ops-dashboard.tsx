import { WindowFrame } from "@/components/graphics/window-frame";
import { cn } from "@/lib/utils";

/**
 * A business management system, drawn.
 *
 * The signature graphic for Software Development. What the copy on that page claims is that
 * one system holds each record once and that stock, invoicing and the month-end report all
 * read the same row, and that claim is abstract until somebody can see the screen it lands
 * on. This is that screen: a nav rail, three figures that matter to whoever opens it at eight
 * in the morning, a week of orders, and the queue itself.
 *
 * The data is ordinary on purpose. Real order references, Nigerian trade names, a dispatch
 * queue with a part-picked line in it. A mockup filled with "Lorem" or with round numbers
 * announces that nobody thought about the business it is meant to belong to.
 *
 * Everything is hairlines and type. No inner cards, no shadows, no glow, one accent colour
 * used three times: the active nav item, the tallest bar, and the figure that is heading the
 * wrong way.
 */

const NAV = ["Overview", "Orders", "Stock", "Invoices", "Customers", "Reports"];

/** A week of orders. The last bar is today and reads as the accent. */
const WEEK = [
  { day: "M", value: 62 },
  { day: "T", value: 78 },
  { day: "W", value: 54 },
  { day: "T", value: 91 },
  { day: "F", value: 118 },
  { day: "S", value: 74 },
  { day: "S", value: 128 },
];

/** The tone is carried on the row rather than looked up, so the queue reads in one place. */
const ORDERS = [
  {
    ref: "BX-10482",
    customer: "Adeola Stores, Abeokuta",
    items: 12,
    status: "Dispatched",
    tone: "text-primary",
  },
  {
    ref: "BX-10481",
    customer: "Kembo Pharmacy",
    items: 4,
    status: "Packed",
    tone: "text-foreground",
  },
  {
    ref: "BX-10479",
    customer: "Lalubu Provisions",
    items: 27,
    status: "Part picked",
    tone: "text-muted-foreground",
  },
  {
    ref: "BX-10478",
    customer: "Oke-Ilewo Bakery",
    items: 6,
    status: "Awaiting stock",
    tone: "text-destructive",
  },
];

export function OpsDashboard() {
  const tallest = Math.max(...WEEK.map((entry) => entry.value));

  return (
    <WindowFrame title="Orders and stock" meta="Updated 08:14">
      <div className="flex">
        <nav className="border-border hidden w-40 shrink-0 border-r py-4 @2xl:block">
          <ul className="grid gap-0.5 text-xs">
            {NAV.map((item) => (
              <li key={item}>
                <span
                  className={cn(
                    "block border-l-2 px-4 py-2",
                    item === "Orders"
                      ? "text-primary border-primary font-medium"
                      : "text-muted-foreground border-transparent",
                  )}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">
          <dl className="border-border grid grid-cols-3 border-b">
            <Figure label="Orders today" value="128" note="+14 on last Friday" />
            <Figure label="Awaiting dispatch" value="17" note="4 over the promised date" alert />
            <Figure label="Value this week" value="4.28m" prefix="NGN " note="Invoiced, not paid" />
          </dl>

          <div className="border-border border-b px-5 py-5">
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
              Orders, last seven days
            </p>

            {/* The bars and the day letters are two rows rather than seven columns of
                [bar, letter]. A percentage height only resolves against a parent with a
                definite one, and a column sized by its own content has none, so bars nested
                beside their labels collapse to nothing. The row below carries the height. */}
            <div className="mt-4 flex h-24 items-end gap-2 @md:gap-3">
              {WEEK.map((entry, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex-1",
                    entry.value === tallest ? "bg-primary" : "bg-muted-foreground/25",
                  )}
                  style={{ height: `${(entry.value / tallest) * 100}%` }}
                />
              ))}
            </div>

            <div className="mt-2 flex gap-2 @md:gap-3">
              {WEEK.map((entry, index) => (
                <span
                  key={index}
                  className="text-muted-foreground flex-1 text-center font-mono text-[10px]"
                >
                  {entry.day}
                </span>
              ))}
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-muted-foreground border-border border-b text-[10px] tracking-[0.12em] uppercase">
                <th className="px-5 py-2.5 font-medium">Order</th>
                <th className="hidden px-3 py-2.5 font-medium @xl:table-cell">Customer</th>
                <th className="px-3 py-2.5 text-right font-medium">Items</th>
                <th className="px-5 py-2.5 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((order) => (
                <tr key={order.ref} className="border-border/60 border-b last:border-0">
                  <td className="text-foreground px-5 py-3 font-mono">{order.ref}</td>
                  <td className="text-muted-foreground hidden truncate px-3 py-3 @xl:table-cell">
                    {order.customer}
                  </td>
                  <td className="text-muted-foreground px-3 py-3 text-right font-mono">
                    {order.items}
                  </td>
                  <td className={cn("px-5 py-3 text-right", order.tone)}>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </WindowFrame>
  );
}

function Figure({
  label,
  value,
  prefix,
  note,
  alert = false,
}: {
  label: string;
  value: string;
  prefix?: string;
  note: string;
  alert?: boolean;
}) {
  return (
    <div className="border-border border-r px-4 py-4 last:border-r-0 @md:px-5">
      <dt className="text-muted-foreground text-[10px] tracking-[0.12em] uppercase">{label}</dt>
      <dd className="text-foreground mt-2 text-xl font-semibold tabular-nums @md:text-2xl">
        {prefix ? (
          <span className="text-muted-foreground text-xs font-normal">{prefix}</span>
        ) : null}
        {value}
      </dd>
      <p className={cn("mt-1 text-[10px]", alert ? "text-destructive" : "text-muted-foreground")}>
        {note}
      </p>
    </div>
  );
}
