import { fail, heading, info } from "./bootstrap";

import mongoose from "mongoose";

import { applyDevelopmentDns } from "@/lib/dns";

import { LAUNCH_POSTS } from "@/content/launch-posts";
import { blocksToHtml, blocksToTiptap } from "@/lib/blog/blocks";
import { Blog, User } from "@/models";

/**
 * Writes the launch posts into an empty blog.
 *
 * Separate from `db:seed` on purpose. That script brings a database to the point where
 * somebody can sign in and creates nothing else, so that there is no placeholder content to
 * find and delete later. These three posts are not placeholders: they are finished writing,
 * they are what stops the blog shipping empty, and three of the four service pages draw their
 * reading lists from their tags. Keeping them in their own command means a database can be
 * seeded without them if that is ever wanted.
 *
 *   npm run db:seed:blog
 *   npm run db:seed:blog -- --author you@bitnoxsolution.com
 *
 * A post whose slug already exists is left exactly as it is. Reseeding after an edit in the
 * admin must not overwrite the edit, and reseeding after a deliberate deletion must not
 * silently bring the post back, so a second run reports what it skipped and changes nothing.
 *
 * The author is a real user, because `Blog.author` is a required reference and the byline on
 * a published post should be a person. Without `--author` the oldest super_admin is used,
 * which on a freshly seeded database is the account `db:seed` created.
 */

async function main(): Promise<void> {
  const authorEmail = readOption("--author")?.trim().toLowerCase();

  const uri = process.env.MONGO_URI;
  if (!uri) fail("MONGO_URI is not set. Copy .env.example to .env and fill it in.");

  applyDevelopmentDns();
  await mongoose.connect(uri);

  heading("Seed launch posts");
  info(`Target: ${mongoose.connection.name}`);

  const author = authorEmail
    ? await User.findOne({ email: authorEmail }).select("_id name").lean().exec()
    : await User.findOne({ role: "super_admin" })
        .sort({ createdAt: 1 })
        .select("_id name")
        .lean()
        .exec();

  if (!author) {
    fail(
      authorEmail
        ? `No user with the email ${authorEmail}. Check the address, or run npm run db:seed first.`
        : "No super_admin account exists yet. Run npm run db:seed first, then this.",
    );
  }

  info(`Author: ${author.name}`);

  let created = 0;
  let skipped = 0;

  for (const post of LAUNCH_POSTS) {
    const existing = await Blog.findOne({ slug: post.slug }).select("_id").lean().exec();

    if (existing) {
      info(`Skipped ${post.slug}, already present.`);
      skipped += 1;
      continue;
    }

    await Blog.create({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      // Both halves, from one source. `contentJson` is what the editor opens, `contentHtml`
      // is what the public page renders, and they are generated from the same blocks so they
      // cannot describe different articles.
      contentJson: blocksToTiptap(post.blocks),
      contentHtml: blocksToHtml(post.blocks),
      status: "published",
      publishedAt: new Date(),
      tags: post.tags,
      category: post.category,
      author: author._id,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
    });

    info(`Created ${post.slug}`);
    created += 1;
  }

  heading(`Done. ${created} created, ${skipped} left untouched.`);

  // Nothing calls `revalidateTag` here. This runs outside the Next.js server, which is where
  // the cache lives, so a running instance picks the posts up on its next build or when the
  // admin next publishes. On a fresh database that is the deployment itself.
  if (created > 0) {
    info("Rebuild or redeploy the site so the blog index picks them up.");
  }

  await mongoose.disconnect();
}

/** `--author value`, without pulling in an argument parser for one flag. */
function readOption(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
