"use client"

import { useEffect, useState } from "react"
import type { Coach } from "@/types/coach"

type Props = {
  open: boolean
  coach: Coach | null
  onClose: () => void
  onSave: (coach: Coach) => void
}

export function EditCoachModal({
  open,
  coach,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [expertise, setExpertise] = useState("")

  useEffect(() => {
    if (coach) {
      setName(coach.name)
      setEmail(coach.email)
      const exp = Array.isArray(coach.expertise) ? coach.expertise : (coach.expertise ? String(coach.expertise).split(",").map(e => e.trim()) : [])
      setExpertise(exp.join(", "))
    }
  }, [coach])

  if (!open || !coach) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl ">
        <div className="px-6 py-4 border-b font-semibold text-blue-900">
          Edit Coach
        </div>

        <div className="px-6 py-4 space-y-4">
          <input
            className="w-full border px-3 py-2 rounded text-gray-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border px-3 py-2 rounded text-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border px-3 py-2 rounded text-gray-500"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
          />
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() =>
              onSave({
                ...coach,
                name,
                email,
                expertise: expertise.split(",").map((e) => e.trim()),
              })
            }
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}