import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt) {
      return new Response("Question is required", { status: 400 })
    }

    if (!process.env.XAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "API configuration error. Please contact support at cloudsns@outlook.com.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    try {
      const result = streamText({
        model: xai("grok-beta", {
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

      return result.toTextStreamResponse()
    } catch (streamError: any) {
      console.error("[v0] Error from xAI API:", streamError)

      // Check if it's a rate limit error (429)
      if (streamError.message?.includes("429") || streamError.statusCode === 429) {
        return new Response(
          JSON.stringify({
            error: "Service temporarily unavailable",
            message:
              "I'm currently experiencing high demand due to API limits. This usually means the service has reached its usage quota. Please try again later, or contact cloudsns@outlook.com for assistance.",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          },
        )
      }

      // Handle other API errors
      return new Response(
        JSON.stringify({
          error: "Failed to generate response",
          message:
            "I'm having trouble connecting to the AI service right now. Please try again in a moment, or contact cloudsns@outlook.com if the issue persists.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    console.error("[v0] Error in ask-eliza API:", error)

    return new Response(
      JSON.stringify({
        error: "Server error",
        message: "An unexpected error occurred. Please contact cloudsns@outlook.com for assistance.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
