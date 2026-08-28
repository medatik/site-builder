import { NextResponse, type NextRequest } from "next/server";

/**
 * Forwards the requested locale (`?lang=`) to the server as a header.
 *
 * A root layout cannot read `searchParams`, so `<html lang>` could only ever be
 * the default locale — meaning crawlers saw Arabic pages as `lang="en"`. Headers
 * ARE readable in a layout, so middleware copies the param across and the layout
 * uses it (see `app/layout.tsx`).
 *
 * The layout only reads this header for multilingual configs, so single-language
 * sites keep their static rendering.
 */
export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  const headers = new Headers(request.headers);
  if (lang) headers.set("x-locale", lang);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip static assets and generated metadata routes — they don't need a locale
  // and matching them would add needless middleware invocations.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon|opengraph-image|robots.txt|sitemap.xml).*)"],
};
