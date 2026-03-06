import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { signJwt } from "@/lib/jwt"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    // check input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    // find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // check status
    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { success: false, error: "Account suspended" },
        { status: 403 }
      )
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // create jwt
    const token = signJwt({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // remove password
    const { password: _pwd, ...userData } = user

    const response = NextResponse.json({
      success: true,
      token,
      user: userData,
    })

    // set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}