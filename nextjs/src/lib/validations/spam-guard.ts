/**
 * Two cheap checks that every public form carries.
 *
 * A honeypot field, hidden from people and attractive to a form-filling bot, and a timing
 * check on how long the form was open. Together they stop the automated submissions that
 * make up almost all contact-form spam, and they cost a visitor nothing: no puzzle, no
 * third-party script, no images of traffic lights, and nothing at all for a screen reader
 * to read out.
 *
 * Neither is a security control, and the timing value is a plain number in the form that
 * anyone can rewrite. That is fine. This is a filter against volume, not against a person
 * who has decided to target this site. A real captcha goes in only if spam actually appears,
 * because it is a tax on every honest visitor paid to inconvenience a rare dishonest one.
 */

/**
 * The honeypot.
 *
 * Named after a field a bot expects to find and wants to fill. Anything that arrives with
 * this filled in was not typed by a person, because nobody can see it.
 */
export const HONEYPOT_FIELD = "company_website";

/** Milliseconds since the epoch, written by the browser when the form mounts. */
export const FORM_STARTED_FIELD = "form_started_at";

/**
 * The floor.
 *
 * Two and a half seconds is below what it takes a person to read a label and type an email
 * address, and above what a script needs, which is none. Set any higher and a fast typist
 * pasting from a password manager starts getting rejected.
 */
export const MIN_FILL_MS = 2_500;

/**
 * The ceiling.
 *
 * A form left open for four hours is usually a stale tab or a replayed capture. The check is
 * skipped entirely when the timestamp is missing or unreadable, so a visitor with JavaScript
 * disabled is not silently blocked from making contact.
 */
export const MAX_FORM_AGE_MS = 4 * 60 * 60 * 1_000;

export type SpamReason = "honeypot" | "too-fast" | "stale";

export type SpamVerdict = { ok: true } | { ok: false; reason: SpamReason };

export function checkSpamGuard(formData: FormData, now = Date.now()): SpamVerdict {
  const honeypot = formData.get(HONEYPOT_FIELD);

  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { ok: false, reason: "honeypot" };
  }

  const startedRaw = formData.get(FORM_STARTED_FIELD);
  const started = typeof startedRaw === "string" ? Number.parseInt(startedRaw, 10) : Number.NaN;

  // No usable timestamp means no JavaScript, or an old tab restored without one. Let it
  // through: the honeypot has already had its say, and blocking here would turn a browser
  // setting into a silent failure to reach the business.
  if (!Number.isFinite(started) || started <= 0) return { ok: true };

  const elapsed = now - started;

  if (elapsed < MIN_FILL_MS) return { ok: false, reason: "too-fast" };
  if (elapsed > MAX_FORM_AGE_MS) return { ok: false, reason: "stale" };

  return { ok: true };
}

/**
 * What a rejected submission is told.
 *
 * A bot is not reading this, and a person who somehow trips it needs a way forward rather
 * than an accusation, so the stale case says to try again and the rest stay vague. Saying
 * "you filled the hidden field" would only teach a spammer which field to leave alone.
 */
export function spamMessage(reason: SpamReason): string {
  return reason === "stale"
    ? "This form was open for a long time. Reload the page and send it again."
    : "That message could not be sent. Reload the page and try again.";
}
