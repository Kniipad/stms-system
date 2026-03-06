// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { signToken } from "@/lib/jwt"
import { createLog } from "@/lib/auditLog"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body

    // ── Validation ──────────────────────────────────────────
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "กรุณากรอก username และ password" },
        { status: 400 }
      )
    }

    // ── Find User ────────────────────────────────────────────
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }], // รองรับทั้ง username และ email
        deletedAt: null,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Username หรือ Password ไม่ถูกต้อง" },
        { status: 401 }
      )
    }

    // ── Verify Password ──────────────────────────────────────
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Username หรือ Password ไม่ถูกต้อง" },
        { status: 401 }
      )
    }

    // ── Sign JWT ─────────────────────────────────────────────
    const token = await signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    })

    // ── Audit Log ────────────────────────────────────────────
    await createLog({
      action: "update",
      collection: "users",
      documentId: user.id,
      changedBy: user.id,
      changedByRole: user.role,
      description: `User logged in: ${user.username} (${user.role})`,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    })

    // ── Set HttpOnly Cookie + Return ─────────────────────────
    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[Login] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
