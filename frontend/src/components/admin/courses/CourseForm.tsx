"use client"
import { useState } from "react"
import axios from "@/lib/axios"
import { Coach } from "@/types/coach"

type Props = {
  coaches: Coach[]
  onSuccess?: () => void
  onCancel?: () => void
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function CourseForm({ coaches, onSuccess, onCancel }: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [coachId, setCoachId] = useState<number | "">("")
  const [price, setPrice] = useState("")
  const [level, setLevel] = useState("BEGINNER")
  const [status, setStatus] = useState("DRAFT")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [classDays, setClassDays] = useState<number[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const toggleDay = (d: number) => {
    setClassDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  const handleSubmit = async () => {
    if (!title || !coachId) {
      setError("Title and Coach are required")
      return
    }
    setLoading(true)
    setError("")
    try {
      await axios.post("/api/admin/courses", {
        title, description, coach: coachId, price: Number(price),
        level, status, startDate: startDate || null, endDate: endDate || null,
        classDays
      })
      onSuccess?.()
    } catch {
      setError("Failed to add course")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        className="w-full border rounded-lg px-3 py-2 text-sm"
        placeholder="Course title *"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <textarea
        className="w-full border rounded-lg px-3 py-2 text-sm"
        placeholder="Description"
        rows={3}
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <select
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={coachId}
        onChange={e => setCoachId(Number(e.target.value))}
      >
        <option value="">Select coach *</option>
        {coaches
          .filter(c => c.status.toLowerCase() === "active")
          .map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.expertise.join(", ")})
            </option>
          ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={level}
          onChange={e => setLevel(e.target.value)}
        >
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
        <select
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      <input
        className="w-full border rounded-lg px-3 py-2 text-sm"
        type="number"
        placeholder="Price (THB)"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500">Start Date</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">End Date</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Class Days</label>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                classDays.includes(i)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Course"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
