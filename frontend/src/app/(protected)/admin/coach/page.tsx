"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Coach } from "@/types/coach"
import { CoachTable } from "@/components/admin/coach/CoachTable"
import { AddCoachModal } from "@/components/admin/coach/AddCoachModal"
import axios from "@/lib/axios"

export default function CoachesPage() {
  const router = useRouter()
  const [openAdd, setOpenAdd] = useState(false)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get("/api/admin/coaches")
      .then((res) => setCoaches(res.data.data ?? []))
      .catch((err) => {
        if (err.response?.status === 401) { localStorage.removeItem("token"); router.push("/login") }
        else setError("Failed to load coaches")
      })
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">
            Coach Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage coaches and teaching history
          </p>
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          + Add Coach
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <CoachTable
        coaches={coaches}
        onUpdate={async (updated) => {
          try {
            await axios.put(`/api/admin/coaches/${updated.id}`, updated)
            setCoaches((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            )
          } catch { setError("Failed to update coach") }
        }}
        onSoftDelete={async (id) => {
          try {
            await axios.delete(`/api/admin/coaches/${id}`)
            setCoaches((prev) =>
              prev.map((c) =>
                c.id === id ? { ...c, status: "inactive" } : c
              )
            )
          } catch { setError("Failed to delete coach") }
        }}
        onActivate={async (id) => {
          try {
            await axios.put(`/api/admin/coaches/${id}`, { status: "active" })
            setCoaches((prev) =>
              prev.map((c) =>
                c.id === id ? { ...c, status: "ACTIVE" } : c
              )
            )
          } catch { setError("Failed to activate coach") }
        }}
      />

      <AddCoachModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={async (coach) => {
          try {
            const res = await axios.post("/api/admin/coaches", { ...coach, status: "active", totalCourses: 0 })
            setCoaches((prev) => [...prev, res.data.data ?? res.data])
          } catch { setError("Failed to add coach") }
        }}
      />
    </div>
  )
}