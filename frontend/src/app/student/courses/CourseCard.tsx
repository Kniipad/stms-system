"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  CircleDot,
  Dumbbell,
  Volleyball,
  Waves,
  Calendar,
} from "lucide-react"

/* ================== TYPES ================== */

export type SportType =
  | "badminton"
  | "football"
  | "basketball"
  | "swimming"
  | "tennis"

export type CourseLevel = "beginner" | "advanced"

export type Course = {
  id: number
  title: string
  description: string
  price: number
  totalSessions: number
  sport: SportType
  level: CourseLevel

  /* ===== added from admin ===== */
  startDate?: string
  endDate?: string
  classDays?: number[] // 0 = Sun ... 6 = Sat
}

/* ================== ICON MAP ================== */

const sportIconMap = {
  badminton: CircleDot,
  football: Dumbbell,
  basketball: Volleyball,
  swimming: Waves,
  tennis: CircleDot,
}

/* ================== HELPERS ================== */

const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatDays(days?: number[]) {
  if (!days || days.length === 0) return null
  return days.map((d) => dayMap[d]).join(", ")
}

/* ================== BADGE ================== */

function LevelBadge({ level }: { level: CourseLevel }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium
        ${
          level?.toLowerCase() === "beginner"
            ? "bg-green-100 text-green-700"
            : "bg-purple-100 text-purple-700"
        }
      `}
    >
      {level?.toLowerCase() === "beginner" ? "Beginner" : level?.toLowerCase() === "intermediate" ? "Intermediate" : "Advanced"}
    </span>
  )
}

/* ================== CARD ================== */

export default function CourseCard({
  course,
}: {
  course: Course
}) {
  const Icon = sportIconMap[course.sport as keyof typeof sportIconMap] ?? CircleDot

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white border rounded-xl p-5 space-y-4 shadow-sm hover:shadow-lg"
    >
      {/* ===== Header ===== */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">
            {course.title}
          </h3>
        </div>
        <LevelBadge level={course.level} />
      </div>

      {/* ===== Description ===== */}
      <p className="text-sm text-gray-600">
        {course.description}
      </p>

      {/* ===== Schedule (from admin) ===== */}
      {(course.startDate || course.classDays) && (
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center gap-2 text-blue-800 font-medium">
            <Calendar className="h-4 w-4" />
            <span>Course Schedule</span>
          </div>

          {course.startDate && course.endDate && (
            <div className="text-green-600 text-xs">
              {course.startDate} – {course.endDate}
            </div>
          )}

          {course.classDays && (
            <div className="text-yellow-600 text-xs">
              Days: {formatDays(course.classDays)}
            </div>
          )}
        </div>
      )}

      {/* ===== Info ===== */}
      <div className="flex justify-between text-sm text-gray-500 pt-2 border-t">
        <span>{course.totalSessions} sessions</span>
        <span className="font-semibold text-blue-700">
          {course.price.toLocaleString()} THB
        </span>
      </div>

      {/* ===== Action ===== */}
      <Link
        href={`/student/payment/submit?courseId=${course.id}`}
        className="text-sm text-blue-600 hover:underline"
      >
        View details →
      </Link>
    </motion.div>
  )
}