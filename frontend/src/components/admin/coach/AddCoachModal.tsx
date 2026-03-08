"use client"

import { useState } from "react"

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (coach: {
    name: string
    email: string
    expertise: string[]
  }) => void
}

export function AddCoachModal({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [expertise, setExpertise] = useState("")

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
        <div className="px-6 py-4 border-b font-semibold text-blue-900">
          Add Coach
        </div>

        <div className="px-6 py-4 space-y-4">
          <input
            className="w-full border px-3 py-2 rounded text-blue-900"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border px-3 py-2 rounded text-blue-900"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border px-3 py-2 rounded text-blue-900"
            placeholder="Expertise (comma separated)"
            value={expertise}
            onChange={(e) => setExpertise(e.target.value)}
          />
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => { setName(""); setEmail(""); setExpertise("");
              onAdd({
                name,
                email,
                expertise: expertise.split(",").map((e) => e.trim()),
              })
              onClose()
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded text"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}