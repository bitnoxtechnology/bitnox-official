import { WindowFrame } from "@/components/graphics/window-frame";
import { cn } from "@/lib/utils";

/**
 * The deliverable, drawn.
 *
 * The signature graphic for IT Consulting, and the one graphic on the site that is closest to
 * the thing it depicts: the page says you receive a written report of findings ranked by what
 * they cost you, with effort against each, and this is a page of that report.
 *
 * Showing the artefact is what separates a consulting page a reader believes from one they
 * skim. "You get a written plan" is a sentence every agency writes. A table with a tested
 * backup at the top, two vendors billing for the same tool in the middle, and half a day of
 * effort against a leavers process is a sentence somebody can picture receiving.
 *
 * The findings are ordinary and unglamorous by design. They are the ones that turn up in
 * almost every small organisation, which is what makes the reader recognise their own.
 */

const FINDINGS = [
  {
    rank: 1,
    finding: "No backup of the customer database has ever been restored",
    impact: "High",
    effort: "2 days",
  },
  {
    rank: 2,
    finding: "One admin login shared by six members of staff",
    impact: "High",
    effort: "1 week",
  },
  {
    rank: 3,
    finding: "Two vendors billing for the same reporting tool",
    impact: "Medium",
    effort: "1 day",
  },
  {
    rank: 4,
    finding: "Stock counted in a spreadsheet, re-entered into the invoice system",
    impact: "Medium",
    effort: "6 weeks",
  },
  {
    rank: 5,
    finding: "No written step for removing a leaver's access",
    impact: "Low",
    effort: "Half a day",
  },
] as const;

const IMPACT_TONE = {
  High: "text-destructive",
  Medium: "text-foreground",
  Low: "text-muted-foreground",
} as const;

export function AuditFindings() {
  return (
    <WindowFrame title="Findings, ranked" meta="Section 2 of 5">
      <table className="w-full text-left">
        <thead>
          <tr className="text-muted-foreground border-border border-b text-[10px] tracking-[0.12em] uppercase">
            <th className="w-8 py-2.5 pl-5 font-medium">#</th>
            <th className="px-3 py-2.5 font-medium">Finding</th>
            <th className="px-3 py-2.5 font-medium">Impact</th>
            <th className="hidden py-2.5 pr-5 text-right font-medium @xl:table-cell">Effort</th>
          </tr>
        </thead>
        <tbody>
          {FINDINGS.map((row) => (
            <tr key={row.rank} className="border-border/60 border-b last:border-0">
              <td className="text-muted-foreground py-3.5 pl-5 align-top font-mono text-xs">
                {row.rank}
              </td>
              <td className="text-foreground px-3 py-3.5 align-top text-xs leading-snug">
                {row.finding}
              </td>
              <td className={cn("px-3 py-3.5 align-top text-xs", IMPACT_TONE[row.impact])}>
                {row.impact}
              </td>
              <td className="text-muted-foreground hidden py-3.5 pr-5 text-right align-top font-mono text-xs @xl:table-cell">
                {row.effort}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="border-border text-muted-foreground border-t px-5 py-3 text-[11px]">
        Ranked by what each one costs now, not by how hard it is to fix.
      </p>
    </WindowFrame>
  );
}
