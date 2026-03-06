import type { IAuditLog } from "@/models/AuditLog"
import dbConnect from "@/lib/mongodb"
import AuditLog from "@/models/AuditLog"

export async function createLog(data: Partial<IAuditLog>) {
  try {
    await dbConnect()
    const log = new AuditLog(data)
    await log.save()
    return log
  } catch (error) {
    console.error("[AuditLog] Failed to create log:", error)
    return null
  }
}
