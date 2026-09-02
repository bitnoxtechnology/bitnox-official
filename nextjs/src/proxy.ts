import { NextResponse, type NextRequest } from "next/server";

import { isPublicAdminPath, LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth/config";
import { unsignValue } from "@/lib/auth/crypto";

/**
 * Route protection for `/admin/*`. Next 16's renamed middleware.
 *
 * This is defence in depth and not the authorisation boundary. All it can tell is whether a
 * correctly signed session cookie is present. It does not read the database, so it cannot
 * know that the session was revoked, that it expired, or that the account was deactivated,
 * and it knows nothing at all about roles. `requireUser()` and `requireSuperAdmin()` do that
 * work, inside the pages and every server action.
 *
 * What it does earn is the redirect: an unauthenticated visitor lands on the sign-in page
 * instead of loading an admin shell that then bounces them.
 *
 * Note what it deliberately does not do. A signed-in visitor on the sign-in page is not
 * redirected away from here, because a cookie with a good signature can still belong to a
 * revoked session, and sending it to a page that would send it straight back is how you build
 * a redirect loop. The sign-in page makes that call itself, where the database is reachable.
 */
export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  if (isPublicAdminPath(pathname)) return NextResponse.next();

  const sessionId = await unsignValue(request.cookies.get(SESSION_COOKIE)?.value);

  if (!sessionId) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  // Belt and braces with the layout's robots metadata. A header covers the responses that
  // never render a document, such as a server action POST.
  response.headers.set("x-robots-tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
