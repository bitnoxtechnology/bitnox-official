import { mailed, request, resetStubs, revalidated, RedirectError } from "./action-stubs";

/**
 * The server actions, called the way a form calls them.
 *
 * `scripts/test-auth.ts` covers the auth primitives, sessions, codes, tokens and rate limits,
 * at the level of the functions that implement them. This covers the layer above: the actions
 * a browser actually posts to. The two questions it exists to answer are the ones the
 * conventions in `CLAUDE.md` turn on. Does an action refuse a caller with no session, before
 * it touches data. And does the schema in `src/lib/validations/` decide the outcome, given
 * that the client-side pass is not to be trusted and can simply be skipped, which is what
 * every test here does by building a `FormData` and calling the action directly.
 *
 *   npm run test:actions
 *
 * Runs against the same test database as `test:auth`, under the same name guard.
 *
 * `./action-stubs` has to be the first import in this file. It replaces the modules that only
 * work inside a Next.js request, and imports are hoisted, so importing it second would mean
 * importing it after the actions had already pulled the real ones in. Its own comment says
 * what is replaced and why.
 */

import { databaseNameFromUri, fail } from "./bootstrap";

import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import {
  createBlogAction,
  deleteBlogAction,
  duplicateBlogAction,
  setBlogStatusAction,
  updateBlogAction,
} from "@/lib/actions/blog-actions";
import { contactEnquiryAction, eventSpaceEnquiryAction } from "@/lib/actions/enquiry-actions";
import { randomToken } from "@/lib/auth/crypto";
import { CACHE_TAGS, itemTag } from "@/lib/cache";
import { connectToDatabase, disconnectFromDatabase } from "@/lib/db";
import { FORM_STARTED_FIELD, HONEYPOT_FIELD, MIN_FILL_MS } from "@/lib/validations/spam-guard";
import { Blog, Enquiry, RateLimit } from "@/models";

const TEST_DATABASE = "bitnox-official-test";

function testUri(): string {
  const explicit = process.env.TEST_MONGO_URI;
  if (explicit) return explicit;

  const uri = process.env.MONGO_URI;
  if (!uri) fail("Neither TEST_MONGO_URI nor MONGO_URI is set.");

  const parsed = new URL(uri);
  parsed.pathname = `/${TEST_DATABASE}`;
  return parsed.toString();
}

const suffix = randomToken(6)
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "");

const AUTHOR = { id: "6710000000000000000000a1", role: "admin" as const };

/**
 * The minimum Tiptap document the blog schema will accept, as the string a form posts.
 *
 * `contentJson` arrives as JSON in a hidden field, because a form cannot post an object. The
 * schema parses it, so the tests post the same string the editor does rather than an object
 * the action would never receive.
 */
const CONTENT = JSON.stringify({
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "The office moved to a single order book in March and stopped losing jobs between the two spreadsheets it had been running.",
        },
      ],
    },
  ],
});

function blogForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  const fields: Record<string, string> = {
    title: `A test post ${suffix}`,
    slug: `a-test-post-${suffix}`,
    excerpt:
      "What changed when the order book stopped living in two spreadsheets, and what it cost to move it.",
    contentJson: CONTENT,
    status: "draft",
    tags: "business-systems",
    category: "business-systems",
    featured: "",
    ...overrides,
  };

  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return form;
}

/**
 * A public form as a browser would post it: past the honeypot and past the timing floor.
 *
 * `form_started_at` is set far enough back that the guard's minimum fill time has elapsed.
 * A test that wants to be rejected overrides it, which is the only honest way to test the
 * guard: the value is a plain number in the form and a bot can write anything into it.
 */
function publicForm(fields: Record<string, string>): FormData {
  const form = new FormData();
  form.set(HONEYPOT_FIELD, "");
  form.set(FORM_STARTED_FIELD, String(Date.now() - MIN_FILL_MS - 1_000));
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  return form;
}

const enquiryEmail = (label: string) => `${label}-${suffix}@example.test`;

/** A `YYYY-MM-DD` a given number of days from today, which is the form a date input posts. */
const futureDay = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** Runs an action that is expected to redirect, and reports where it went. */
async function redirectFrom(run: () => Promise<unknown>): Promise<string> {
  try {
    await run();
  } catch (error: unknown) {
    if (error instanceof RedirectError) return error.to;
    throw error;
  }

  assert.fail("expected the action to redirect, but it returned");
}

before(async () => {
  const uri = testUri();
  const name = databaseNameFromUri(uri);

  if (name !== TEST_DATABASE) {
    fail(`Refusing to run against "${name}". The test database must be "${TEST_DATABASE}".`);
  }

  process.env.MONGO_URI = uri;
  await connectToDatabase();
});

beforeEach(resetStubs);

after(async () => {
  await Promise.all([
    Blog.deleteMany({ slug: new RegExp(suffix) }).exec(),
    Enquiry.deleteMany({ email: new RegExp(suffix) }).exec(),
    RateLimit.deleteMany({ key: new RegExp(suffix) }).exec(),
  ]);
  await disconnectFromDatabase();
});

// --- The guard ----------------------------------------------------------------

describe("the authorisation boundary", () => {
  /**
   * The rule from `CLAUDE.md` is that `proxy.ts` is defence in depth and the guard inside the
   * action is the boundary. That is only true if the guard runs before the action reads the
   * form, so each of these posts a form that would otherwise succeed and asserts that nothing
   * was written.
   */
  it("sends an unauthenticated create to the sign-in page and writes nothing", async () => {
    const slug = `guarded-create-${suffix}`;

    assert.equal(await redirectFrom(() => createBlogAction(blogForm({ slug }))), "/admin/login");
    assert.equal(await Blog.countDocuments({ slug }).exec(), 0);
    assert.deepEqual(revalidated, []);
  });

  it("sends an unauthenticated update to the sign-in page", async () => {
    request.signedInAs = AUTHOR;
    const created = await createBlogAction(blogForm({ slug: `guarded-update-${suffix}` }));
    assert.ok(created.ok);

    request.signedInAs = null;
    assert.equal(
      await redirectFrom(() => updateBlogAction(created.data.id, blogForm())),
      "/admin/login",
    );

    const post = await Blog.findById(created.data.id).exec();
    assert.equal(post?.slug, `guarded-update-${suffix}`, "the post was not modified");
  });

  it("sends an unauthenticated delete to the sign-in page and leaves the post", async () => {
    request.signedInAs = AUTHOR;
    const created = await createBlogAction(blogForm({ slug: `guarded-delete-${suffix}` }));
    assert.ok(created.ok);

    request.signedInAs = null;
    assert.equal(await redirectFrom(() => deleteBlogAction(created.data.id)), "/admin/login");
    assert.equal(await Blog.countDocuments({ _id: created.data.id }).exec(), 1);
  });
});

// --- Blog CRUD ----------------------------------------------------------------

describe("blog CRUD", () => {
  beforeEach(() => {
    request.signedInAs = AUTHOR;
  });

  it("creates a post, renders the HTML snapshot and invalidates both tags", async () => {
    const slug = `created-${suffix}`;
    const result = await createBlogAction(blogForm({ slug }));

    assert.ok(result.ok, result.ok ? "" : result.message);
    assert.equal(result.data.slug, slug);

    const post = await Blog.findById(result.data.id).exec();
    assert.ok(post);
    assert.equal(post.status, "draft");
    // `contentHtml` is the snapshot the public page reads, so the reader never downloads the
    // editor. If it were empty the post would render as a blank article.
    assert.match(post.contentHtml, /<p>/);
    assert.match(post.contentHtml, /single order book/);
    assert.equal(String(post.author), AUTHOR.id);

    assert.ok(revalidated.includes(CACHE_TAGS.blog));
    assert.ok(revalidated.includes(itemTag(CACHE_TAGS.blog, slug)));
  });

  it("refuses a second post on the same slug", async () => {
    const slug = `duplicate-slug-${suffix}`;

    const first = await createBlogAction(blogForm({ slug }));
    assert.ok(first.ok);

    const second = await createBlogAction(blogForm({ slug, title: "A different title" }));
    assert.equal(second.ok, false);
    assert.ok(!second.ok && second.fieldErrors?.slug, "the message names the slug field");
    assert.equal(await Blog.countDocuments({ slug }).exec(), 1);
  });

  it("rejects a post whose excerpt is missing, without writing anything", async () => {
    const slug = `invalid-${suffix}`;
    const form = blogForm({ slug });
    form.set("excerpt", "");

    const result = await createBlogAction(form);

    assert.equal(result.ok, false);
    assert.ok(!result.ok && result.fieldErrors?.excerpt);
    assert.equal(await Blog.countDocuments({ slug }).exec(), 0);
    assert.deepEqual(revalidated, [], "nothing was invalidated for a write that did not happen");
  });

  it("invalidates the old slug as well when an edit renames the post", async () => {
    const from = `renamed-from-${suffix}`;
    const to = `renamed-to-${suffix}`;

    const created = await createBlogAction(blogForm({ slug: from }));
    assert.ok(created.ok);

    revalidated.length = 0;
    const updated = await updateBlogAction(created.data.id, blogForm({ slug: to }));

    assert.ok(updated.ok, updated.ok ? "" : updated.message);
    assert.ok(revalidated.includes(itemTag(CACHE_TAGS.blog, to)), "the new URL");
    assert.ok(
      revalidated.includes(itemTag(CACHE_TAGS.blog, from)),
      "the old URL, whose cached page is now a page for a post that moved",
    );
  });

  it("stamps publishedAt on the first publish and keeps it on a re-publish", async () => {
    const created = await createBlogAction(blogForm({ slug: `published-${suffix}` }));
    assert.ok(created.ok);

    const published = await setBlogStatusAction(created.data.id, "published");
    assert.ok(published.ok, published.ok ? "" : published.message);

    const first = await Blog.findById(created.data.id).exec();
    assert.ok(first?.publishedAt, "publishing stamps a date");
    const stamped = first.publishedAt;

    await setBlogStatusAction(created.data.id, "draft");
    await setBlogStatusAction(created.data.id, "published");

    const again = await Blog.findById(created.data.id).exec();
    assert.equal(
      again?.publishedAt?.getTime(),
      stamped?.getTime(),
      "a re-publish must not present an old article as new",
    );
  });

  it("refuses to schedule a post that has no date on it", async () => {
    const created = await createBlogAction(blogForm({ slug: `unscheduled-${suffix}` }));
    assert.ok(created.ok);

    const result = await setBlogStatusAction(created.data.id, "scheduled");

    assert.equal(result.ok, false, "a scheduled post with no date is one the cron never picks up");
    const post = await Blog.findById(created.data.id).exec();
    assert.equal(post?.status, "draft");
  });

  it("clears the scheduled date when a post moves out of scheduled", async () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
    const created = await createBlogAction(
      blogForm({ slug: `rescheduled-${suffix}`, status: "scheduled", scheduledFor: future }),
    );
    assert.ok(created.ok, created.ok ? "" : created.message);
    assert.ok((await Blog.findById(created.data.id).exec())?.scheduledFor);

    await setBlogStatusAction(created.data.id, "draft");

    const post = await Blog.findById(created.data.id).exec();
    assert.equal(
      post?.scheduledFor,
      undefined,
      "a post moved back to draft must not republish itself on the next cron run",
    );
  });

  it("duplicates a post as a draft on a new slug", async () => {
    const created = await createBlogAction(blogForm({ slug: `original-${suffix}` }));
    assert.ok(created.ok);
    await setBlogStatusAction(created.data.id, "published");

    const copy = await duplicateBlogAction(created.data.id);
    assert.ok(copy.ok, copy.ok ? "" : copy.message);

    const duplicate = await Blog.findById(copy.data.id).exec();
    assert.ok(duplicate);
    assert.notEqual(duplicate.slug, `original-${suffix}`);
    assert.equal(duplicate.status, "draft", "a copy is never published by the act of copying");
  });

  it("deletes a post and invalidates its page", async () => {
    const slug = `deleted-${suffix}`;
    const created = await createBlogAction(blogForm({ slug }));
    assert.ok(created.ok);

    revalidated.length = 0;
    const result = await deleteBlogAction(created.data.id);

    assert.ok(result.ok, result.ok ? "" : result.message);
    assert.equal(await Blog.countDocuments({ _id: created.data.id }).exec(), 0);
    assert.ok(revalidated.includes(itemTag(CACHE_TAGS.blog, slug)));
  });
});

// --- The enquiry flows ---------------------------------------------------------

describe("the enquiry flows", () => {
  it("writes an Event Space enquiry and sends both emails", async () => {
    const email = enquiryEmail("venue");
    const preferredDate = futureDay(30);

    const state = await eventSpaceEnquiryAction(
      { status: "idle" },
      publicForm({
        name: "Ada Okonkwo",
        email,
        phone: "08137192766",
        eventType: "Conference",
        preferredDate,
        expectedAttendees: "45",
        message: "We need the room for a one day conference, with the chairs in rows.",
        source: "event-space",
      }),
    );

    assert.equal(state.status, "success", state.message);

    const enquiry = await Enquiry.findOne({ email }).exec();
    assert.ok(enquiry, "the enquiry is in the inbox");
    assert.equal(enquiry.type, "event_space");
    assert.equal(enquiry.status, "new");
    assert.equal(enquiry.details?.expectedAttendees, 45);

    // Midday UTC, so the calendar day survives every offset a reader is in. Midnight would
    // read back as the previous evening in the Americas.
    assert.equal(enquiry.details?.preferredDate?.toISOString(), `${preferredDate}T12:00:00.000Z`);

    assert.deepEqual(mailed.acknowledgement, [email], "the sender is acknowledged");
    assert.deepEqual(mailed.notification, [email], "the office is notified");
  });

  it("writes a contact enquiry and sends both emails", async () => {
    const email = enquiryEmail("contact");

    const state = await contactEnquiryAction(
      { status: "idle" },
      publicForm({
        name: "Chidi Balogun",
        email,
        phone: "08137192766",
        subject: "A quote for a stock system",
        message:
          "We run two shops in Abeokuta and count stock by hand on Sundays. What would it take to replace that.",
        source: "contact",
      }),
    );

    assert.equal(state.status, "success", state.message);

    const enquiry = await Enquiry.findOne({ email }).exec();
    assert.ok(enquiry);
    assert.equal(enquiry.type, "contact");
    assert.equal(enquiry.subject, "A quote for a stock system");
    assert.deepEqual(mailed.acknowledgement, [email]);
    assert.deepEqual(mailed.notification, [email]);
  });

  it("drops a submission that filled the honeypot, and sends nothing", async () => {
    const email = enquiryEmail("honeypot");
    const form = publicForm({
      name: "Bot",
      email,
      phone: "08137192766",
      subject: "Cheap traffic",
      message: "This message is long enough to satisfy the schema on its own merits, easily.",
      source: "contact",
    });
    form.set(HONEYPOT_FIELD, "https://example.invalid");

    const state = await contactEnquiryAction({ status: "idle" }, form);

    assert.equal(state.status, "error");
    assert.equal(await Enquiry.countDocuments({ email }).exec(), 0);
    assert.deepEqual(mailed.notification, [], "no mail is sent for a submission that was dropped");
  });

  it("drops a submission returned faster than a person can type", async () => {
    const email = enquiryEmail("toofast");
    const form = publicForm({
      name: "Bot",
      email,
      phone: "08137192766",
      subject: "Cheap traffic",
      message: "This message is long enough to satisfy the schema on its own merits, easily.",
      source: "contact",
    });
    form.set(FORM_STARTED_FIELD, String(Date.now() - 200));

    const state = await contactEnquiryAction({ status: "idle" }, form);

    assert.equal(state.status, "error");
    assert.equal(await Enquiry.countDocuments({ email }).exec(), 0);
  });

  it("lets a submission through when the timestamp is missing, since that is a browser setting", async () => {
    const email = enquiryEmail("nojs");
    const form = publicForm({
      name: "Ngozi Ade",
      email,
      phone: "08137192766",
      subject: "A website for a clinic",
      message: "We book patients on paper and would like the appointments to be online instead.",
      source: "contact",
    });
    form.delete(FORM_STARTED_FIELD);

    const state = await contactEnquiryAction({ status: "idle" }, form);

    assert.equal(state.status, "success", "a visitor with JavaScript off can still make contact");
    assert.equal(await Enquiry.countDocuments({ email }).exec(), 1);
  });

  /**
   * The attendee count is capped at 500 and not at the room's 60, which is deliberate and is
   * worth a test precisely because it looks like a bug.
   *
   * The room seats 60. An enquiry for 80 is still an enquiry worth having: the answer is what
   * the room can do rather than a form that refuses to send, and the acknowledgement carries
   * the capacity so the sender is told the number before anybody replies. Rejecting at the
   * form would lose the conversation the page exists to start. The 500 is there to catch a
   * typed extra zero, not to enforce the seating.
   */
  it("accepts an enquiry for more people than the room seats, and records the number", async () => {
    const email = enquiryEmail("oversized");

    const state = await eventSpaceEnquiryAction(
      { status: "idle" },
      publicForm({
        name: "Ada Okonkwo",
        email,
        phone: "08137192766",
        eventType: "Conference",
        preferredDate: futureDay(30),
        expectedAttendees: "80",
        message: "We expect about eighty people and wanted to ask what the room can take.",
        source: "event-space",
      }),
    );

    assert.equal(state.status, "success", state.message);

    const enquiry = await Enquiry.findOne({ email }).exec();
    assert.equal(enquiry?.details?.expectedAttendees, 80);
    assert.deepEqual(mailed.acknowledgement, [email], "and is told the capacity in the reply");
  });

  it("rejects an attendee count with an extra zero in it", async () => {
    const email = enquiryEmail("typo");

    const state = await eventSpaceEnquiryAction(
      { status: "idle" },
      publicForm({
        name: "Ada Okonkwo",
        email,
        phone: "08137192766",
        eventType: "Conference",
        preferredDate: futureDay(30),
        expectedAttendees: "4500",
        message: "We would like to bring four thousand five hundred people on that date, please.",
        source: "event-space",
      }),
    );

    assert.equal(state.status, "error");
    assert.ok(state.fieldErrors?.expectedAttendees, "the message names the field that is wrong");
    assert.equal(await Enquiry.countDocuments({ email }).exec(), 0);
  });

  it("rejects a date in the past", async () => {
    const email = enquiryEmail("past");

    const state = await eventSpaceEnquiryAction(
      { status: "idle" },
      publicForm({
        name: "Ada Okonkwo",
        email,
        phone: "08137192766",
        eventType: "Meeting",
        preferredDate: futureDay(-7),
        expectedAttendees: "20",
        message: "We would like the room for a meeting on the date given above, for two hours.",
        source: "event-space",
      }),
    );

    assert.equal(state.status, "error");
    assert.ok(state.fieldErrors?.preferredDate);
    assert.equal(await Enquiry.countDocuments({ email }).exec(), 0);
  });

  it("stops a run of enquiries from one address once the hourly limit is spent", async () => {
    const email = enquiryEmail("flood");
    const send = () =>
      contactEnquiryAction(
        { status: "idle" },
        publicForm({
          name: "Repeat Sender",
          email,
          phone: "08137192766",
          subject: "Following up",
          message: "Sending this again in case the first one did not reach anybody at the office.",
          source: "contact",
        }),
      );

    // The per-email rule is four an hour. The fifth is the one that must be refused.
    const states = [];
    for (let attempt = 0; attempt < 5; attempt += 1) states.push(await send());

    assert.equal(states.at(-1)?.status, "error", "the fifth is refused");
    assert.ok(
      states.slice(0, 4).every((state) => state.status === "success"),
      "the first four are not",
    );
    assert.equal(await Enquiry.countDocuments({ email }).exec(), 4);
  });
});
