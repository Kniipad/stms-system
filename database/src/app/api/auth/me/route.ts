// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
import prisma from "@/lib/prisma"

/** GET /api/auth/me — ดึงข้อมูล User ปัจจุบันจาก JWT Cookie */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: "ยังไม่ได้เข้าสู่ระบบ" },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Token ไม่ถูกต้องหรือหมดอายุ" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findFirst({
      where: { id: payload.userId, deletedAt: null },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "ไม่พบ User" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("[Me] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

/** DELETE /api/auth/me — Logout (ลบ Cookie) */
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" })
  response.cookies.delete("token")
  return response
}
