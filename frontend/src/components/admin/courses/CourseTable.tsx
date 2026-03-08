"use client"

import { useState } from "react"
import { EditCourseModal } from "./EditCourseModal"
import { DeleteCourseModal } from "./DeleteCourseModal"

/* ================= TYPES ================= */

export type CourseStatus = "draft" | "published"
export type CourseLevel = "Beginner" | "Advanced"

export type Course = {
  id: number
  title: string
  description: string
  coach: string
  price: number
  status: CourseStatus
  level?: CourseLevel
  startDate?: string
  endDate?: string
  classDays?: number[]
}

type Props = {
  courses: Course[]
  onUpdate: (course: Course) => void
  onDelete: (id: number) => void
}

/* ================= HELPERS ================= */

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatDays(days?: number[] | string) {
  if (typeof days === "string") {
    try { days = JSON.parse(days) } catch { return days }
  }
  if (!days || days.length === 0) return "-"
  return days.map((d) => DAY_LABELS[d]).join(", ")
}

/* ================= TABLE ================= */

export function CourseTable({ courses, onUpdate, onDelete }: Props) {
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null)

  return (
    <>
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="border-b text-gray-500 bg-gray-50">
            <tr>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Coach</th>
              <th className="text-left p-4">Level</th>
              <th className="text-left p-4">Schedule</th>
              <th className="text-left p-4">Class Days</th>
              <th className="text-right p-4">Price</th>
              <th className="text-center p-4">Status</th>
              <th className="text-right p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((c) => (
              <tr
                key={c.id}
                className="border-b hover:bg-gray-50 text-blue-900"
              >
                <td className="p-4 font-medium">{c.title}</td>

                <td className="p-4">{c.coach}</td>

                <td className="p-4">
                  {c.level ?? "-"}
                </td>

                <td className="p-4 text-xs text-gray-600">
                  {c.startDate && c.endDate
                    ? `${c.startDate?.slice(0,10)} → ${c.endDate?.slice(0,10)}`
                    : "-"}
                </td>

                <td className="p-4 text-xs text-gray-600">
                  {formatDays(c.classDays)}
                </td>

                <td className="p-4 text-right font-medium">
                  {c.price.toLocaleString()} ฿
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        c.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {c.status}
                  </span>
                </td>

                <td className="p-4 text-right space-x-3">
                  <button
                    onClick={() => setEditCourse(c)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteCourse(c)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {courses.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-gray-400"
                >
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== MODALS ===== */}

      <EditCourseModal
        open={!!editCourse}
        course={editCourse}
        onClose={() => setEditCourse(null)}
        onSave={(updated) => {
          onUpdate(updated)
          setEditCourse(null)
        }}
      />

      <DeleteCourseModal
        open={!!deleteCourse}
        course={deleteCourse}
        onClose={() => setDeleteCourse(null)}
        onConfirm={() => {
          if (deleteCourse) onDelete(deleteCourse.id)
          setDeleteCourse(null)
        }}
      />
    </>
  )
}