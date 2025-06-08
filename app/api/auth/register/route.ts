import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Mock user database - In production, use a real database
const MOCK_USERS = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@shopbot.com",
    password: "demo123",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = MOCK_USERS.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser = {
      id: (MOCK_USERS.length + 1).toString(),
      name,
      email,
      password, // In production, hash this password
    }

    MOCK_USERS.push(newUser)

    // Create session
    const sessionData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      timestamp: Date.now(),
    }

    const sessionToken = btoa(JSON.stringify(sessionData))

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    })

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("shopbot-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
