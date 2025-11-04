import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export default function middleware(request) {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === "/" || path === "/login";
  const isDeliveryPath = path.startsWith("/delievery");

  const adminToken = cookies().get("adminToken")?.value;
  const deliveryToken = cookies().get("deliveryToken")?.value;

  // --- Admin Middleware ---
  if (!isDeliveryPath) {
    // If it's a public path and admin is logged in -> dashboard
    if (isPublicPath && adminToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If it's a protected path and admin not logged in -> login
    if (!isPublicPath && !adminToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // --- Delivery Middleware ---
  if (isDeliveryPath) {
    // If not logged in and trying to access delivery routes -> login
    if (!deliveryToken && path !== "/delievery") {
      return NextResponse.redirect(new URL("/delievery", request.url));
    }

    // If logged in and on login page -> go to delivery orders
    if (deliveryToken && path === "/delievery") {
      return NextResponse.redirect(new URL("/delievery/orders", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/delievery",
    "/delievery/orders/:path*",
  ],
};
