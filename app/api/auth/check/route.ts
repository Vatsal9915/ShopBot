import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("shopbot-session")

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false })
    }

    // In a real app, you'd validate the session token against a database
    // For demo purposes, we'll decode the simple session data
    try {
      const sessionData = JSON.parse(atob(sessionCookie.value))

      return NextResponse.json({
        authenticated: true,
        user: {
          id: sessionData.id,
          name: sessionData.name,
          email: sessionData.email,
        },
      })
    } catch (error) {
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ authenticated: false })
  }
}
