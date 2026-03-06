// src/lib/mongodb.ts
// Singleton Mongoose connection สำหรับ Next.js

import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error(
    "กรุณาตั้งค่า MONGODB_URI ใน .env.local"
  )
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalForMongoose = globalThis as unknown as {
  mongoose: MongooseCache | undefined
}

const cached: MongooseCache = globalForMongoose.mongoose ?? {
  conn: null,
  promise: null,
}

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = cached
}

export async function connectMongoDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m)
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectMongoDB
