// src/lib/auth.ts
// Helper functions สำหรับใช้ใน Server Components และ API Routes

import { cookies } from "next/headers"
import { verifyToken, JWTPayload } from "./jwt"

/**
 * ดึงข้อมูล User ปัจจุบันจาก Cookie (ใช้ใน Server Components)
 * @returns JWTPayload | null
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  return await verifyToken(token)
}

/**
 * ดึง User จาก Request Header (ใช้ใน API Routes ที่ผ่าน middleware แล้ว)
 * Middleware จะ inject x-user-id, x-user-role, x-username ไว้แล้ว
 */
export function getUserFromHeaders(headers: Headers): JWTPayload | null {
  const userId = headers.get("x-user-id")
  const role = headers.get("x-user-role")
  const username = headers.get("x-username")

  if (!userId || !role || !username) return null

  return {
    userId: parseInt(userId),
    role: role as JWTPayload["role"],
    username,
  }
}

/**
 * ตรวจสอบว่า User มี Role ที่กำหนดหรือไม่
 */
export function hasRole(
  user: JWTPayload | null,
  ...roles: ("ADMIN" | "COACH" | "STUDENT")[]
): boolean {
  if (!user) return false
  return roles.includes(user.role)
}

/**
 * Helper สำหรับ API Route — return 401 ถ้าไม่ได้ Login
 */
export function requireAuth(headers: Headers) {
  const user = getUserFromHeaders(headers)
  if (!user) {
    return {
      user: null,
      error: Response.json(
        { success: false, error: "ยังไม่ได้เข้าสู่ระบบ" },
        { status: 401 }
      ),
    }
  }
  return { user, error: null }
}

/**
 * Helper สำหรับ API Route — return 403 ถ้า Role ไม่มีสิทธิ์
 */
export function requireRole(
  headers: Headers,
  ...roles: ("ADMIN" | "COACH" | "STUDENT")[]
) {
  const { user, error } = requireAuth(headers)
  if (error || !user) return { user: null, error }

  if (!hasRole(user, ...roles)) {
    return {
      user: null,
      error: Response.json(
        { success: false, error: "ไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      ),
    }
  }

  return { user, error: null }
}
