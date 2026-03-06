// src/lib/jwt.ts
import { SignJWT, jwtVerify } from "jose"

const getSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? "stms-super-secret-please-change-in-production"
  )

export interface JWTPayload {
  userId: number
  username: string
  role: "ADMIN" | "COACH" | "STUDENT"
  iat?: number
  exp?: number
}

/** สร้าง JWT Token (หมดอายุ 7 วัน) */
export async function signToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret())
}

/** ถอดรหัสและตรวจสอบ JWT Token */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}
