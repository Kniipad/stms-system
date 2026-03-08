"use client"

import { useState, useEffect } from "react"
import axios from "@/lib/axios"
import Link from "next/link"
import {Home,Bell} from "lucide-react"
import TodayClasses, {
  Attendance,
} from "@/components/student/TodayClasses"

/* ================= TYPES ================= */

export type EnrolledCourse = {
  id: number
  title: string
  totalSessions: number
  attendedSessions: number
  startDate: string
  endDate: string
  nextClassDate?: string
}



/* ================= HELPERS ================= */

function daysLeft(endDate: string) {
  const end = new Date(endDate).getTime()
  const now = new Date().getTime()
  return Math.max(
    Math.ceil((end - now) / (1000 * 60 * 60 * 24)),
    0
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function progressColor(progress: number) {
  if (progress >= 80) return "bg-green-500"
  if (progress >= 50) return "bg-blue-600"
  if (progress >= 30) return "bg-yellow-500"
  return "bg-red-500"
}

function statusLabel(progress: number) {
  if (progress === 100)
    return { text: "Completed", color: "bg-green-100 text-green-700" }
  if (progress >= 60)
    return { text: "On Track", color: "bg-blue-100 text-blue-700" }
  return { text: "Behind", color: "bg-yellow-100 text-yellow-700" }
}

/* ================= PAGE ================= */

export default function StudentDashboard() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([])

  useEffect(() => {
    axios.get("/api/student/dashboard").then((res) => {
      setCourses(res.data.data?.myCourses ?? res.data.courses ?? [])
      setAttendanceHistory(res.data.data?.todayClasses ?? res.data.attendance ?? [])
    })
  }, [])

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* ===== GLOBAL HEADER ===== */}
      <div className="flex items-center justify-between">
  {/* Left: Title */}
  <div className="flex items-center gap-3">
    <Home className="h-6 w-6 text-blue-700" />
    <h1 className="text-2xl font-bold text-blue-900">
      Dashboard
    </h1>
  </div>

  {/* Right: Notification Bell */}
  <Link
    href="/student/notifications"
    className="relative h-10 w-10 flex items-center justify-center
               rounded-full hover:bg-blue-50 transition"
  >
    <Bell className="h-6 w-6 text-blue-700" />

    {/* 🔴 Badge */}
    <span
      className="absolute -top-0.5 -right-0.5
                 bg-red-500 text-white text-[10px]
                 h-4 min-w-[16px] px-1
                 flex items-center justify-center
                 rounded-full"
    >
      3
    </span>
  </Link>
</div>

{/* ===== TODAY CLASSES ===== */}
<div className="space-y-2">
  <TodayClasses attendanceHistory={attendanceHistory} />
</div>

      {/* ===== MY COURSES HEADER ===== */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-blue-900">
          My Active Courses
        </h2>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* ===== COURSES GRID ===== */}
      <div className="grid gap-5 md:grid-cols-2">
        {courses.map((course) => {
          const progress =
            (course.attendedSessions / course.totalSessions) * 100

          const remainingSessions =
            course.totalSessions - course.attendedSessions

          const remainingDays = daysLeft(course.endDate)
          const status = statusLabel(progress)

          return (
            <div
              key={course.id}
              className="bg-white rounded-xl border overflow-hidden
                         transition hover:shadow-lg hover:-translate-y-0.5"
            >
              {/* ===== CARD HEADER ===== */}
              <div className="bg-blue-50 px-5 py-4 flex justify-between items-start border-b">
                <div>
                  <div className="font-semibold text-lg text-blue-900">
                    {course.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(course.startDate)} –{" "}
                    {formatDate(course.endDate)}
                  </div>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded ${status.color}`}
                >
                  {status.text}
                </span>
              </div>

              {/* ===== CARD BODY ===== */}
              <div className="p-5 space-y-4">
                {/* Progress Info */}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {course.attendedSessions} /{" "}
                    {course.totalSessions} sessions
                  </span>
                  <span>{remainingSessions} left</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
                  <div
                    className={`h-2 transition-all duration-700 ${progressColor(
                      progress
                    )}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="h-px bg-gray-200" />

                {/* Footer */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    ⏳ {remainingDays} days remaining
                  </span>

                  {course.nextClassDate && (
                    <span>
                      📅 Next class:{" "}
                      {formatDate(course.nextClassDate)}
                    </span>
                  )}
                </div>

                {/* Warning */}
                {remainingDays <= 7 && (
                  <div className="text-xs text-red-700 bg-red-50 px-3 py-2 rounded">
                    ⚠️ This course is ending soon
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}