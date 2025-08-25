import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect unauthenticated users trying to access dashboard
    if (!token && pathname.startsWith("/dashboard")) {
      const url = new URL("/login", req.url);
      return NextResponse.redirect(url);
    }

    // Role-based access control
    if (token) {
      // Farmer-only routes
      if (pathname.startsWith("/sell") && token.role !== "FARMER") {
        const url = new URL("/dashboard", req.url);
        return NextResponse.redirect(url);
      }

      // Equipment management (Farmer only)
      if (pathname.startsWith("/equipment/") && pathname.includes("/edit") && token.role !== "FARMER") {
        const url = new URL("/dashboard", req.url);
        return NextResponse.redirect(url);
      }

      // Cart and checkout require authentication (any role)
      if ((pathname.startsWith("/cart") || pathname.startsWith("/checkout")) && !token) {
        const url = new URL("/login", req.url);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes
        if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
          return true;
        }

        // Equipment listing is public
        if (pathname.startsWith("/equipment") && !pathname.includes("/edit")) {
          return true;
        }

        // Marketplace is public
        if (pathname.startsWith("/marketplace")) {
          return true;
        }

        // Require authentication for other routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sell/:path*",
    "/equipment/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/inquiries/:path*",
    "/marketplace/:path*"
  ],
};
