import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const student = await requireRole(req, "STUDENT")
    const { id } = await params
    const courseId = parseInt(id)

    if (isNaN(courseId)) {
      return NextResponse.json({ success: false, error: "Invalid course ID" }, { status: 400 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        coach: { include: { user: { select: { name: true } } } },
        _count: { select: { enrollments: true, schedules: true } }
      }
    })

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    // Check if current user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: courseId
        }
      }
    })

    const formattedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      coach: course.coach.user.name,
      price: course.price,
      level: course.level,
      startDate: course.startDate ? course.startDate.toISOString().split("T")[0] : undefined,
      endDate: course.endDate ? course.endDate.toISOString().split("T")[0] : undefined,
      classDays: course.classDays ? JSON.parse(course.classDays) : [],
      status: course.status,
      totalSessions: course._count.schedules,
      enrolledCount: course._count.enrollments,
      isEnrolled: !!existingEnrollment
    }

    return NextResponse.json({ success: true, data: formattedCourse })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    console.error("GET Student Course Detail Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
