import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const DEMO_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO === "true";

export function middleware(request: NextRequest) {
	if (DEMO_ENABLED) return NextResponse.next();

	const { pathname } = request.nextUrl;

	if (pathname === "/demo" || pathname.startsWith("/docs/")) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/demo", "/docs/:path*"],
};
