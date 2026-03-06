// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { createLog } from "@/lib/auditLog"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, email, password, firstName, lastName, phone, role } = body

    // ── Validation ──────────────────────────────────────────
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "username, email และ password จำเป็นต้องกรอก" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password ต้องมีอย่างน้อย 8 ตัวอักษร" },
        { status: 400 }
      )
    }

    // ห้าม register เป็น ADMIN ผ่าน Public API
    const allowedRoles = ["STUDENT", "COACH"]
    const userRole = role && allowedRoles.includes(role) ? role : "STUDENT"

    // ── Check Duplicate ──────────────────────────────────────
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
        deletedAt: null,
      },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error:
            existing.username === username
              ? "Username นี้ถูกใช้แล้ว"
              : "Email นี้ถูกใช้แล้ว",
        },
        { status: 409 }
      )
    }

    // ── Hash Password ────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12)

    // ── Create User ──────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: userRole as "STUDENT" | "COACH",
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        phone: phone ?? null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    })

    // ── Audit Log ────────────────────────────────────────────
    await createLog({
      action: "create",
      collection: "users",
      documentId: user.id,
      changedBy: user.id,
      changedByRole: user.role,
      newValue: { username: user.username, email: user.email, role: user.role },
      description: `New user registered: ${user.username} (${user.role})`,
      ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    })

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    )
  } catch (error) {
    console.error("[Register] Error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
