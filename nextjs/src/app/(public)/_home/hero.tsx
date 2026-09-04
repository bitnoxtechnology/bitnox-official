import { HeroGrid } from "@/app/(public)/_home/hero-grid";
import { Reveal, SplitText } from "@/components/motion";
import { ActionButton } from "@/components/site/action-button";
import { LogoMarquee } from "@/components/site/logo-marquee";
import { EDU_URL } from "@/content/properties";

/**
 * The hero.
 *
 * Centred: headline, sub-headline and the two calls to action all sit on the page's centre
 * line, with the trusted-by row closing the section. The composition is symmetrical, so the
 * only things carrying it are the type scale and the vertical space around it. There is no
 * illustration, no gradient behind the type and no glow.
 *
 * The headline is nine words in two clauses, with the shorter one carrying the claim and the
 * accent colour. That shape is what the reference does with an italic face on its last line,
 * and it is worth copying: a display headline is read as a shape before it is read as a
 * sentence, and a long even block of type gives the eye nothing to land on.
 *
 * What is not copied is the staccato triad the reference closes with. Three two-word clauses
 * in a row is a pattern this project bans outright, because it fills the space where a claim
 * should be with rhythm.
 *
 * It still names what Bitnox builds, which is the one thing the headline has to do. Software
 * and websites are concrete nouns; "businesses run on" says these are systems people depend
 * on rather than brochures. The version this replaced also carried the countries, which the
 * trusted-by heading immediately below already says, so the headline was spending its last
 * five words repeating the next line.
 *
 * Two calls to action and no more. Starting a project is the primary one; browsing courses is
 * the secondary, and it is here rather than only in the header because a course seeker
 * landing on this domain is the single most common wrong turn on the site.
 *
 * The city is deliberately absent from this copy. It belongs on the Event Space section,
 * where the room's location is the point, in the contact details and in the footer's address
 * block. Naming it in the first sentence of the page frames a company that works across
 * several countries as a local shop, which is not what it is.
 *
 * The top padding is lighter than the bottom, because the sticky header above already holds
 * its own 5.5rem clear of the headline and the two together are the gap the eye reads.
 *
 * Behind all of it, `HeroGrid` draws the page's construction lines as dashed hairlines. The
 * section is `isolate` so that layer's negative z-index stays inside this stacking context
 * and sits behind the type rather than behind the page.
 */
export function Hero() {
  return (
    <section className="pt-section-sm pb-section lg:pt-section relative isolate">
      <HeroGrid />

      <div className="container-page">
        <div className="mx-auto max-w-4xl text-center">
          <SplitText
            as="h1"
            by="word"
            delay={0.15}
            text={"We build the software and websites\nbusinesses run on."}
            accentLines={[1]}
            className="text-foreground text-display font-semibold"
          />

          <Reveal delay={0.35}>
            <p className="text-muted-foreground text-lead mt-stack mx-auto max-w-2xl">
              Bitnox Technology Solutions builds custom business systems, professional websites and
              online stores. We also advise on the technology decisions behind them and run
              professional training in technology and digital skills.
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <ActionButton href="/contact">Start a project</ActionButton>
              <ActionButton href={EDU_URL} external variant="outline">
                Browse courses
              </ActionButton>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.6}>
          <LogoMarquee className="mt-section-sm" />
        </Reveal>
      </div>
    </section>
  );
}
