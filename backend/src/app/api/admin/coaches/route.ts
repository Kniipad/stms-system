import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { createLog } from "@/lib/auditLog"

export async function GET(req: Request) {
  try {
    const admin = await requireRole(req, "ADMIN")

    // Get all coach profiles with their underlying user and course counts
    const coaches = await prisma.coachProfile.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        _count: {
          select: { courses: true }
        }
      }
    })

    const formattedCoaches = coaches.map((c: any) => ({
      id: c.userId, // We'll use userId as the main identifier for edits/deletes as requested
      profileId: c.id,
      name: c.user.name,
      email: c.user.email,
      expertise: c.expertise ? JSON.parse(c.expertise) : [],
      status: c.status,
      totalCourses: c._count.courses,
    }))

    return NextResponse.json({ success: true, data: formattedCoaches })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    console.error("GET Coaches Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireRole(req, "ADMIN")
    const body = await req.json()
    const { name, email, expertise } = body

    if (!name || !email || !expertise || !Array.isArray(expertise)) {
      return NextResponse.json({ success: false, error: "Missing required fields or expertise is not an array" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash("coach123", 10)

    // Create User AND CoachProfile using Prisma transaction
    const newCoach = await prisma.$transaction(async (tx: any) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "COACH",
          status: "ACTIVE"
        }
      })

      // Create coach profile
      const userProfile = await tx.coachProfile.create({
        data: {
          userId: user.id,
          expertise: JSON.stringify(expertise),
          status: "ACTIVE"
        }
      })

      return { user, userProfile }
    })

    await createLog("CREATE", "CoachProfile", newCoach.userProfile.id, admin.id, null, newCoach, `Admin created a new coach: ${name}`)

    return NextResponse.json({ 
      success: true, 
      message: "Coach created successfully",
      data: {
        id: newCoach.user.id,
        profileId: newCoach.userProfile.id,
        name: newCoach.user.name,
        email: newCoach.user.email,
        expertise,
        status: newCoach.userProfile.status,
        totalCourses: 0
      }
    }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    if (error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
    }
    console.error("POST Coach Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}