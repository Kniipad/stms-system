import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth"
import { createLog } from "@/lib/auditLog"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(req, "ADMIN")

    const { id } = await params
    const paymentId = parseInt(id)

    if (isNaN(paymentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid payment ID" },
        { status: 400 }
      )
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { course: true, student: true }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      )
    }

    if (existingPayment.status === "APPROVED") {
      return NextResponse.json(
        { success: false, error: "Payment is already approved" },
        { status: 400 }
      )
    }

    const approvedDate = new Date()

    const result = await prisma.$transaction(async (tx) => {

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "APPROVED",
          approvedAt: approvedDate
        }
      })

      const newFinanceRecord = await tx.financeRecord.create({
        data: {
          date: approvedDate,
          name: "Course Payment",
          description: `Payment by ${existingPayment.student.name} for ${existingPayment.course?.title || "General"}`,
          amount: existingPayment.amount,
          type: "revenue"
        }
      })

      return { updatedPayment, newFinanceRecord }
    })

    await createLog(
      "APPROVE",
      "Payment",
      paymentId,
      admin.id,
      existingPayment,
      result.updatedPayment,
      "Admin approved payment"
    )

    return NextResponse.json({
      success: true,
      data: result.updatedPayment,
      message: "Payment approved successfully"
    })

  } catch (error: any) {

    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      )
    }

    console.error("POST Approve Payment Error:", error)

    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    )
  }
}