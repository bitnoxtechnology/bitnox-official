import "server-only";

import { createHash } from "node:crypto";

import { UPLOAD_FOLDERS, type UploadFolder } from "@/lib/constants";
import { clientEnv, serverEnv } from "@/lib/env";

/**
 * Signed uploads.
 *
 * The legacy client held an unsigned upload preset in its bundle, which is a public write
 * endpoint: anybody who viewed source could upload anything into the account, and there was
 * no way to say who had. The signature below fixes that. The browser still posts the file
 * directly to Cloudinary, so a large image never passes through this server, but it cannot
 * post anything the server has not first agreed to by signing the parameters.
 *
 * The secret exists only here. It is a server variable with no `NEXT_PUBLIC_` prefix, and
 * this module carries `server-only`, so importing it from a client component fails the build
 * rather than shipping the secret.
 */

/**
 * Where uploads land.
 *
 * An allowlist rather than a folder name from the request, because the folder is the one
 * upload parameter a caller would otherwise choose freely, and a signature over an arbitrary
 * path is a signature over writing anywhere in the account.
 *
 * The keys live in `src/lib/constants.ts` so the upload component can name one without
 * importing this module, which holds the secret.
 */
export const UPLOAD_FOLDER_PATHS: Record<UploadFolder, string> = {
  blog: "bitnox/blog",
  portfolio: "bitnox/portfolio",
  "event-space": "bitnox/event-space",
  testimonials: "bitnox/testimonials",
  site: "bitnox/site",
};

export function isUploadFolder(value: unknown): value is UploadFolder {
  return typeof value === "string" && UPLOAD_FOLDERS.includes(value as UploadFolder);
}

/** The secret is a Phase 0 input, absent in development until it is supplied. */
export function canSignUploads(): boolean {
  return Boolean(serverEnv.CLOUDINARY_API_SECRET);
}

export interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadPreset: string;
  /** Where the browser posts the file. Built here so the client has one thing to fetch. */
  endpoint: string;
}

/**
 * Cloudinary's scheme: every parameter except the file and the API key, sorted by name,
 * joined as `key=value` pairs with `&`, with the API secret appended and the whole thing
 * hashed with SHA-1. The upload is rejected unless the parameters posted match the ones
 * that were signed, which is what pins the upload to this folder and this preset.
 */
export function signUploadParams(params: Record<string, string | number>): string {
  const canonical = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(`${canonical}${serverEnv.CLOUDINARY_API_SECRET ?? ""}`)
    .digest("hex");
}

export function createUploadSignature(folder: UploadFolder): UploadSignature {
  const cloudName = clientEnv.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const resolvedFolder = UPLOAD_FOLDER_PATHS[folder];
  const uploadPreset = serverEnv.CLOUDINARY_UPLOAD_PRESET;

  // Seconds, not milliseconds. Cloudinary rejects a timestamp more than an hour from its own
  // clock, which is also what stops a signature being replayed a week later.
  const timestamp = Math.floor(Date.now() / 1000);

  const signature = signUploadParams({
    folder: resolvedFolder,
    timestamp,
    upload_preset: uploadPreset,
  });

  return {
    signature,
    timestamp,
    apiKey: serverEnv.CLOUDINARY_API_KEY,
    cloudName,
    folder: resolvedFolder,
    uploadPreset,
    endpoint: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}
