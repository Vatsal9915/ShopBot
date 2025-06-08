"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, MessageCircle, Search, Shield } from "lucide-react"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        const data = await response.json()
        setIsAuthenticated(data.authenticated)
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/chat")
    } else {
      router.push("/login")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">ShopBot</h1>
            </div>
            <div className="flex space-x-4">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" onClick={() => router.push("/chat")}>
                    Open Chat
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" })
                      setIsAuthenticated(false)
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => router.push("/login")}>
                    Login
                  </Button>
                  <Button onClick={() => router.push("/register")}>Sign Up</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">Your AI Shopping Assistant</h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover products, get recommendations, and shop smarter with our intelligent chatbot. Find exactly what
            you're looking for with natural conversation.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button size="lg" onClick={handleGetStarted} className="w-full sm:w-auto">
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Search className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Smart Search</CardTitle>
                <CardDescription>
                  Find products using natural language. Just describe what you're looking for.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MessageCircle className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>Conversational Shopping</CardTitle>
                <CardDescription>
                  Chat naturally with our AI to get personalized product recommendations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your conversations and data are secure with our authentication system.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">1000+</div>
              <div className="text-gray-600">Products Available</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-gray-600">AI Assistant</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
