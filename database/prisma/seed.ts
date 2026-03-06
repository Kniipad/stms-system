// prisma/seed.ts
// สร้างข้อมูลตัวอย่างสำหรับ Development

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 เริ่ม Seeding database...")

  // ── Admin ──────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin1234", 12)
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@stms.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      firstName: "System",
      lastName: "Admin",
    },
  })
  console.log("✅ Admin created:", admin.username)

  // ── Coach ──────────────────────────────────────────────────
  const coachPassword = await bcrypt.hash("coach1234", 12)
  const coach = await prisma.user.upsert({
    where: { username: "coach_a" },
    update: {},
    create: {
      username: "coach_a",
      email: "coach_a@stms.com",
      passwordHash: coachPassword,
      role: "COACH",
      firstName: "สมชาย",
      lastName: "ใจดี",
      phone: "0812345678",
    },
  })
  console.log("✅ Coach created:", coach.username)

  // ── Student ────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash("student1234", 12)
  const student = await prisma.user.upsert({
    where: { username: "student_01" },
    update: {},
    create: {
      username: "student_01",
      email: "student01@stms.com",
      passwordHash: studentPassword,
      role: "STUDENT",
      firstName: "มานะ",
      lastName: "เรียนดี",
      phone: "0898765432",
    },
  })
  console.log("✅ Student created:", student.username)

  // ── Courses ────────────────────────────────────────────────
  const badmintonCourse = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Badminton Beginner",
      description: "คอร์สแบดมินตันสำหรับผู้เริ่มต้น เรียนรู้พื้นฐานการตีและกฎกติกา",
      price: 2500,
      totalSessions: 10,
      expiryDays: 90,
      status: "ACTIVE",
      coachRate: 300,
    },
  })

  const swimmingCourse = await prisma.course.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "Swimming Technique",
      description: "คอร์สว่ายน้ำเทคนิค เน้นท่าฟรีสไตล์และท่ากบ",
      price: 3000,
      totalSessions: 12,
      expiryDays: 60,
      status: "ACTIVE",
      coachRate: 400,
    },
  })
  console.log("✅ Courses created:", badmintonCourse.name, badmintonCourse.name)

  // ── Enrollment ─────────────────────────────────────────────
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + badmintonCourse.expiryDays)

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: badmintonCourse.id } },
    update: {},
    create: {
      userId: student.id,
      courseId: badmintonCourse.id,
      remainingSessions: badmintonCourse.totalSessions,
      expiryDate,
    },
  })
  console.log("✅ Enrollment created for", student.username)

  console.log("\n🎉 Seeding เสร็จสมบูรณ์!")
  console.log("─────────────────────────────")
  console.log("Admin   : admin / admin1234")
  console.log("Coach   : coach_a / coach1234")
  console.log("Student : student_01 / student1234")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
