import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const coachUser = await requireRole(req, "COACH")

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: coachUser.id }
    })

    if (!coachProfile) {
      return NextResponse.json(
        { success: false, error: "Coach profile not found" },
        { status: 404 }
      )
    }

    // Total Courses
    const totalCourses = await prisma.course.count({
      where: {
        coachId: coachProfile.id,
        status: "PUBLISHED"
      }
    })

    // Total Sessions
    const totalSessions = await prisma.schedule.count({
      where: {
        course: {
          coachId: coachProfile.id
        }
      }
    })

    // Payments
    const payments = await prisma.payment.findMany({
      where: {
        course: {
          coachId: coachProfile.id
        },
        status: "APPROVED"
      }
    })

    // Total Income
    const totalIncome = payments.reduce((sum, p) => {
      return sum + (p.amount || 0)
    }, 0)

    // Monthly Trend
    const monthlyData: Record<string, number> = {}

    payments.forEach((p) => {
      if (!p.approvedAt) return

      const month = p.approvedAt.toISOString().slice(0, 7)

      monthlyData[month] = (monthlyData[month] || 0) + (p.amount || 0)
    })

    const monthlyTrend = Object.keys(monthlyData)
      .sort()
      .map((month) => ({
        month,
        income: monthlyData[month]
      }))

    return NextResponse.json({
      success: true,
      data: {
        totalCourses,
        totalSessions,
        totalIncome,
        monthlyTrend
      }
    })
  } catch (error: any) {

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      )
    }

    console.error("GET Coach Summary Error:", error)

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}