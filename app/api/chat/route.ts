import type { NextRequest } from "next/server";

// Enhanced conversation context analyzer
function analyzeConversationContext(messages: any[]): {
  hasProducts: boolean;
  lastProductQuery: string;
  lastProducts: any[];
  conversationType: string;
} {
  let hasProducts = false;
  let lastProductQuery = "";
  let lastProducts: any[] = [];
  let conversationType = "general";

  // Look through recent messages for context
  for (
    let i = messages.length - 1;
    i >= Math.max(0, messages.length - 6);
    i--
  ) {
    const message = messages[i];
    if (message.role === "assistant" && message.content.includes("I found")) {
      hasProducts = true;
      conversationType = "product_search";

      // Extract the original query
      const match = message.content.match(/I found \d+ products for "([^"]+)"/);
      if (match) {
        lastProductQuery = match[1];
      }

      // Extract product names from the response
      const productMatches = message.content.match(/🔹 \*\*([^*]+)\*\*/g);
      if (productMatches) {
        lastProducts = productMatches.map((match) =>
          match.replace(/🔹 \*\*|\*\*/g, "")
        );
      }
      break;
    }
  }

  return { hasProducts, lastProductQuery, lastProducts, conversationType };
}

// Advanced question type classifier
function classifyQuestion(
  message: string,
  context: any
): {
  type: string;
  intent: string;
  entities: string[];
  confidence: number;
} {
  const lowerMessage = message.toLowerCase().trim();
  const words = lowerMessage.split(/\s+/);

  // Extract entities (brands, product types, etc.)
  const entities = extractEntities(lowerMessage);

  // Question type patterns
  const patterns = {
    // Follow-up questions
    followup: [
      /^(yes|yeah|sure|ok|okay|yep|yup)$/,
      /^(no|nope|not really|not interested)$/,
      /(tell me more|more details|more info|show more|elaborate)/,
      /(which one|what about|how about|what's the difference)/,
    ],

    // Comparison questions
    comparison: [
      /(compare|vs|versus|difference between|better than)/,
      /(which is better|which should i choose|what's the difference)/,
      /(pros and cons|advantages|disadvantages)/,
    ],

    // Specific product questions
    specific_product: [
      /(tell me about|more about|details about|info about)/,
      /(specs|specifications|features|review)/,
      /(price of|cost of|how much)/,
    ],

    // Recommendation questions
    recommendation: [
      /(recommend|suggest|best|good|what should)/,
      /(looking for|need|want|searching for)/,
      /(gift|present|for someone)/,
    ],

    // Availability questions
    availability: [
      /(in stock|available|can i buy|do you have)/,
      /(when will|delivery|shipping|order)/,
    ],

    // General questions
    general: [
      /(hello|hi|hey|good morning|good afternoon)/,
      /(help|what can you do|how does this work)/,
      /(thank you|thanks|bye|goodbye)/,
    ],

    // Product search
    product_search: [
      /(show me|find|search|look for)/,
      /(laptop|phone|headphone|gaming|console)/,
      /(under|over|between|budget|cheap|expensive)/,
    ],
  };

  // Calculate confidence scores for each type
  let bestMatch = { type: "general", confidence: 0 };

  for (const [type, regexList] of Object.entries(patterns)) {
    let confidence = 0;
    for (const regex of regexList) {
      if (regex.test(lowerMessage)) {
        confidence += 0.3;
      }
    }

    // Boost confidence based on context
    if (type === "followup" && context.hasProducts) {
      confidence += 0.4;
    }

    if (confidence > bestMatch.confidence) {
      bestMatch = { type, confidence };
    }
  }

  // Determine intent based on type and content
  const intent = determineIntent(bestMatch.type, lowerMessage, context);

  return {
    type: bestMatch.type,
    intent,
    entities,
    confidence: bestMatch.confidence,
  };
}

// Extract entities (brands, product types, etc.)
function extractEntities(message: string): string[] {
  const entities = [];

  // Brand entities
  const brands = [
    "apple",
    "samsung",
    "dell",
    "hp",
    "lenovo",
    "sony",
    "microsoft",
    "asus",
    "acer",
    "nintendo",
  ];
  const productTypes = [
    "laptop",
    "phone",
    "headphone",
    "console",
    "tablet",
    "gaming",
    "macbook",
    "iphone",
    "ipad",
  ];
  const priceTerms = [
    "under",
    "over",
    "budget",
    "cheap",
    "expensive",
    "affordable",
  ];

  brands.forEach((brand) => {
    if (message.includes(brand)) entities.push(`brand:${brand}`);
  });

  productTypes.forEach((type) => {
    if (message.includes(type)) entities.push(`product:${type}`);
  });

  priceTerms.forEach((term) => {
    if (message.includes(term)) entities.push(`price:${term}`);
  });

  // Extract price numbers
  const priceMatch = message.match(/\$?(\d+)/g);
  if (priceMatch) {
    priceMatch.forEach((price) =>
      entities.push(`amount:${price.replace("$", "")}`)
    );
  }

  return entities;
}

// Determine specific intent
function determineIntent(type: string, message: string, context: any): string {
  switch (type) {
    case "followup":
      if (/^(yes|yeah|sure|ok|okay)$/.test(message)) return "affirmative";
      if (/^(no|nope|not really)$/.test(message)) return "negative";
      if (/(more details|tell me more)/.test(message)) return "more_info";
      return "clarification";

    case "comparison":
      return "compare_products";

    case "specific_product":
      if (/(price|cost|how much)/.test(message)) return "price_inquiry";
      if (/(specs|specifications|features)/.test(message))
        return "specs_inquiry";
      return "product_details";

    case "recommendation":
      if (/(gift|present)/.test(message)) return "gift_recommendation";
      if (/(best|good)/.test(message)) return "best_product";
      return "general_recommendation";

    case "availability":
      return "stock_check";

    case "general":
      if (/(hello|hi|hey)/.test(message)) return "greeting";
      if (/(help|what can you do)/.test(message)) return "help";
      if (/(thank|bye)/.test(message)) return "closing";
      return "general_inquiry";

    default:
      return "product_search";
  }
}

// Enhanced response generator based on question classification
async function generateIntelligentResponse(
  classification: any,
  message: string,
  context: any,
  baseUrl: string
): Promise<string> {
  console.log("Question classification:", classification);
  console.log("Context:", context);

  switch (classification.type) {
    case "followup":
      return handleFollowUpQuestion(classification.intent, message, context);

    case "comparison":
      return handleComparisonQuestion(message, context, baseUrl);

    case "specific_product":
      return handleSpecificProductQuestion(
        classification.intent,
        message,
        context,
        baseUrl
      );

    case "recommendation":
      return handleRecommendationQuestion(
        classification.intent,
        message,
        context,
        baseUrl
      );

    case "availability":
      return handleAvailabilityQuestion(message, context, baseUrl);

    case "general":
      return handleGeneralQuestion(classification.intent, message);

    case "product_search":
    default:
      return handleProductSearch(message, baseUrl);
  }
}

// Handle follow-up questions
function handleFollowUpQuestion(
  intent: string,
  message: string,
  context: any
): string {
  switch (intent) {
    case "affirmative":
      if (context.hasProducts) {
        return `Great! I'd be happy to provide more details about those ${
          context.lastProductQuery || "products"
        }. Here's what I can help you with:

🔹 **Detailed Specifications**: Technical specs and features
🔹 **Price Comparisons**: Compare with similar products
🔹 **Customer Reviews**: What other customers are saying
🔹 **Alternatives**: Similar products you might like
🔹 **Availability**: Stock status and delivery options

Which product interests you most? You can ask:
• "Tell me more about the ${context.lastProducts[0] || "first one"}"
• "Compare the ${context.lastProducts[0]} and ${
          context.lastProducts[1] || "second one"
        }"
• "What are the specs of the ${context.lastProducts[0] || "Dell XPS 13"}?"
• "Show me similar products"`;
      }
      return "I'd be happy to help! What specific product are you interested in?";

    case "negative":
      return `No problem! Let me help you find something better. Could you tell me:

🔹 **What specifically are you looking for?** (brand, features, etc.)
🔹 **What's your budget range?**
🔹 **What will you use it for?** (work, gaming, school, etc.)
🔹 **Any specific requirements?** (size, performance, etc.)

Or try a different search like:
• "Show me gaming laptops under $1500"
• "I need a laptop for video editing"
• "Budget phones with good cameras"
• "Best headphones for music"`;

    case "more_info":
      if (context.lastProducts.length > 0) {
        return `I'd be happy to provide more details! Which product would you like to know more about?

${context.lastProducts
  .map((product, index) => `${index + 1}. **${product}**`)
  .join("\n")}

You can ask:
• "Tell me about the ${context.lastProducts[0]}"
• "What are the specs of option ${Math.min(2, context.lastProducts.length)}?"
• "Compare options 1 and 2"
• "Show me reviews for the ${context.lastProducts[0]}"`;
      }
      return "What specific information would you like to know more about?";

    default:
      return "Could you clarify what you'd like to know? I'm here to help with product information, comparisons, and recommendations!";
  }
}

// Handle comparison questions
async function handleComparisonQuestion(
  message: string,
  context: any,
  baseUrl: string
): Promise<string> {
  // If we have products from previous search, offer to compare them
  if (context.lastProducts.length >= 2) {
    return `I can help you compare products! From your previous search, I can compare:

${context.lastProducts
  .slice(0, 3)
  .map((product, index) => `${index + 1}. **${product}**`)
  .join("\n")}

Here's what I can compare for you:
🔹 **Price & Value**: Which offers the best bang for your buck
🔹 **Performance**: Processing power, speed, capabilities
🔹 **Features**: What's included and what's different
🔹 **User Reviews**: What customers prefer
🔹 **Use Cases**: Which is better for your specific needs

Which products would you like me to compare? You can say:
• "Compare the ${context.lastProducts[0]} and ${context.lastProducts[1]}"
• "What's the difference between options 1 and 2?"
• "Which is better for gaming/work/students?"`;
  }

  // Try to extract product names from the comparison request
  const productSearch = await searchForComparison(message, baseUrl);
  if (productSearch) {
    return productSearch;
  }

  return `I'd be happy to help you compare products! To give you the best comparison, could you tell me:

🔹 **Which specific products** you want to compare?
🔹 **What aspects** are most important to you? (price, performance, features)
🔹 **What will you use it for?** (work, gaming, general use)

For example, you could ask:
• "Compare iPhone 15 Pro and Samsung Galaxy S24"
• "Dell XPS 13 vs MacBook Air"
• "Best gaming laptop under $1500 vs $2000"
• "Which is better for video editing?"`;
}

// Handle specific product questions
async function handleSpecificProductQuestion(
  intent: string,
  message: string,
  context: any,
  baseUrl: string
): Promise<string> {
  // Try to extract product name from the message
  const productName = extractProductNameFromMessage(message, context);

  if (productName) {
    switch (intent) {
      case "price_inquiry":
        return `Let me check the price for the ${productName}...

I'll search for current pricing and availability. You can also ask:
• "Is the ${productName} on sale?"
• "Compare ${productName} prices with similar products"
• "Show me ${productName} deals and discounts"`;

      case "specs_inquiry":
        return `I'll get you the detailed specifications for the ${productName}:

🔹 **Technical Specs**: Processor, RAM, storage, display
🔹 **Performance**: Benchmarks and real-world performance
🔹 **Features**: What's included and special capabilities
🔹 **Connectivity**: Ports, wireless, compatibility
🔹 **Physical**: Dimensions, weight, build quality

Would you like me to focus on any specific aspect of the specs?`;

      default:
        // Search for the specific product
        return await handleProductSearch(productName, baseUrl);
    }
  }

  return `I'd be happy to provide product details! Which specific product are you interested in?

You can ask about:
🔹 **Specifications**: "What are the specs of the Dell XPS 13?"
🔹 **Pricing**: "How much is the iPhone 15 Pro?"
🔹 **Features**: "Tell me about the MacBook Air features"
🔹 **Reviews**: "What do customers say about the Sony headphones?"

What product would you like to know more about?`;
}

// Handle recommendation questions
async function handleRecommendationQuestion(
  intent: string,
  message: string,
  context: any,
  baseUrl: string
): Promise<string> {
  switch (intent) {
    case "gift_recommendation":
      return `I'd love to help you find the perfect gift! To give you the best recommendations, tell me:

🔹 **Who is it for?** (tech enthusiast, student, gamer, professional, etc.)
🔹 **What's your budget?** (under $100, $100-500, $500+)
🔹 **What are they interested in?** (gaming, music, work, fitness, etc.)
🔹 **Any specific preferences?** (brand, size, color)

Popular gift categories:
• **Tech Gifts**: Headphones, smartwatches, tablets ($50-500)
• **Gaming**: Consoles, accessories, games ($60-500)
• **Professional**: Laptops, monitors, accessories ($200-2000)
• **Audio**: Speakers, headphones, earbuds ($30-400)

What type of person are you shopping for?`;

    case "best_product":
      return `I can help you find the best products! What category are you looking for?

🔹 **Best Laptops**: For work, gaming, students, or professionals
🔹 **Best Phones**: Latest models, budget options, or specific features
🔹 **Best Headphones**: Music, gaming, noise-canceling, or budget
🔹 **Best Gaming**: Consoles, accessories, or gaming laptops
🔹 **Best Value**: Great products at affordable prices

You can ask:
• "What's the best laptop under $1000?"
• "Best phone for photography"
• "Best gaming headphones"
• "Best value tablets for students"`;

    default:
      // Try to extract what they're looking for and search
      return await handleProductSearch(message, baseUrl);
  }
}

// Handle availability questions
async function handleAvailabilityQuestion(
  message: string,
  context: any,
  baseUrl: string
): Promise<string> {
  const productName = extractProductNameFromMessage(message, context);

  if (productName) {
    // Search for the product to check availability
    const searchResult = await handleProductSearch(productName, baseUrl);
    return (
      searchResult +
      "\n\nFor specific delivery times and shipping options, I can help you with:\n🔹 **Stock Status**: Real-time availability\n🔹 **Delivery Options**: Standard, express, same-day\n🔹 **Store Pickup**: Check local store availability"
    );
  }

  return `I can check availability for any product! Just tell me what you're looking for:

🔹 **Specific Product**: "Is the iPhone 15 Pro in stock?"
🔹 **Category**: "Do you have gaming laptops available?"
🔹 **Brand**: "What Dell products are in stock?"

I can also help with:
• Delivery timeframes
• Store pickup options
• Restock notifications
• Alternative products if something is out of stock

What product would you like me to check?`;
}

// Handle general questions
function handleGeneralQuestion(intent: string, message: string): string {
  switch (intent) {
    case "greeting":
      return `Hello! 👋 Welcome to ShopBot! I'm your AI shopping assistant, and I'm excited to help you find exactly what you're looking for.

I can help you with:
🔹 **Product Search**: Find specific items by name, brand, or category
🔹 **Recommendations**: Get personalized suggestions based on your needs
🔹 **Comparisons**: Compare different products and features
🔹 **Detailed Information**: Specs, reviews, pricing, and availability
🔹 **Shopping Guidance**: Budget advice, gift ideas, and more

What can I help you find today? Try asking:
• "Show me laptops under $1000"
• "I need headphones for gaming"
• "What's the best phone for photography?"
• "Compare iPhone and Samsung phones"`;

    case "help":
      return `I'm here to help you shop smarter! Here's what I can do:

🔹 **Search Products**: "Show me gaming laptops" or "Find wireless headphones"
🔹 **Get Recommendations**: "Best laptop for students" or "Gift ideas under $200"
🔹 **Compare Products**: "iPhone vs Samsung" or "Compare these laptops"
🔹 **Product Details**: "Tell me about the Dell XPS 13" or "MacBook Air specs"
🔹 **Check Availability**: "Is the PlayStation 5 in stock?"
🔹 **Price Information**: "How much is the iPhone 15?" or "Budget options"

Just ask me naturally! I understand questions like:
• "I need a laptop for video editing under $1500"
• "What's the difference between these headphones?"
• "Show me the best gaming consoles"
• "I'm looking for a gift for a tech lover"

What would you like to explore?`;

    case "closing":
      return `Thank you for using ShopBot! 😊 

I hope I was able to help you find what you were looking for. If you need any more assistance with:
🔹 Product recommendations
🔹 Price comparisons  
🔹 Technical specifications
🔹 Availability checks

Just ask! I'm always here to help you make the best shopping decisions.

Happy shopping! 🛍️`;

    default:
      return `I'm here to help you with all your shopping needs! Whether you're looking for:

🔹 **Electronics**: Laptops, phones, tablets, headphones
🔹 **Gaming**: Consoles, accessories, gaming gear
🔹 **Home & Office**: Appliances, furniture, supplies
🔹 **Gifts**: Perfect presents for any occasion

Just tell me what you're looking for, and I'll help you find the best options!

What can I help you shop for today?`;
  }
}

// Extract product name from message considering context
function extractProductNameFromMessage(message: string, context: any): string {
  const lowerMessage = message.toLowerCase();

  // Check if message refers to products from context
  if (context.lastProducts.length > 0) {
    // Look for references like "the first one", "option 1", "the Dell"
    if (/(first|1st|option 1|the first)/.test(lowerMessage)) {
      return context.lastProducts[0];
    }
    if (/(second|2nd|option 2|the second)/.test(lowerMessage)) {
      return context.lastProducts[1] || context.lastProducts[0];
    }
    if (/(third|3rd|option 3|the third)/.test(lowerMessage)) {
      return context.lastProducts[2] || context.lastProducts[0];
    }

    // Look for partial product name matches
    for (const product of context.lastProducts) {
      const productWords = product.toLowerCase().split(" ");
      if (
        productWords.some(
          (word) => lowerMessage.includes(word) && word.length > 2
        )
      ) {
        return product;
      }
    }
  }

  // Extract product names from the message itself
  const productPatterns = [
    /(?:dell\s+)?xps\s*\d*/i,
    /macbook\s*(?:air|pro)?/i,
    /iphone\s*\d*\s*(?:pro|plus|mini)?/i,
    /samsung\s*galaxy\s*\w*/i,
    /thinkpad\s*\w*/i,
    /surface\s*(?:laptop|pro)?\s*\d*/i,
    /airpods\s*(?:pro)?/i,
    /playstation\s*\d*/i,
    /xbox\s*(?:series\s*[xs])?/i,
  ];

  for (const pattern of productPatterns) {
    const match = message.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return "";
}

// Search for products for comparison
async function searchForComparison(
  message: string,
  baseUrl: string
): Promise<string | null> {
  // Extract potential product names for comparison
  const vsPattern = /(.+?)\s+(?:vs|versus|compared?\s+to|against)\s+(.+)/i;
  const match = message.match(vsPattern);

  if (match) {
    const product1 = match[1].trim();
    const product2 = match[2].trim();

    // Search for both products
    const search1 = await handleProductSearch(product1, baseUrl);
    const search2 = await handleProductSearch(product2, baseUrl);

    return `I'll help you compare ${product1} and ${product2}!

**${product1} Results:**
${search1}

**${product2} Results:**
${search2}

Would you like me to provide a detailed comparison of specific models from these results?`;
  }

  return null;
}

// Handle product search (existing function, enhanced)
async function handleProductSearch(
  message: string,
  baseUrl: string
): Promise<string> {
  try {
    const productSearchUrl = `${baseUrl}/api/products?q=${encodeURIComponent(
      message
    )}&limit=5`;
    console.log("Searching products at:", productSearchUrl);

    const searchResponse = await fetch(productSearchUrl);
    const searchData = await searchResponse.json();

    console.log("Search results:", searchData);

    if (searchData.products && searchData.products.length > 0) {
      return `I found ${
        searchData.products.length
      } products for "${message}":\n\n${searchData.products
        .map(
          (product: any) =>
            `🔹 **${product.name}** by ${product.brand}\n   💰 $${
              product.price
            }\n   📝 ${product.description}\n   ${
              product.inStock ? "✅ In Stock" : "❌ Out of Stock"
            }\n`
        )
        .join(
          "\n"
        )}\n\nWould you like more details about any of these products? You can ask:\n• "Tell me more about the ${
        searchData.products[0].name
      }"\n• "Compare the first two options"\n• "What are the specs of the ${
        searchData.products[0].name
      }?"\n• "Show me similar products"`;
    }

    return generateHelpfulResponse(message);
  } catch (error) {
    console.error("Product search error:", error);
    return generateHelpfulResponse(message);
  }
}

// Generate helpful responses (existing function)
function generateHelpfulResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("laptop") || lowerMessage.includes("computer")) {
    return `I'd be happy to help you find the perfect laptop! Here are some suggestions:\n\n🔹 **Budget laptops** ($500-800): Great for students and basic tasks\n🔹 **Mid-range laptops** ($800-1200): Perfect for work and light gaming\n🔹 **Premium laptops** ($1200+): High-performance for professionals\n\nTry searching for specific brands like "Dell", "HP", "Apple MacBook", or "Lenovo" to see our available options!`;
  }

  if (
    lowerMessage.includes("phone") ||
    lowerMessage.includes("iphone") ||
    lowerMessage.includes("samsung")
  ) {
    return `Looking for a new phone? Here's what we offer:\n\n🔹 **iPhone models**: Latest Apple smartphones with iOS\n🔹 **Samsung Galaxy**: Premium Android phones with great cameras\n🔹 **Budget phones**: Affordable options under $300\n\nTry searching for "iPhone", "Samsung Galaxy", or "phone under $500" to see our selection!`;
  }

  return `I couldn't find specific products for "${message}", but I'm here to help! Here are our main categories:\n\n🔹 **Electronics**: Laptops, phones, tablets, headphones\n🔹 **Gaming**: Consoles, games, accessories\n🔹 **Accessories**: Cases, chargers, cables\n🔹 **Home & Garden**: Appliances, smart home devices\n\nTry searching for specific products like "iPhone", "laptop", "headphones", or browse by category!`;
}

// Main API handler
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1]?.content || "";

    console.log("=== INTELLIGENT CHAT ANALYSIS ===");
    console.log("Received messages:", messages.length);
    console.log("Latest message:", latestMessage);

    // Analyze conversation context
    const context = analyzeConversationContext(messages);
    console.log("Conversation context:", context);

    // Classify the question
    const classification = classifyQuestion(latestMessage, context);
    console.log("Question classification:", classification);

    // Get the base URL from the request
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    // Generate intelligent response
    const response = await generateIntelligentResponse(
      classification,
      latestMessage,
      context,
      baseUrl
    );

    console.log("Generated response type:", classification.type);
    console.log("Response length:", response.length);

    return new Response(response, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      "Sorry, I'm having technical difficulties. Please try again.",
      { status: 500 }
    );
  }
}
