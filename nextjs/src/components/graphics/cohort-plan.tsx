import { WindowFrame } from "@/components/graphics/window-frame";
import { cn } from "@/lib/utils";

/**
 * A course, week by week.
 *
 * The signature graphic for Technology Training. The page's argument is that most training
 * ends with a certificate and nothing built, and that these classes are built around work
 * people do afterwards. A syllabus is the only honest way to show that: you can see where the
 * teaching stops and the building starts, and you can see that the last fortnight is a
 * project rather than more slides.
 *
 * Week five is marked as the point the group stops following along and starts building
 * something of their own, because that is the week the whole claim rests on.
 *
 * The footer carries the three facts somebody comparing courses actually needs: how long, how
 * many people in the room, and what they leave with. No fee, for the same reason no fee
 * appears anywhere else on this site: those are published on Bitnox Education, where they are
 * kept current.
 */

const WEEKS = [
  { week: 1, module: "The web, HTML and CSS", kind: "Taught" },
  { week: 2, module: "JavaScript, the language", kind: "Taught" },
  { week: 3, module: "React components and state", kind: "Taught" },
  { week: 4, module: "APIs, data and forms", kind: "Taught" },
  { week: 5, module: "Your own project starts", kind: "Build" },
  { week: 6, module: "Databases and authentication", kind: "Taught" },
  { week: 7, module: "Deployment and going live", kind: "Build" },
  { week: 8, module: "Project review and assessment", kind: "Build" },
];

export function CohortPlan() {
  return (
    <WindowFrame title="Web development, 8 weeks" meta="In person, Abeokuta">
      <ol className="divide-border grid divide-y @2xl:grid-cols-2 @2xl:divide-y-0">
        {WEEKS.map((entry, index) => (
          <li
            key={entry.week}
            className={cn(
              "border-border flex items-center gap-3 px-5 py-3",
              // The two columns each need their own rules, and the vertical one only exists
              // once the list has split into two.
              index < WEEKS.length - 1 && "@2xl:border-b",
              index < WEEKS.length / 2 && "@2xl:border-r",
            )}
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center font-mono text-[10px]",
                entry.kind === "Build"
                  ? "bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground border",
              )}
            >
              {entry.week}
            </span>

            <span className="text-foreground min-w-0 flex-1 truncate text-xs">{entry.module}</span>

            <span
              className={cn(
                "shrink-0 text-[10px]",
                entry.kind === "Build" ? "text-primary" : "text-muted-foreground",
              )}
            >
              {entry.kind}
            </span>
          </li>
        ))}
      </ol>

      <dl className="border-border grid grid-cols-3 border-t">
        <Term label="Length" value="8 weeks" />
        <Term label="Group" value="12 people" />
        <Term label="Leaves with" value="A project" />
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
