import { StaggerGroup } from "@/components/motion";
import { GlassCard, SectionHeading } from "@/components/site";

/**
 * Why work with Bitnox.
 *
 * Ported from the legacy `WhyUs` component and rewritten from scratch. The originals were
 * "DEDICATED TEAMS", "CERTIFIED PROFESSIONALS", "PROMPT AND CUSTOMER FOCUSED" and
 * "24/7 SUPPORT TEAM", which is four claims any agency could make, one of which
 * ("world-class talent") is a phrase this project bans and one of which
 * (round-the-clock support) is a commitment the office has not published hours for.
 *
 * What replaced them are four things that are specific enough to be wrong if they were
 * untrue, which is the test. Each one says what actually happens on a project rather than
 * naming a virtue.
 */

const REASONS = [
  {
    title: "You talk to the people building it",
    body: "The person who scopes the work writes the code. Nothing is relayed through an account manager, so a question about a change is answered by somebody who knows what changing it costs.",
  },
  {
    title: "The scope is written down before anyone starts",
    body: "You get what the software will do, what it will not do, what it costs and roughly when, in writing. Anything found later is priced as a change rather than absorbed quietly and delivered late.",
  },
  {
    title: "We stay on after launch",
    body: "Security updates, hosting, backups, monitoring and small changes are arranged as an ongoing agreement. Nobody should be weighing up whether a bug is worth reporting.",
  },
  {
    title: "There is an office you can walk into",
    body: "Lalubu Street, Oke-Ilewo, Abeokuta. Meetings happen in the Event Space, training runs in the same building, and the phone number on this site reaches a person.",
  },
];

export function WhyBitnox() {
  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why Bitnox"
          title="What working with us is actually like"
          description="Four things that hold true on every project, and that you can hold us to."
        />

        <StaggerGroup asChild className="mt-section-sm grid gap-6 md:grid-cols-2">
          <ul>
            {REASONS.map((reason) => (
              <li key={reason.title} className="h-full">
                <GlassCard padding="lg" className="h-full">
                  <h3 className="text-foreground text-xl font-semibold">{reason.title}</h3>
                  <p className="text-muted-foreground mt-3 text-sm">{reason.body}</p>
                </GlassCard>
              </li>
            ))}
          </ul>
        </StaggerGroup>
      </div>
    </section>
  );
}
