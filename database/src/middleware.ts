// middleware.ts  (วางไว้ที่ root ของโปรเจค เช่น src/middleware.ts)
// Role-Based Access Control — ตรวจสอบสิทธิ์ทุก Request ก่อนเข้าหน้า

import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"

// ── Route Permission Map ─────────────────────────────────────
// กำหนดว่า path ไหน Role ไหนถึงเข้าได้
const ROUTE_PERMISSIONS: Record<string, ("ADMIN" | "COACH" | "STUDENT")[]> = {
  "/admin": ["ADMIN"],
  "/admin/users": ["ADMIN"],
  "/admin/courses": ["ADMIN"],
  "/admin/payments": ["ADMIN"],
  "/admin/reports": ["ADMIN"],

  "/coach": ["ADMIN", "COACH"],
  "/coach/attendance": ["ADMIN", "COACH"],
  "/coach/schedule": ["ADMIN", "COACH"],
  "/coach/summary": ["ADMIN", "COACH"],

  "/student": ["ADMIN", "STUDENT"],
  "/student/courses": ["ADMIN", "STUDENT"],
  "/student/payments": ["ADMIN", "STUDENT"],

  // API routes
  "/api/admin": ["ADMIN"],
  "/api/coach": ["ADMIN", "COACH"],
  "/api/student": ["ADMIN", "STUDENT"],
}

// ── Public Paths — ไม่ต้อง Auth ─────────────────────────────
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // อนุญาต public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "?"))) {
    return NextResponse.next()
  }

  // อนุญาต static files และ Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // ── ตรวจสอบ Token ─────────────────────────────────────────
  const token = req.cookies.get("token")?.value
  if (!token) {
    return redirectToLogin(req)
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return redirectToLogin(req)
  }

  // ── ตรวจสอบ Role Permission ────────────────────────────────
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find((route) =>
    pathname.startsWith(route)
  )

  if (matchedRoute) {
    const allowed = ROUTE_PERMISSIONS[matchedRoute]
    if (!allowed.includes(payload.role)) {
      // ถ้าเป็น API ส่ง 403
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "ไม่มีสิทธิ์เข้าถึง" },
          { status: 403 }
        )
      }
      // ถ้าเป็นหน้าเว็บ redirect ไปหน้า dashboard ของตัวเอง
      return NextResponse.redirect(new URL(getDashboardPath(payload.role), req.url))
    }
  }

  // ── แนบ User Info ใน Header (ให้ API อ่านได้โดยไม่ต้อง verify ซ้ำ) ──
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-user-id", String(payload.userId))
  requestHeaders.set("x-user-role", payload.role)
  requestHeaders.set("x-username", payload.username)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

// ── Helper Functions ─────────────────────────────────────────

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url)
  loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

function getDashboardPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "COACH":
      return "/coach"
    case "STUDENT":
    default:
      return "/student"
  }
}

// ── Matcher Config ───────────────────────────────────────────
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
