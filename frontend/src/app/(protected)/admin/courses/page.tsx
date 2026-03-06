"use client"

import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { AddCourseModal } from "@/components/admin/courses/AddCourseModal"
import { EditCourseModal } from "@/components/admin/courses/EditCourseModal"
import { DeleteCourseModal } from "@/components/admin/courses/DeleteCourseModal"

type Course = {
  id: number
  title: string
  price: number
  status: string
  level?: string
  enrolledStudents?: number
  startDate?: string
  endDate?: string
  coachId?: number
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [openAdd, setOpenAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Course | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null)

  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/admin/courses")
      setCourses(res.data?.data || [])
    } catch (err) {
      console.error("Courses fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCourses() }, [])

  const handleAdd = async (payload: Partial<Course>) => {
    try {
      await axios.post("/api/admin/courses", payload)
      await fetchCourses()
      setOpenAdd(false)
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to add course")
    }
  }

  const handleEdit = async (id: number, payload: Partial<Course>) => {
    try {
      await axios.put(`/api/admin/courses/${id}`, payload)
      await fetchCourses()
      setEditTarget(null)
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update course")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/admin/courses/${id}`)
      await fetchCourses()
      setDeleteTarget(null)
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete course")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Course Management</h1>
          <p className="text-gray-500 text-sm">Manage courses offered by the academy</p>
        </div>
        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          + Add Course
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          No courses found. Add your first course.
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b bg-gray-50">
                <th className="py-3 px-4">Title</th>
                <th className="px-4">Price</th>
                <th className="px-4">Level</th>
                <th className="px-4">Status</th>
                <th className="px-4">Students</th>
                <th className="px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-blue-900">{course.title}</td>
                  <td className="px-4">฿{course.price?.toLocaleString() ?? 0 }</td>
                  <td className="px-4 capitalize">{course.level?.toLowerCase() || "—"}</td>
                  <td className="px-4">
                    <span className={`text-xs px-2 py-1 rounded-full
                      ${course.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-4 text-gray-600">{course.enrolledStudents ?? 0}</td>
                  <td className="px-4">
                    <div className="flex gap-2">
                      <button onClick={() => setEditTarget(course)} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => setDeleteTarget(course)} className="text-xs text-red-600 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openAdd && (
        <AddCourseModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onAdd={(c: any) => handleAdd(c)}
        />
      )}
      {editTarget && (
        <EditCourseModal
          open={!!editTarget}
          course={editTarget as any}
          onClose={() => setEditTarget(null)}
          onSave={(updated: any) => handleEdit(editTarget.id, updated)}
        />
      )}
      {deleteTarget && (
        <DeleteCourseModal
          open={!!deleteTarget}
          course={deleteTarget as any}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </div>
  )
}