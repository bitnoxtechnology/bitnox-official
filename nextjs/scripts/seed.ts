import { fail, heading, info } from "./bootstrap";

import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";

import mongoose from "mongoose";

import { applyDevelopmentDns } from "@/lib/dns";

import { hashPassword } from "@/lib/auth/password";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";
import { SiteSettings, User } from "@/models";

/**
 * Brings an empty database to the point where somebody can log in.
 *
 * Two things are created: the first super_admin, and the SiteSettings singleton. Nothing else
 * is seeded. Blog posts, portfolio work, testimonials and the Event Space gallery are entered
 * through the admin, so there is no placeholder content to find and delete later.
 *
 *   npm run db:seed -- --email you@bitnoxsolution.com --name "Your Name"
 *
 * The password is read from --password or SEED_ADMIN_PASSWORD. If neither is given, one is
 * generated and printed once. Preferring the generated password avoids putting a real one in
 * shell history and in the process list, where anything on the machine can read it.
 */

function generatePassword(): string {
  return randomBytes(18).toString("base64url");
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      email: { type: "string" },
      password: { type: "string" },
      name: { type: "string" },
    },
    allowPositionals: false,
  });

  const uri = process.env.MONGO_URI;
  if (!uri) fail("MONGO_URI is not set. Copy .env.example to .env and fill it in.");

  const email = (values.email ?? process.env.SEED_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const name = (values.name ?? process.env.SEED_ADMIN_NAME ?? "Bitnox Admin").trim();

  if (!email) {
    fail(
      "No email for the first super_admin. Pass --email you@bitnoxsolution.com or set " +
        "SEED_ADMIN_EMAIL.",
    );
  }

  if (!isEmail(email)) fail(`"${email}" does not look like an email address.`);

  const suppliedPassword = values.password ?? process.env.SEED_ADMIN_PASSWORD;

  if (suppliedPassword && suppliedPassword.length < MIN_PASSWORD_LENGTH) {
    fail(`The password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const password = suppliedPassword ?? generatePassword();
  const generated = suppliedPassword === undefined;

  applyDevelopmentDns();
  await mongoose.connect(uri);

  heading("Seed database");
  info(`Target: ${mongoose.connection.name}`);

  // --- The first super_admin ------------------------------------------------
  // Every other account is created by invitation, where the invitee sets their own password.
  // This one cannot be, since there is nobody to send the invitation.

  const existing = await User.findOne({ email }).select("_id role").lean().exec();

  if (existing) {
    info(`User ${email} already exists. Left untouched.`);
  } else {
    const superAdminCount = await User.countDocuments({ role: "super_admin" }).exec();

    await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "super_admin",
      isActive: true,
    });

    info(`Created super_admin ${email}`);

    if (superAdminCount > 0) {
      info(`Note: ${superAdminCount} super_admin account(s) already existed.`);
    }

    if (generated) {
      heading("Generated password. It is shown once and is not stored anywhere.");
      info(password);
      info("Sign in, then change it from the admin profile.");
    }
  }

  // --- SiteSettings singleton ----------------------------------------------
  // Field defaults carry the confirmed NAP from src/content/business.ts. Opening hours,
  // amenities and availability stay empty until the real values are supplied, because absent
  // structured data costs less than wrong structured data.

  const settings = await SiteSettings.findOne({ key: "site" }).exec();

  if (settings) {
    info("SiteSettings already present. Left untouched.");
  } else {
    await SiteSettings.create({ key: "site" });
    info("Created the SiteSettings singleton.");
  }

  await mongoose.disconnect();

  heading("Done.");
  info("Start the app with `npm run dev` and sign in at /admin/login.\n");
}

main().catch(async (error: unknown) => {
  await mongoose.disconnect().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
