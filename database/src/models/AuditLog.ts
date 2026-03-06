// src/models/AuditLog.ts
import mongoose, { Schema, Document, Model } from "mongoose"

// ============================================================
// TypeScript Interface
// ============================================================

export interface IAuditLog extends Document {
  action: "create" | "update" | "delete"
  collection: string                       // ชื่อตาราง เช่น "users", "enrollments"
  documentId: string                       // ID ของ Record ที่ถูกแก้ไข
  changedBy: string                        // User ID ของคนที่ทำการเปลี่ยนแปลง
  changedByRole?: "ADMIN" | "COACH" | "STUDENT"
  oldValue?: Record<string, unknown>       // ข้อมูลก่อนแก้ไข
  newValue?: Record<string, unknown>       // ข้อมูลหลังแก้ไข
  description?: string                     // คำอธิบาย เช่น "Student A deducted 1 credit by Coach B"
  ipAddress?: string
  timestamp: Date
}

// ============================================================
// Mongoose Schema
// ============================================================

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    collection: {
      type: String,
      required: true,
      index: true,
    },
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    changedBy: {
      type: String,
      required: true,
      index: true,
    },
    changedByRole: {
      type: String,
      enum: ["ADMIN", "COACH", "STUDENT"],
    },
    oldValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    description: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
)

// Compound indexes สำหรับ query บ่อยๆ
AuditLogSchema.index({ collection: 1, documentId: 1 })
AuditLogSchema.index({ changedBy: 1, timestamp: -1 })
AuditLogSchema.index({ action: 1, timestamp: -1 })

// ============================================================
// Model Export — ป้องกัน duplicate model ใน Next.js dev mode
// ============================================================

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema)

export default AuditLog
