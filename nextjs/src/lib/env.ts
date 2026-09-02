import { z } from "zod";

/**
 * Typed, validated environment.
 *
 * Two schemas, because the two halves of the environment are available in different places.
 * Server variables exist only in the Node process. Public variables are inlined into the
 * browser bundle at build time, which is why every `NEXT_PUBLIC_` read below is written as a
 * full literal `process.env.NEXT_PUBLIC_X` rather than a dynamic lookup. Next.js performs a
 * textual substitution, so `process.env[key]` would come back undefined in the browser.
 */

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

/**
 * Required in production, optional elsewhere.
 *
 * For credentials that are outstanding inputs rather than setup mistakes. A missing
 * Cloudinary secret should stop a deployment, but it should not stop a developer from
 * running the site, which has nothing to do with uploads on most pages.
 */
const productionOnly = (name: string) =>
  optionalString.refine(
    (value) => process.env.NODE_ENV !== "production" || (value !== undefined && value.length > 0),
    `${name} is required in production`,
  );

/** Overridable with MAIL_FROM once a sending domain is verified. */
const DEFAULT_MAIL_FROM = "Bitnox Technology Solutions <no-reply@bitnoxsolution.com>";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  MONGO_URI: z
    .string()
    .min(1, "MONGO_URI is required")
    .refine(
      (value) => value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
      "MONGO_URI must be a mongodb:// or mongodb+srv:// connection string",
    ),

  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),

  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  // The From address on every transactional email. Its domain must be verified in Resend,
  // so it is configurable rather than hard-coded against one that may not be.
  MAIL_FROM: optionalString.transform((value) => value ?? DEFAULT_MAIL_FROM),

  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  // Still an outstanding Phase 0 input. Upload signing checks for it at its own call site.
  CLOUDINARY_API_SECRET: productionOnly("CLOUDINARY_API_SECRET"),
  CLOUDINARY_UPLOAD_PRESET: z.string().min(1, "CLOUDINARY_UPLOAD_PRESET is required"),

  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters"),

  // Supplied before launch, absent in development.
  GOOGLE_SITE_VERIFICATION: optionalString,
});

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .url("NEXT_PUBLIC_SITE_URL must be an absolute URL")
    .refine((value) => !value.endsWith("/"), "NEXT_PUBLIC_SITE_URL must not end in a slash"),

  NEXT_PUBLIC_EDU_URL: z.url("NEXT_PUBLIC_EDU_URL must be an absolute URL"),
  NEXT_PUBLIC_CLEANING_URL: z.url("NEXT_PUBLIC_CLEANING_URL must be an absolute URL"),

  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z
    .string()
    .min(1, "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required"),

  // Supplied before launch, absent in development.
  NEXT_PUBLIC_GTM_ID: optionalString.refine(
    (value) => value === undefined || /^GTM-[A-Z0-9]+$/.test(value),
    "NEXT_PUBLIC_GTM_ID must look like GTM-XXXXXXX",
  ),
});

function parseOrExit<T extends z.ZodType>(schema: T, source: unknown, label: string): z.infer<T> {
  const result = schema.safeParse(source);

  if (!result.success) {
    const lines = result.error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`);
    throw new Error(
      `Invalid ${label} environment. Check nextjs/.env against .env.example.\n${lines.join("\n")}`,
    );
  }

  return result.data;
}

const clientEnvSource = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_EDU_URL: process.env.NEXT_PUBLIC_EDU_URL,
  NEXT_PUBLIC_CLEANING_URL: process.env.NEXT_PUBLIC_CLEANING_URL,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
};

/** Safe to read from any component, server or client. */
export const clientEnv = parseOrExit(clientSchema, clientEnvSource, "public");

/**
 * Server-only. Reading this from a client component throws, rather than silently handing
 * back undefined and shipping a broken build.
 */
export const serverEnv = new Proxy({} as z.infer<typeof serverSchema>, {
  get(_target, key: string) {
    if (typeof window !== "undefined") {
      throw new Error(
        `serverEnv.${key} was read in the browser. Server variables stay on the server.`,
      );
    }
    return parsedServerEnv()[key as keyof z.infer<typeof serverSchema>];
  },
});

let serverEnvCache: z.infer<typeof serverSchema> | undefined;

function parsedServerEnv() {
  serverEnvCache ??= parseOrExit(serverSchema, process.env, "server");
  return serverEnvCache;
}

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;
