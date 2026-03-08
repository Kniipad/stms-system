"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, CalendarDays } from "lucide-react"
import { StudentListModal } from "./StudentListModal"
import { CourseWithStudents } from "@/types/CourseWithStudents"

/* ================== BADGES ================== */

function LevelBadge({ level }: { level?: string }) {
  if (!level) return null
  return (
    <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
      {level}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium
        ${
          status === "published"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-600"
        }
      `}
    >
      {status}
    </span>
  )
}

/* ================== CARD ================== */

export function CourseCard({
  course,
}: {
  course: CourseWithStudents
}) {
  const [openStudents, setOpenStudents] = useState(false)
  const studentCount = course.students?.length ?? 0

  return (
    <>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white border rounded-xl p-5 space-y-4 shadow-sm hover:shadow-lg"
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-blue-900">
            {course.title}
          </h3>
          <div className="flex gap-2">
            <LevelBadge level={course.level} />
            <StatusBadge status={course.status} />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>

        {/* Coach */}
        <div className="text-sm text-gray-500">
          Coach: <span className="font-medium">{course.coach}</span>
        </div>

        {/* Schedule */}
        {course.startDate && course.endDate && (
          <div className="flex items-center gap-2 text-xs text-green-500">
            <CalendarDays className="w-4 h-4" />
            {course.startDate?.slice(0,10)} → {course.endDate?.slice(0,10)}
          </div>
        )}

        {/* Class Days */}
        {(Array.isArray(course.classDays) ? course.classDays : []) && course.classDays.length > 0 && (
          <div className="text-xs text-green-500">
            Days:{" "}
            {(Array.isArray(course.classDays) ? course.classDays : [])
              .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
              .join(", ")}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2">
          <span className="font-semibold text-blue-700">
            {course.price.toLocaleString()} THB
          </span>

          <button
            disabled={studentCount === 0}
            onClick={() => setOpenStudents(true)}
            className={`flex items-center gap-1 text-sm
              ${
                studentCount === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:underline"
              }
            `}
          >
            <Users className="w-4 h-4" />
            {studentCount} students
          </button>
        </div>
      </motion.div>

      {/* Student Modal */}
      {course.students && (
        <StudentListModal
          open={openStudents}
          onClose={() => setOpenStudents(false)}
          students={course.students}
          courseTitle={course.title}
        />
      )}
    </>
  )
}