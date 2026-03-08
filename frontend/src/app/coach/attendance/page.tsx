"use client"

import { useState, useEffect } from "react"
import axios from "@/lib/axios"
import {
  ClipboardCheck,
  Users,
  BookOpen,
  CheckCircle2,
} from "lucide-react"

/* ================= TYPES ================= */

type Student = {
  id: number
  name: string
  email: string
}

type Course = {
  id: number
  courseTitle: string
  startTime: string
  students: Student[]
}

/* ================= PAGE ================= */

export default function CoachAttendancePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0)

  useEffect(() => {
    axios.get("/api/coach/attendance").then((res) => {
      const all = res.data.data ?? []
      const seen = new Set()
      const unique = all.filter((s: any) => {
        if (seen.has(s.courseId)) return false
        seen.add(s.courseId)
        return true
      })
      setCourses(unique.map((s: any) => ({ ...s, id: s.courseId })))
    })
  }, [])

  useEffect(() => {
    if (courses.length > 0 && selectedCourseId === 0) {
      setSelectedCourseId(courses[0].id)
    }
  }, [courses])

  const [checkedIn, setCheckedIn] = useState<
    Record<number, number[]>
  >({})

  const course = courses.find((c) => c.id === selectedCourseId)

  const checkedStudents = course ? (checkedIn[selectedCourseId] || []) : []

  const handleCheckIn = async (student: Student) => {
    

    try {
      await axios.post("/api/coach/attendance", { scheduleId: selectedCourseId, records: [{ studentId: student.id, status: "PRESENT" }] })
      // old payload removed
      if (false) axios.post("", {
        courseId: selectedCourseId,
        studentId: student.id,
        date: new Date().toISOString().split("T")[0],
        status: "present",
      })
    } catch {
      // optimistic update even on error
    }

    setCheckedIn((prev) => ({
      ...prev,
      [selectedCourseId]: [
        ...(prev[selectedCourseId] || []),
        student.id,
      ],
    }))
  }

  const progress = course
    ? (checkedStudents.length / course?.students?.length ?? 1) * 100
    : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3">
        <ClipboardCheck className="h-6 w-6 text-blue-700" />
        <h1 className="text-2xl font-bold text-blue-900">
          Attendance Check-in
        </h1>
      </div>

      {/* ===== COURSE SELECTOR ===== */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {courses.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCourseId(c.id)}
            className={`px-4 py-3 rounded-xl border text-left min-w-[220px]
              ${
                selectedCourseId === c.id
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
          >
            <p className="font-semibold">{c.courseTitle}</p>
            <p className="text-xs opacity-80">{c.startTime}</p>
          </button>
        ))}
      </div>

      {/* ===== COURSE SUMMARY ===== */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <p className="font-semibold text-blue-900">
              {course?.courseTitle}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            {checkedStudents.length} /{" "}
            {course?.students?.length ?? 0}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ===== STUDENT LIST ===== */}
      <div className="space-y-3">
        {course?.students?.map((s) => {
          const isChecked = checkedStudents.includes(s.id)
          const disabled = isChecked

          return (
            <div
              key={s.id}
              className="bg-white border rounded-xl p-4
                         flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p
                  className="text-xs text-gray-500"



                >
                  
                </p>
              </div>

              <button
                disabled={disabled}
                onClick={() => handleCheckIn(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium
                  flex items-center gap-2
                  ${
                    isChecked
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {isChecked && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isChecked
                  ? "Checked"
                  : "Check-in"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}