import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // ตรวจสอบสิทธิ์ ADMIN
    const admin = await requireRole(req, "ADMIN")

    const { id } = await params
    const courseId = parseInt(id)

    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, error: "Invalid course ID" },
        { status: 400 }
      )
    }

    // ดึงข้อมูล course พร้อม students
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      )
    }

    // map students
    const students = course.enrollments.map((e) => ({
      id: e.student.id,
      name: e.student.name,
      email: e.student.email
    }))

    return NextResponse.json({
      success: true,
      count: students.length,
      data: students
    })

  } catch (error: any) {

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      )
    }

    console.error("GET Course Students Error:", error)

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}