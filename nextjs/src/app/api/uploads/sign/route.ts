import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/guards";
import { canSignUploads, createUploadSignature, isUploadFolder } from "@/lib/cloudinary";

/**
 * The one endpoint that has to be HTTP rather than a server action.
 *
 * Mutations on this site are server actions. This is not a mutation: the browser needs a
 * short-lived credential it can attach to a multipart POST aimed at Cloudinary, and a server
 * action cannot hand a value to a `fetch` the way a route handler can.
 *
 * It is guarded like everything else. `requireUser()` runs before a signature is produced,
 * so an anonymous caller cannot mint upload credentials for the account. `proxy.ts` does not
 * cover `/api`, which makes the guard here the only thing standing in the way rather than
 * the second line of defence.
 */

export async function POST(request: Request): Promise<NextResponse> {
  await requireUser();

  if (!canSignUploads()) {
    // A missing secret is a setup problem, not a caller problem, so it is a 503 with a
    // message that names the variable rather than a 500 with a stack trace.
    return NextResponse.json(
      { error: "Uploads are not configured. CLOUDINARY_API_SECRET is missing." },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }

  const folder = (body as { folder?: unknown } | null)?.folder;

  if (!isUploadFolder(folder)) {
    return NextResponse.json({ error: "Unknown upload folder." }, { status: 400 });
  }

  return NextResponse.json(createUploadSignature(folder), {
    // Signatures are timestamped and single-purpose. Nothing between here and the browser
    // should keep one.
    headers: { "cache-control": "no-store" },
  });
}
