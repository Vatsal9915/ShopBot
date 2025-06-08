import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Mock user database - In production, use a real database
const MOCK_USERS = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@shopbot.com",
    password: "demo123", // In production, this would be hashed
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create session (in production, use proper JWT or session management)
    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      timestamp: Date.now(),
    }

    const sessionToken = btoa(JSON.stringify(sessionData))

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
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
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
