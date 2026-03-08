"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CourseStatus, CourseLevel, Course } from "@/types/course"
import { CourseCard } from "@/components/admin/courses/CourseCard"
import { CourseTable } from "@/components/admin/courses/CourseTable"
import { AddCourseModal } from "@/components/admin/courses/AddCourseModal"
import axios from "@/lib/axios"

/* ================= TYPES ================= */

export type Student = {
  id: number
  name: string
  email: string
}

export type CourseWithStudents = Course & {
  students?: Student[]
}

/* ================= PAGE ================= */

export default function CoursesPage() {
  const router = useRouter()
  const [openAdd, setOpenAdd] = useState(false)
  const [courses, setCourses] = useState<CourseWithStudents[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get("/api/admin/courses")
      .then((res) => {
  const courses = (res.data.data ?? []).map((c: any) => ({
    ...c,
    classDays: (() => { try { return typeof c.classDays === "string" ? JSON.parse(c.classDays) : (c.classDays ?? []) } catch { return [] } })(),
    coach: c.coach?.user?.name ?? c.coach?.name ?? "-",
    students: Array(c._count?.enrollments ?? 0).fill({}),
  }))
  setCourses(courses)
})
      .catch((err) => {
        if (err.response?.status === 401) { localStorage.removeItem("token"); router.push("/login") }
        else setError("Failed to load courses")
      })
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="p-6 space-y-10">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">
            Course Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage courses, students, and details
          </p>
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          + Add Course
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* ===== Table View (ของเดิม) ===== */}
      <CourseTable
        courses={courses}
        onUpdate={async (updated) => {
          try {
            await axios.put(`/api/admin/courses/${updated.id}`, updated)
            setCourses((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            )
          } catch { setError("Failed to update course") }
        }}
        onDelete={async (id) => {
          try {
            await axios.delete(`/api/admin/courses/${id}`)
            setCourses((prev) => prev.filter((c) => c.id !== id))
          } catch { setError("Failed to delete course") }
        }}
      />

      {/* ===== Card / Classroom View ===== */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-blue-600">
          Available Courses
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
            />
          ))}
        </div>
      </div>

      {/* ===== Modal ===== */}
      <AddCourseModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={async (course) => {
          try {
            const res = await axios.post("/api/admin/courses", course)
            setCourses((prev) => [
              ...prev,
              {
                id: res.data.data?.id ?? Date.now(),
                ...res.data.data,
                students: [],
              },
            ])
          } catch { setError("Failed to add course") }
        }}
      />
    </div>
  )
}