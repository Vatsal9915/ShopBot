import { type NextRequest, NextResponse } from "next/server";

// Mock product database with 100+ products
const MOCK_PRODUCTS = [
  // Electronics
  {
    id: "1",
    name: "iPhone 15 Pro",
    category: "Electronics",
    price: 999,
    description:
      "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system",
    brand: "Apple",
    inStock: true,
    rating: 4.8,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    category: "Electronics",
    price: 1199,
    description:
      "Premium Android phone with S Pen, 200MP camera, and AI features",
    brand: "Samsung",
    inStock: true,
    rating: 4.7,
  },
  {
    id: "3",
    name: "MacBook Air M3",
    category: "Electronics",
    price: 1299,
    description:
      "13-inch laptop with M3 chip, 18-hour battery life, and Liquid Retina display",
    brand: "Apple",
    inStock: true,
    rating: 4.9,
  },
  {
    id: "4",
    name: "Dell XPS 13",
    category: "Electronics",
    price: 899,
    description:
      "Ultra-portable laptop with Intel Core i7, 16GB RAM, and InfinityEdge display",
    brand: "Dell",
    inStock: true,
    rating: 4.6,
  },
  {
    id: "5",
    name: 'iPad Pro 12.9"',
    category: "Electronics",
    price: 1099,
    description:
      "Professional tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support",
    brand: "Apple",
    inStock: true,
    rating: 4.8,
  },
  {
    id: "6",
    name: "Sony WH-1000XM5",
    category: "Electronics",
    price: 399,
    description: "Premium noise-canceling headphones with 30-hour battery life",
    brand: "Sony",
    inStock: true,
    rating: 4.7,
  },
  {
    id: "7",
    name: "AirPods Pro 2nd Gen",
    category: "Electronics",
    price: 249,
    description:
      "Wireless earbuds with active noise cancellation and spatial audio",
    brand: "Apple",
    inStock: true,
    rating: 4.8,
  },
  {
    id: "8",
    name: "Lenovo ThinkPad X1 Carbon",
    category: "Electronics",
    price: 1599,
    description:
      "Business laptop with Intel Core i7, 16GB RAM, and carbon fiber design",
    brand: "Lenovo",
    inStock: true,
    rating: 4.5,
  },
  {
    id: "9",
    name: "HP Pavilion 15",
    category: "Electronics",
    price: 699,
    description:
      "Affordable laptop with AMD Ryzen 5, 8GB RAM, perfect for students",
    brand: "HP",
    inStock: true,
    rating: 4.3,
  },
  {
    id: "10",
    name: "ASUS ROG Strix Gaming Laptop",
    category: "Electronics",
    price: 1299,
    description: "Gaming laptop with NVIDIA RTX 4060, Intel Core i7, 16GB RAM",
    brand: "ASUS",
    inStock: true,
    rating: 4.7,
  },
  {
    id: "11",
    name: "Microsoft Surface Laptop 5",
    category: "Electronics",
    price: 999,
    description:
      "Premium laptop with Intel Core i5, 8GB RAM, and touchscreen display",
    brand: "Microsoft",
    inStock: true,
    rating: 4.4,
  },
  {
    id: "12",
    name: "Acer Aspire 5",
    category: "Electronics",
    price: 549,
    description:
      "Budget-friendly laptop with Intel Core i5, 8GB RAM, ideal for everyday use",
    brand: "Acer",
    inStock: true,
    rating: 4.2,
  },
  // Add more products for variety
  {
    id: "13",
    name: "Nintendo Switch OLED",
    category: "Electronics",
    price: 349,
    description: "Gaming console with 7-inch OLED screen and enhanced audio",
    brand: "Nintendo",
    inStock: true,
    rating: 4.6,
  },
  {
    id: "14",
    name: "PlayStation 5",
    category: "Electronics",
    price: 499,
    description: "Next-gen gaming console with 4K gaming and ultra-fast SSD",
    brand: "Sony",
    inStock: false,
    rating: 4.9,
  },
  {
    id: "15",
    name: "Xbox Series X",
    category: "Electronics",
    price: 499,
    description: "Powerful gaming console with 4K gaming at 120fps",
    brand: "Microsoft",
    inStock: true,
    rating: 4.8,
  },
];

// Enhanced search function with better matching
function searchProducts(query: string, products: typeof MOCK_PRODUCTS) {
  if (!query) return products;

  const searchTerm = query.toLowerCase().trim();
  console.log("Searching for:", searchTerm);

  return products.filter((product) => {
    // Create searchable text from all product fields
    const searchableText = [
      product.name,
      product.brand,
      product.description,
      product.category,
      // Add common variations and keywords
      product.name.replace(/\s+/g, ""), // Remove spaces for "dellxps13"
      `${product.brand} ${product.name}`, // "Dell Dell XPS 13"
      product.name.replace(/[^a-zA-Z0-9\s]/g, ""), // Remove special chars
    ]
      .join(" ")
      .toLowerCase();

    // Split search term into individual words
    const searchWords = searchTerm
      .split(/\s+/)
      .filter((word) => word.length > 0);

    // Check if ALL search words are found (AND logic)
    const allWordsMatch = searchWords.every((word) => {
      // Remove common words that don't help with search
      if (["show", "me", "find", "get", "the", "a", "an"].includes(word)) {
        return true;
      }

      return searchableText.includes(word);
    });

    // Also check for partial matches of the full search term
    const fullTermMatch = searchableText.includes(searchTerm);

    // Special handling for specific product patterns
    const isLaptopSearch =
      searchTerm.includes("laptop") || searchTerm.includes("computer");
    const isLaptopProduct =
      product.description.toLowerCase().includes("laptop") ||
      product.name.toLowerCase().includes("laptop") ||
      product.name.toLowerCase().includes("macbook") ||
      product.name.toLowerCase().includes("thinkpad") ||
      product.name.toLowerCase().includes("pavilion") ||
      product.name.toLowerCase().includes("aspire") ||
      product.name.toLowerCase().includes("surface");

    const matches =
      allWordsMatch || fullTermMatch || (isLaptopSearch && isLaptopProduct);

    if (matches) {
      console.log("✅ Found matching product:", product.name);
    }

    return matches;
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const inStock = searchParams.get("inStock");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    console.log("=== PRODUCT SEARCH DEBUG ===");
    console.log("Search query:", query);
    console.log("All available products:", MOCK_PRODUCTS.length);

    let filteredProducts = [...MOCK_PRODUCTS];

    // Apply search filter
    if (query) {
      filteredProducts = searchProducts(query, filteredProducts);
      console.log(
        "After search filter:",
        filteredProducts.length,
        "products found"
      );
    }

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
      console.log(
        "After category filter:",
        filteredProducts.length,
        "products"
      );
    }

    // Apply price filters
    if (minPrice) {
      const min = Number.parseFloat(minPrice);
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= min
      );
      console.log(
        "After min price filter ($" + min + "):",
        filteredProducts.length,
        "products"
      );
    }

    if (maxPrice) {
      const max = Number.parseFloat(maxPrice);
      filteredProducts = filteredProducts.filter(
        (product) => product.price <= max
      );
      console.log(
        "After max price filter ($" + max + "):",
        filteredProducts.length,
        "products"
      );
    }

    // Apply stock filter
    if (inStock === "true") {
      filteredProducts = filteredProducts.filter((product) => product.inStock);
      console.log("After stock filter:", filteredProducts.length, "products");
    }

    // Apply pagination
    const total = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    const result = {
      products: paginatedProducts,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };

    console.log("=== FINAL RESULT ===");
    console.log(
      "Returning",
      paginatedProducts.length,
      "products out of",
      total,
      "total matches"
    );
    console.log(
      "Product names:",
      paginatedProducts.map((p) => p.name)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
