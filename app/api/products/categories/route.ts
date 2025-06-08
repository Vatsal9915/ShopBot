import { type NextRequest, NextResponse } from "next/server"

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Books",
  "Sports & Outdoors",
  "Beauty & Personal Care",
  "Pet Supplies",
  "Tools & Hardware",
  "Automotive",
  "Baby & Kids",
  "Office Supplies",
  "Musical Instruments",
  "Health & Wellness",
  "Jewelry & Watches",
  "Toys & Games",
  "Garden & Outdoor",
  "Craft & Hobby",
  "Food & Beverages",
  "Travel & Luggage",
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      categories: CATEGORIES,
    })
  } catch (error) {
    console.error("Categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
