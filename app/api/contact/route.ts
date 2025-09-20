import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    const contactTemplate = emailTemplates.contact(name, email, message)
    const emailSent = await sendEmail({
      to: "cloudsns@outlook.com", // Send to business email
      subject: contactTemplate.subject,
      html: contactTemplate.html,
      text: contactTemplate.text,
    })

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 })
    }

    console.log("Contact message sent successfully:", {
      name,
      email,
      message: message.substring(0, 100) + "...",
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        message: "Message sent successfully! We'll get back to you soon.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
