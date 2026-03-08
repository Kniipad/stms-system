import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { createLog } from "@/lib/auditLog"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(req, "ADMIN")
    const { id } = await params
    const userId = parseInt(id) // This is User ID from the table
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 })
    }

    const { name, email, expertise, status } = await req.json()

    // Find the coach profile
    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: userId },
      include: { user: true }
    })

    if (!coachProfile) {
      return NextResponse.json({ success: false, error: "Coach profile not found" }, { status: 404 })
    }

    const updatedCoach = await prisma.$transaction(async (tx: any) => {
      // Update User if needed
      if (name || email) {
        await tx.user.update({
          where: { id: userId },
          data: {
            ...(name && { name }),
            ...(email && { email })
          }
        })
      }

      // Update CoachProfile
      let profileDataToUpdate: any = {}
      if (expertise && Array.isArray(expertise)) {
        profileDataToUpdate.expertise = JSON.stringify(expertise)
      }
      if (status) {
        profileDataToUpdate.status = status.toUpperCase()
      }

      let newProfile = coachProfile
      if (Object.keys(profileDataToUpdate).length > 0) {
        newProfile = await tx.coachProfile.update({
          where: { userId: userId },
          data: profileDataToUpdate
        })
      }

      return { newProfile, name: name || coachProfile.user.name, email: email || coachProfile.user.email }
    })

    await createLog("UPDATE", "CoachProfile", userId, admin.id, coachProfile, updatedCoach, `Admin updated coach ${userId}`)

    return NextResponse.json({ 
      success: true, 
      message: "Coach updated successfully",
      data: {
        id: userId,
        profileId: updatedCoach.newProfile.id,
        name: updatedCoach.name,
        email: updatedCoach.email,
        expertise: updatedCoach.newProfile.expertise ? JSON.parse(updatedCoach.newProfile.expertise) : [],
        status: updatedCoach.newProfile.status
      }
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    console.error("PUT Coach Error:", error)
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

    const coachProfile = await prisma.coachProfile.findUnique({ where: { userId: userId } })
    if (!coachProfile) {
      return NextResponse.json({ success: false, error: "Coach profile not found" }, { status: 404 })
    }

    const updatedProfile = await prisma.coachProfile.update({
      where: { userId: userId },
      data: { status: "INACTIVE" }
    })

    await createLog("DELETE_SOFT", "CoachProfile", userId, admin.id, { status: coachProfile.status }, { status: "INACTIVE" }, `Admin deactivated coach ${userId}`)

    return NextResponse.json({ success: true, data: updatedProfile, message: "Coach deactivated successfully" })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    console.error("DELETE Coach Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}