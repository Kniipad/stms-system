import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    await requireRole(req, "ADMIN")

    const courses = await prisma.course.findMany({
      include: {
        coach: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: courses
    })

  } catch (error) {
    console.error("GET Courses Error:", error)

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}