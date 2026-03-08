import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { createLog } from "@/lib/auditLog"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(req, "ADMIN")
    const { id } = await params
    const userId = parseInt(id)
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 })
    }

    const body = await req.json()
    const { name, email, role, status } = body

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = name
    if (email) dataToUpdate.email = email
    if (role) dataToUpdate.role = role.toUpperCase()
    if (status) dataToUpdate.status = status.toUpperCase()

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true, status: true }
    })

    await createLog(
      "UPDATE",
      "User",
      userId,
      admin.id,
      { role: existingUser.role, status: existingUser.status },
      dataToUpdate,
      `Admin updated user ${userId}`
    )

    return NextResponse.json({ success: true, data: updatedUser, message: "User updated successfully" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    console.error("PUT User Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(req, "ADMIN")
    const { id } = await params
    const userId = parseInt(id)
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!existingUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Usually we do soft delete
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: "SUSPENDED" },
      select: { id: true, name: true, email: true, status: true }
    })

    await createLog("DELETE_SOFT", "User", userId, admin.id, { status: existingUser.status }, { status: "SUSPENDED" }, `Admin suspended user ${userId}`)

    return NextResponse.json({ success: true, data: updatedUser, message: "User suspended successfully" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    console.error("DELETE User Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
