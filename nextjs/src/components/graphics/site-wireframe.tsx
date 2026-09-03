import { WindowFrame } from "@/components/graphics/window-frame";

/**
 * A page at two widths, in one picture.
 *
 * The signature graphic for Web Development. The claim on that page is that a site loads
 * quickly on mobile data, says what you sell in the first screen, and reads on the phone most
 * customers are holding. A screenshot of a desktop page cannot show any of that. Two frames
 * can: the same layout, laid out twice, with the phone overlapping the desktop so the eye
 * reads them as one page rather than two products.
 *
 * The content inside is a real page rather than grey placeholder blocks. There is a heading
 * with a shape, a priced product row, a visible call to action and a footer, because that is
 * what a business site actually contains and a wireframe of anonymous rectangles is the exact
 * thing this graphic exists to replace.
 *
 * The image areas carry a diagonal hatch, which is the convention for "a photograph goes
 * here" and reads as a deliberate placeholder rather than as a box somebody forgot to fill.
 *
 * They are fixed heights rather than aspect ratios. A ratio is right for a real
 * photograph and wrong for a drawn placeholder: at the full width of a hero this graphic is
 * over a thousand pixels across, and three square tiles at that width are three enormous empty
 * boxes, which makes the page being shown look emptier than any page we would ship.
 *
 * The phone is positioned rather than floated, and it disappears once the graphic's own
 * container drops below 28rem. In a narrow column the desktop frame is already only a few
 * hundred pixels across, and a phone overlapping it would cover a third of the page it is
 * there to show.
 */

const PRODUCTS = [
  { name: "Ankara two piece", price: "NGN 24,500" },
  { name: "Cotton kaftan", price: "NGN 18,000" },
  { name: "Adire headwrap", price: "NGN 6,200" },
];

export function SiteWireframe() {
  return (
    <div className="@container relative @md:pb-14">
      <WindowFrame url="https://yourbusiness.com.ng/shop">
        <div className="p-4 @md:p-6">
          <MiniNav />

          <div className="mt-6 grid gap-5 @xl:grid-cols-5 @xl:items-center">
            <div className="@xl:col-span-3">
              <p className="text-foreground text-sm leading-snug font-semibold @xl:text-base">
                Fabric and ready-to-wear, delivered across Nigeria
              </p>
              <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
                Order before four, dispatched the same day from Abeokuta.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1.5 text-[10px] font-medium">
                  Shop now
                </span>
                <span className="border-border text-muted-foreground border px-3 py-1.5 text-[10px]">
                  Size guide
                </span>
              </div>
            </div>

            <div className="border-border hidden h-32 border bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,var(--color-brand-line)_5px,var(--color-brand-line)_6px)] @xl:col-span-2 @xl:block @3xl:h-40" />
          </div>

          <ul className="border-border mt-6 grid grid-cols-3 gap-4 border-t pt-5">
            {PRODUCTS.map((product) => (
              <li key={product.name}>
                <div className="border-border h-20 border bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,var(--color-brand-line)_5px,var(--color-brand-line)_6px)] @3xl:h-24" />
                <p className="text-foreground mt-2 truncate text-[10px]">{product.name}</p>
                <p className="text-primary font-mono text-[10px]">{product.price}</p>
              </li>
            ))}
          </ul>
        </div>
      </WindowFrame>

      <div className="border-border bg-background absolute -right-2 -bottom-8 hidden w-32 rounded-2xl border p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] @md:block @2xl:-right-6 @2xl:w-40">
        <div className="bg-brand-surface overflow-hidden rounded-xl p-3">
          <MiniNav compact />

          <p className="text-foreground mt-3 text-[10px] leading-snug font-semibold">
            Fabric and ready-to-wear, delivered across Nigeria
          </p>
          <span className="bg-primary text-primary-foreground mt-2 inline-block px-2 py-1 text-[9px] font-medium">
            Shop now
          </span>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="border-border h-10 border bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,var(--color-brand-line)_5px,var(--color-brand-line)_6px)]" />
            <div className="border-border h-10 border bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,var(--color-brand-line)_5px,var(--color-brand-line)_6px)]" />
          </div>

          <p className="text-muted-foreground mt-3 font-mono text-[8px]">Loaded in 1.4s</p>
        </div>
      </div>
    </div>
  );
}

/** The header bar, at both widths. A mark, three links and a cart count. */
function MiniNav({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="border-border flex items-center justify-between border-b pb-2">
        <span className="bg-primary/70 h-1.5 w-8" />
        <span className="bg-muted-foreground/40 h-1.5 w-4" />
      </div>
    );
  }

  return (
    <div className="border-border flex items-center justify-between border-b pb-3">
      <span className="bg-primary/70 h-2 w-14" />
      <div className="flex items-center gap-3">
        <span className="bg-muted-foreground/30 h-1.5 w-8" />
        <span className="bg-muted-foreground/30 h-1.5 w-10" />
        <span className="bg-muted-foreground/30 h-1.5 w-6" />
        <span className="border-border text-muted-foreground border px-2 py-0.5 font-mono text-[9px]">
          2
        </span>
      </div>
    </div>
  );
}
