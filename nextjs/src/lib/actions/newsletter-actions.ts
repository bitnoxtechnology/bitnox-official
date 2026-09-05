"use server";

import { requestMetadata } from "@/lib/auth/cookies";
import { randomToken } from "@/lib/auth/crypto";
import { enforceRateLimits, RATE_LIMITS, retryAfterMessage } from "@/lib/auth/rate-limit";
import {
  errorState,
  fail,
  ok,
  successState,
  text,
  toActionState,
  validate,
  type ActionState,
} from "@/lib/actions/action-state";
import { withAuth, withSuperAdmin } from "@/lib/actions/with-auth";
import { connectToDatabase, isDuplicateKeyError } from "@/lib/db";
import { sendNewsletterWelcome } from "@/lib/mail/site-mail";
import { idSchema } from "@/lib/validations/admin-schema";
import { checkSpamGuard, spamMessage } from "@/lib/validations/spam-guard";
import { subscribeSchema, unsubscribeSchema } from "@/lib/validations/newsletter-schema";
import { NewsletterSubscriber } from "@/models";

/**
 * Newsletter subscribe and unsubscribe.
 *
 * The two public actions assume the caller is hostile until the spam guard and the rate
 * limiter have had their say. The admin actions at the foot of the file are guarded by
 * wrapping, and deleting a subscriber outright is restricted further, to a super admin.
 */

const CONFIRMED = "You are on the list. Check your inbox for a confirmation.";

/**
 * Three cases, one message.
 *
 * A new address, an address already subscribed, and an address that unsubscribed and has
 * come back all end with the same sentence. The alternative is a form that answers "you are
 * already subscribed", which turns a footer input into a way of testing whether a given
 * person reads this newsletter.
 */
export async function subscribeAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const guard = checkSpamGuard(formData);
  if (!guard.ok) return errorState(spamMessage(guard.reason));

  const parsed = validate(subscribeSchema, {
    email: text(formData, "email"),
    source: text(formData, "source"),
  });

  if (!parsed.ok) return toActionState(parsed);

  const { email, source } = parsed.data;
  const { ip } = await requestMetadata();

  const limit = await enforceRateLimits([[`newsletter:ip:${ip}`, RATE_LIMITS.newsletterPerIp]]);

  if (!limit.allowed) {
    return errorState(`Too many signups from here. ${retryAfterMessage(limit.retryAfterSeconds)}`);
  }

  await connectToDatabase();

  const existing = await NewsletterSubscriber.findOne({ email })
    .select("status unsubscribeToken")
    .exec();

  if (existing) {
    // Already on the list. Nothing to write, and no second welcome email, which would let
    // anyone use this form to mail an address repeatedly.
    if (existing.status === "subscribed") return successState(CONFIRMED);

    existing.status = "subscribed";
    existing.confirmedAt = new Date();
    existing.unsubscribedAt = undefined;
    // A new token, so the link in the old goodbye email cannot remove them again.
    existing.unsubscribeToken = randomToken(24);
    await existing.save();

    await sendNewsletterWelcome({ to: email, unsubscribeToken: existing.unsubscribeToken });
    return successState(CONFIRMED);
  }

  const unsubscribeToken = randomToken(24);

  try {
    await NewsletterSubscriber.create({
      email,
      status: "subscribed",
      source,
      confirmedAt: new Date(),
      unsubscribeToken,
    });
  } catch (error: unknown) {
    // Two submissions of the same address at the same moment: the lookup above found
    // nothing for both, and the unique index refused the second. The address is on the
    // list either way, so the sender is told what is true.
    if (isDuplicateKeyError(error)) return successState(CONFIRMED);
    throw error;
  }

  await sendNewsletterWelcome({ to: email, unsubscribeToken });

  return successState(CONFIRMED);
}

/**
 * One click, no sign-in, no confirmation screen that asks whether you are sure.
 *
 * The token is the whole credential, which is the correct trade here: the worst a leaked
 * token allows is removing an address from a mailing list, and any extra step between the
 * link and the removal is what makes a person press the spam button instead.
 *
 * The row is kept with a status of `unsubscribed` rather than deleted, so a later import of
 * the same address cannot quietly put them back on.
 */
export async function unsubscribeAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = validate(unsubscribeSchema, { token: text(formData, "token") });
  if (!parsed.ok) return toActionState(parsed);

  await connectToDatabase();

  const subscriber = await NewsletterSubscriber.findOneAndUpdate(
    { unsubscribeToken: parsed.data.token },
    { $set: { status: "unsubscribed", unsubscribedAt: new Date() } },
    { new: true },
  ).exec();

  if (!subscriber) {
    return errorState("That unsubscribe link is not valid. It may already have been used.");
  }

  return successState(`${subscriber.email} has been removed from the list.`);
}

// --- The admin list ---------------------------------------------------------

/**
 * Removing somebody from the list on their behalf.
 *
 * The status is set rather than the row deleted, for the same reason the public unsubscribe
 * keeps it: an address that asked to be removed and is then re-imported from an old
 * spreadsheet would quietly go back on the list, and the row is what remembers that it
 * should not.
 */
export const unsubscribeSubscriberAction = withAuth<[string], { email: string }>(
  async (_user, id) => {
    const parsed = validate(idSchema, { id });
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const subscriber = await NewsletterSubscriber.findByIdAndUpdate(
      parsed.data.id,
      { $set: { status: "unsubscribed", unsubscribedAt: new Date() } },
      { new: true },
    )
      .lean()
      .exec();

    if (!subscriber) return fail("That subscriber no longer exists.");

    return ok({ email: subscriber.email }, `${subscriber.email} has been removed from the list.`);
  },
);

/**
 * Deleted outright.
 *
 * Kept separate from unsubscribing, and reserved for the two cases that mean it: an obvious
 * spam signup, and a request to erase personal data. Unsubscribing is the everyday action and
 * it is the one the list screen offers first.
 */
export const deleteSubscriberAction = withSuperAdmin<[string], { email: string }>(
  async (_user, id) => {
    const parsed = validate(idSchema, { id });
    if (!parsed.ok) return parsed;

    await connectToDatabase();

    const removed = await NewsletterSubscriber.findByIdAndDelete(parsed.data.id).lean().exec();
    if (!removed) return fail("That subscriber no longer exists.");

    return ok({ email: removed.email }, `${removed.email} has been deleted.`);
  },
);
