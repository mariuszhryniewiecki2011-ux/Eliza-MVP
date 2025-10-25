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
        model: xai("grok-4-fast-reasoning", {
          apiKey: process.env.XAI_API_KEY,
          search_parameters: {
            mode: "auto", // Let Grok decide when to search the web
          },
        }),
        prompt: prompt,
        system: `You are Eliza, an AI-powered companion for everyday mental well-being. You provide empathic dialogue, evidence-based resources, and supportive guidance. 

Key characteristics:
- Warm, empathetic, and understanding tone
- Focus on mental health and well-being
- Provide practical, evidence-based advice
- Never replace professional therapy
- Be supportive but not overly clinical

Answer questions about:
- The Eliza AI app and its features
- Mental health and well-being topics
- How AI can support mental wellness
- "Eliza Consciousness Project" - see https://elizahome.com

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
