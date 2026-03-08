"use client"

import { useState } from "react"
import type { Coach } from "@/types/coach"
import { EditCoachModal } from "./EditCoachModal"
import { DeleteCoachModal } from "./DeleteCoachModal"
import { CoachHistoryModal } from "./CoachHistoryModal"

type Props = {
  coaches: Coach[]
  onUpdate: (coach: Coach) => void
  onSoftDelete: (id: number) => void
  onActivate?: (id: number) => void
}

export function CoachTable({
  coaches,
  onUpdate,
  onSoftDelete,
  onActivate,
}: Props) {
  const [editCoach, setEditCoach] = useState<Coach | null>(null)
  const [sortKey, setSortKey] = useState<keyof Coach | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const handleSort = (key: keyof Coach) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  const sorted = [...coaches].sort((a, b) => {
    if (!sortKey) return 0
    const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? ""
    return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
  })

  const arrow = (key: keyof Coach) => sortKey === key ? (sortAsc ? " ▲" : " ▼") : " ↕"
  const [deleteCoach, setDeleteCoach] = useState<Coach | null>(null)
  const [historyCoach, setHistoryCoach] = useState<Coach | null>(null)

  return (
    <>
      <div className="bg-white rounded-xl shadow border">
        <table className="w-full text-sm">
          <thead className="border-b text-gray-500">
            <tr>
              <th className="text-left p-4 cursor-pointer select-none" onClick={() => handleSort("id")}>ID{arrow("id")}</th>
              <th className="text-left p-4 cursor-pointer select-none" onClick={() => handleSort("name")}>Name{arrow("name")}</th>
              <th className="text-left p-4 cursor-pointer select-none" onClick={() => handleSort("expertise")}>Expertise{arrow("expertise")}</th>
              <th className="text-left p-4 cursor-pointer select-none" onClick={() => handleSort("totalCourses")}>Courses{arrow("totalCourses")}</th>
              <th className="text-left p-4 cursor-pointer select-none" onClick={() => handleSort("status")}>Status{arrow("status")}</th>
              <th className="text-right p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-400">{c.id}</td>
                <td className="p-4 font-medium text-blue-900">{c.name}</td>
                <td className="p-4 text-blue-900">{(Array.isArray(c.expertise) ? c.expertise : (c.expertise ? c.expertise.split(",") : [])).join(", ")}</td>
                <td className="p-4 text-blue-900">{c.totalCourses}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      (c.status ?? "").toLowerCase() === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {c.status ?? "-"}
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button
                    onClick={() => setHistoryCoach(c)}
                    className="text-indigo-600 hover:underline"
                  >
                    History
                  </button>

                  <button
                    onClick={() => setEditCoach(c)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  {(c.status ?? "").toLowerCase() === "active" ? (
                    <button
                      onClick={() => setDeleteCoach(c)}
                      className="text-red-600 hover:underline"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivate?.(c.id)}
                      className="text-green-600 hover:underline"
                    >
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditCoachModal
        open={!!editCoach}
        coach={editCoach}
        onClose={() => setEditCoach(null)}
        onSave={(updated) => {
          onUpdate(updated)
          setEditCoach(null)
        }}
      />

      <DeleteCoachModal
        open={!!deleteCoach}
        coach={deleteCoach}
        onClose={() => setDeleteCoach(null)}
        onConfirm={() => {
          if (deleteCoach) onSoftDelete(deleteCoach.id)
          setDeleteCoach(null)
        }}
      />

      <CoachHistoryModal
        open={!!historyCoach}
        coach={historyCoach}
        onClose={() => setHistoryCoach(null)}
      />
    </>
  )
}