import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const student = await requireRole(req, "STUDENT")

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    // 1. Today's Classes
    const todaySchedules = await prisma.schedule.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
        course: { enrollments: { some: { studentId: student.id } } }
      },
      include: {
        course: { select: { title: true } },
        attendance: { where: { studentId: student.id } } // Check if they already attended
      }
    })

    const formattedTodayClasses = todaySchedules.map(s => ({
      id: s.id,
      date: s.date.toISOString().split("T")[0],
      time: s.startTime || undefined,
      course: s.course.title,
      status: s.attendance.length > 0 ? s.attendance[0].status.toLowerCase() : "pending"
    }))

    // 2. Enrolled Courses (Active)
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
            schedules: {
              include: {
                attendance: { where: { studentId: student.id } }
              }
            }
          }
        }
      }
    })

    const myCourses = enrollments.map(e => {
      // Basic progress calculation based on schedules passed vs total
      const totalSessions = e.course.schedules.length
      const attendedSessions = e.course.schedules.filter(s => s.attendance.some(a => a.status === "PRESENT")).length
      const progress = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0

      return {
        id: e.course.id,
        title: e.course.title,
        progress: progress,
        status: e.course.status.toLowerCase(),
        totalSessions: totalSessions,
        attendedSessions: attendedSessions,
        startDate: e.course.startDate?.toISOString().split("T")[0] ?? null,
        endDate: e.course.endDate?.toISOString().split("T")[0] ?? null,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        todayClasses: formattedTodayClasses,
        myCourses: myCourses
      }
    })
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 })
    }
    console.error("GET Student Dashboard Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
