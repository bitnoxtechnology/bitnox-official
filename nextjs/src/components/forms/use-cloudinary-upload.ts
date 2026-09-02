"use client";

import { useCallback, useState } from "react";

import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, type UploadFolder } from "@/lib/constants";

/**
 * The browser half of a signed upload.
 *
 * Two requests. The first asks this server for a signature, which is the step that proves
 * the person is signed in and pins the upload to one folder and one preset. The second posts
 * the file straight to Cloudinary with that signature attached, so a twelve-megabyte
 * photograph never travels through a serverless function with a body size limit and a
 * timeout.
 *
 * `XMLHttpRequest` rather than `fetch`, only because it reports upload progress. A gallery
 * of Event Space photographs on a Nigerian mobile connection is a long silence otherwise,
 * and a progress bar is the difference between waiting and pressing the button again.
 */

export interface UploadedAsset {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

interface CloudinaryResponse {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  error?: { message?: string };
}

const accepted: readonly string[] = ACCEPTED_IMAGE_TYPES;

export function describeAcceptedTypes(): string {
  return "JPEG, PNG, WebP or AVIF, up to 10MB";
}

/** Checked here as well as at Cloudinary, so an obvious mistake fails before the upload. */
function localRejection(file: File): string | null {
  if (!accepted.includes(file.type))
    return `That file type is not accepted. Use ${describeAcceptedTypes()}.`;
  if (file.size > MAX_UPLOAD_BYTES) return "That image is over 10MB. Use a smaller file.";
  return null;
}

export function useCloudinaryUpload(folder: UploadFolder) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<UploadedAsset | null> => {
      const rejection = localRejection(file);

      if (rejection) {
        setError(rejection);
        return null;
      }

      setError(null);
      setProgress(0);

      try {
        const signatureResponse = await fetch("/api/uploads/sign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ folder }),
        });

        if (!signatureResponse.ok) {
          const body = (await signatureResponse.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? "Could not start the upload.");
        }

        const signature = (await signatureResponse.json()) as {
          signature: string;
          timestamp: number;
          apiKey: string;
          folder: string;
          uploadPreset: string;
          endpoint: string;
        };

        const asset = await postToCloudinary(file, signature, setProgress);
        setProgress(null);
        return asset;
      } catch (cause: unknown) {
        setProgress(null);
        setError(cause instanceof Error ? cause.message : "That upload did not finish.");
        return null;
      }
    },
    [folder],
  );

  return { upload, progress, error, clearError: () => setError(null) };
}

function postToCloudinary(
  file: File,
  signature: {
    signature: string;
    timestamp: number;
    apiKey: string;
    folder: string;
    uploadPreset: string;
    endpoint: string;
  },
  onProgress: (value: number) => void,
): Promise<UploadedAsset> {
  // The parameter names are Cloudinary's, and every one of them except `file` and `api_key`
  // has to match what the server signed, or the upload is refused.
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", signature.apiKey);
  body.append("timestamp", String(signature.timestamp));
  body.append("signature", signature.signature);
  body.append("folder", signature.folder);
  body.append("upload_preset", signature.uploadPreset);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", signature.endpoint);

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    });

    request.addEventListener("load", () => {
      let parsed: CloudinaryResponse | null = null;

      try {
        parsed = JSON.parse(request.responseText) as CloudinaryResponse;
      } catch {
        reject(new Error("Cloudinary sent back something unreadable."));
        return;
      }

      if (request.status >= 400 || !parsed.secure_url || !parsed.public_id) {
        reject(new Error(parsed.error?.message ?? "Cloudinary refused that upload."));
        return;
      }

      resolve({
        url: parsed.secure_url,
        publicId: parsed.public_id,
        width: parsed.width,
        height: parsed.height,
      });
    });

    request.addEventListener("error", () =>
      reject(new Error("The upload failed. Check the connection and try again.")),
    );
    request.addEventListener("abort", () => reject(new Error("The upload was cancelled.")));

    request.send(body);
  });
}
