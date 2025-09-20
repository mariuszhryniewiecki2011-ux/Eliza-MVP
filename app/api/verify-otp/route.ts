import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, emailTemplates, verifyOTP } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, otp } = await request.json()

    if (!name || !email || !otp) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Verify OTP
    const isValidOTP = verifyOTP(email, otp)

    if (!isValidOTP) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
    }

    // Send welcome confirmation email
    const welcomeTemplate = emailTemplates.welcomeConfirmation(name)
    const emailSent = await sendEmail({
      to: email,
      subject: welcomeTemplate.subject,
      html: welcomeTemplate.html,
      text: welcomeTemplate.text,
    })

    if (!emailSent) {
      console.error("Failed to send welcome email, but OTP was verified")
    }

    // Store subscription (in production, save to database)
    console.log("New verified subscription:", { name, email, timestamp: new Date().toISOString() })

    return NextResponse.json(
      {
        message: "Email verified successfully! Welcome to the early access list.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
