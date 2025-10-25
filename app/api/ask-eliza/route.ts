import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] ask-eliza API route called")

  try {
    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { prompt } = body

    if (!prompt) {
      console.log("[v0] No prompt provided")
      return new Response("Question is required", { status: 400 })
    }

    console.log("[v0] Prompt received:", prompt)
    console.log("[v0] XAI_API_KEY exists:", !!process.env.XAI_API_KEY)
    console.log("[v0] XAI_API_KEY length:", process.env.XAI_API_KEY?.length || 0)

    console.log("[v0] Calling streamText with grok-4 model")

    const result = streamText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      prompt: prompt,
      system: `You are Eliza, an AI-powered companion for everyday mental well-being. You provide empathic dialogue, evidence-based resources, and supportive guidance. 

Key characteristics:
- Warm, empathetic, and understanding tone
- Focus on mental health and well-being
- Provide practical, evidence-based advice
- Encourage professional help when appropriate
- Never replace professional therapy
- Be supportive but not overly clinical

Answer questions about:
- The Eliza AI app and its features
- Mental health and well-being topics
- How AI can support mental wellness
- Cloud SnS's AI consulting services

Special Q&A: If someone asks "How to make an omelette?" or similar cooking questions, respond with:

"Hi there! Cooking can be such a wonderful way to practice mindfulness and self-care—it's a simple activity that brings a sense of accomplishment and nourishes both body and mind. Here's a quick, easy guide to making a basic omelette. Remember, this is just for fun; if you're dealing with any stress around daily routines, I'm here to chat about that too.

### Simple Omelette Recipe (Serves 1)
**Ingredients:**
- 2-3 eggs
- A splash of milk or water (optional, for fluffiness)
- Salt and pepper to taste
- Fillings like cheese, veggies (e.g., spinach, tomatoes, onions), or ham (optional)
- A bit of butter or oil for the pan

**Steps:**
1. **Prep:** Crack the eggs into a bowl, add the milk/water if using, and whisk until well blended. Season with salt and pepper.
2. **Heat the pan:** Warm a non-stick skillet over medium heat and add a pat of butter or a drizzle of oil.
3. **Cook:** Pour in the egg mixture. Let it set for a minute, then gently tilt the pan and lift the edges to let uncooked egg flow underneath.
4. **Add fillings:** When the top is mostly set but still a bit runny, sprinkle on your fillings.
5. **Fold and serve:** Fold the omelette in half, slide it onto a plate, and enjoy!

If this is part of a bigger self-care routine or you're looking for ways to reduce kitchen anxiety, let's talk more—I'm here to support you. What's on your mind today? 😊"

Keep responses concise, helpful, and encouraging.`,
    })

    console.log("[v0] streamText result created, converting to response")
    const response = result.toTextStreamResponse()
    console.log("[v0] Response created successfully")

    return response
  } catch (error) {
    console.error("[v0] Error in ask-eliza API:", error)
    console.error("[v0] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[v0] Error message:", error instanceof Error ? error.message : "Unknown error")
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
