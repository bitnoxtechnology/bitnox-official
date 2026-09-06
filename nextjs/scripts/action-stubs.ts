import "dotenv/config";

/**
 * The seams `scripts/test-actions.ts` calls the server actions through.
 *
 * This is a separate module because of how ES imports are ordered. Every `import` in a file
 * is hoisted above its statements, so stubbing from inside the test file would run the stub
 * calls *after* the actions had already been imported and had already pulled the real
 * `next/cache` in behind them. Imports of different modules do run in source order, so a
 * file that imports this one first, and the actions second, gets the stubs installed before
 * anything can reach past them. Keeping the calls here rather than in the test is what makes
 * that ordering explicit instead of accidental.
 *
 * Six modules are replaced, and the reasons divide in two.
 *
 * `next/cache`, `next/navigation` and `next/headers` only work inside a request that Next.js
 * is rendering. Outside one they throw before an assertion can be reached, so a test would
 * report the harness rather than the action. Replacing them turns each into something the
 * tests can assert on: which tags were invalidated, where an action redirected to, what IP
 * the rate limiter saw.
 *
 * The guards and the mail module are replaced by choice. The guards, so a test can decide who
 * is signed in, which is the whole point of the guard tests. The mail module, because a suite
 * that sends real email is a suite nobody runs twice.
 *
 * Nothing below the actions is replaced. The Zod schemas, the Mongoose models, the database
 * and the rate limiter are all real, because a stub for any of those would be a test of the
 * stub.
 */

function stubModule(specifier: string, exports: Record<string, unknown>): void {
  const resolved = require.resolve(specifier);

  // Seeding `require.cache` rather than assigning to the imported namespace: a namespace
  // object's properties are getters and are neither writable nor configurable, so the obvious
  // `module.thing = fake` fails at runtime with a message about a getter. This works because
  // tsx compiles to CommonJS.
  require.cache[resolved] = {
    id: resolved,
    filename: resolved,
    loaded: true,
    exports,
    children: [],
    paths: [],
  } as unknown as NodeJS.Module;
}

/** Where an action redirected to, carried on the error the stubbed `redirect` throws. */
export class RedirectError extends Error {
  constructor(readonly to: string) {
    super(`redirect(${to})`);
    this.name = "RedirectError";
  }
}

/** Every tag an action asked to invalidate, in order. Cleared between tests. */
export const revalidated: string[] = [];

/** The addresses each stubbed mail helper was called with. Cleared between tests. */
export const mailed = { acknowledgement: [] as string[], notification: [] as string[] };

export type TestUser = { id: string; role: "admin" | "super_admin" };

/**
 * Who is signed in, and the request the actions think they are serving.
 *
 * Mutable module state rather than parameters, because the actions read these through
 * imports and there is nowhere to pass an argument. `signedInAs = null` makes the guards
 * redirect exactly as the real ones do when a session is missing, revoked, or belongs to a
 * deactivated account; those three are indistinguishable to an action, and the difference
 * between them is covered in `test-auth.ts` where it exists.
 */
export const request: { signedInAs: TestUser | null; ip: string } = {
  signedInAs: null,
  ip: "203.0.113.1",
};

export function resetStubs(): void {
  revalidated.length = 0;
  mailed.acknowledgement.length = 0;
  mailed.notification.length = 0;
  request.signedInAs = null;
  request.ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
}

// The published `server-only` package throws unless it is resolved under the `react-server`
// export condition, which nothing outside a Next.js build sets. It is a build-time marker
// with no runtime behaviour to preserve, so an empty object is the whole of it.
stubModule("server-only", {});

stubModule("next/cache", {
  revalidateTag: (tag: string) => {
    revalidated.push(tag);
  },
  revalidatePath: () => {},
});

stubModule("next/navigation", {
  redirect: (to: string) => {
    throw new RedirectError(to);
  },
  notFound: () => {
    throw new RedirectError("/404");
  },
});

stubModule("next/headers", {
  headers: async () => new Headers({ "x-forwarded-for": request.ip, "user-agent": "test-suite" }),
  cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }),
});

stubModule("@/lib/auth/guards", {
  getCurrentUser: async () => request.signedInAs,
  requireUser: async () => {
    if (!request.signedInAs) throw new RedirectError("/admin/login");
    return request.signedInAs;
  },
  requireSuperAdmin: async () => {
    if (!request.signedInAs) throw new RedirectError("/admin/login");
    if (request.signedInAs.role !== "super_admin") {
      throw new RedirectError("/admin?denied=super_admin");
    }
    return request.signedInAs;
  },
  isSuperAdmin: (user: { role: string }) => user.role === "super_admin",
});

stubModule("@/lib/mail/site-mail", {
  sendContactAcknowledgement: async ({ to }: { to: string }) => {
    mailed.acknowledgement.push(to);
    return { ok: true };
  },
  sendEventSpaceAcknowledgement: async ({ to }: { to: string }) => {
    mailed.acknowledgement.push(to);
    return { ok: true };
  },
  sendEnquiryNotification: async ({ email }: { email: string }) => {
    mailed.notification.push(email);
    return { ok: true };
  },
  sendNewsletterWelcome: async ({ to }: { to: string }) => {
    mailed.acknowledgement.push(to);
    return { ok: true };
  },
});
