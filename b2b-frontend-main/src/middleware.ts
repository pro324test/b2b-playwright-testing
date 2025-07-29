import { NextRequest, NextResponse } from "next/server";

const defaultLocale = "en";
const locales = [defaultLocale, "ar"];

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
  // Redirect if there is no locale

  if (pathname.slice(1, 4) === "api" || pathname.startsWith("/assets")) {
    return NextResponse.next();
  }
  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;
    // e.g. incoming request is /listings
    // The new URL is now /en-US/listings
    // const hittingTheHomePage = pathname === "/" || pathname.startsWith("/");
    // if (hittingTheHomePage) {
    //   return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    // }
    return NextResponse.redirect(
      new URL(`/${locale}/${pathname}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!_next).*)",
    // Optional: only run on root (/) URL
    // '/'
  ],
};
