import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const { data: sessionData } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                //get the cookie from the request
                cookie: request.headers.get("cookie") || "",
            },
        },
    );

    const isAdminRoute = ["/dashboard", "/qr", "/employees", "/reports"].some(route => request.nextUrl.pathname.startsWith(route));
    const isEmployeeRoute = ["/scan", "/history", "/profile"].some(route => request.nextUrl.pathname.startsWith(route));
    const isAuthRoute = ["/login"].some(route => request.nextUrl.pathname.startsWith(route));

    const session = sessionData as unknown as { user: { role: string; id: string; email: string } } | null;

    if (!session || !session.user) {
        if (isAdminRoute || isEmployeeRoute) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    // user is logged in
    if (isAuthRoute) {
        if (session.user.role === "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/scan", request.url));
    }

    if (isAdminRoute && session.user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/scan", request.url));
    }

    if (isEmployeeRoute && session.user.role === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/qr/:path*", "/employees/:path*", "/reports/:path*", "/scan/:path*", "/history/:path*", "/profile/:path*", "/login"],
};
