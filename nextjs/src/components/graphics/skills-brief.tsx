import { WindowFrame } from "@/components/graphics/window-frame";
import { cn } from "@/lib/utils";

/**
 * The gap that becomes the syllabus.
 *
 * The second graphic on Technology Training, beside the process rail. The first step on that
 * page says the syllabus is the distance between what a team can do now and what it has to be
 * able to do, and this is that arithmetic written out for one real-sounding team.
 *
 * Rows that are already covered are struck through rather than removed, which is the detail
 * that makes the point: a team is not sent on a course covering things they can already do,
 * and cutting those is what stops five days of training being three days of waiting.
 */

const BRIEF = [
  { task: "Pull the monthly sales figures without asking IT", covered: false },
  { task: "Build a spreadsheet with formulas and pivot tables", covered: true },
  { task: "Write a SQL query against the orders database", covered: false },
  { task: "Send a mail merge to the customer list", covered: true },
  { task: "Build a dashboard the branch managers can read", covered: false },
  { task: "Spot a phishing email before clicking it", covered: false },
];

export function SkillsBrief() {
  const remaining = BRIEF.filter((row) => !row.covered).length;

  return (
    <WindowFrame title="Training brief" meta="Finance team, 9 people">
      <ul className="divide-border divide-y">
        {BRIEF.map((row) => (
          <li key={row.task} className="flex items-center gap-3 px-5 py-3">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                row.covered ? "bg-muted-foreground/40" : "bg-primary",
              )}
            />
            <span
              className={cn(
                "min-w-0 flex-1 text-xs leading-snug",
                row.covered ? "text-muted-foreground line-through" : "text-foreground",
              )}
            >
              {row.task}
            </span>
            <span className="text-muted-foreground shrink-0 text-[10px]">
              {row.covered ? "Already covered" : "In the syllabus"}
            </span>
          </li>
        ))}
      </ul>

      <p className="border-border text-muted-foreground border-t px-5 py-3 text-[11px]">
        {remaining} of {BRIEF.length} tasks left to teach. That is the course, and nothing else is
        charged for.
      </p>
    </WindowFrame>
  );
}
