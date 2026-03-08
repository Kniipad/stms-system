import connectMongo from "./mongodb"
import { AuditLog } from "@/models/AuditLog"
import { headers } from "next/headers"

export async function createLog(
  action: string,
  collectionName: string,
  documentId: string | number,
  userId?: number,
  oldValues?: any,
  newValues?: any,
  description?: string
) {
  try {
    await connectMongo()
    
    // Attempt to get IP address
    const headersList = await headers()
    let ipAddress = "unknown"
    const forwarded = headersList.get("x-forwarded-for")
    if (forwarded) {
      ipAddress = forwarded.split(",")[0]
    } else {
      ipAddress = headersList.get("x-real-ip") || "unknown"
    }

    const log = new AuditLog({
      action,
      collectionName,
      documentId: String(documentId),
      userId,
      oldValues,
      newValues,
      description,
      ipAddress,
    })

    await log.save()
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}
