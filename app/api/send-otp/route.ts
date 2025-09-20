import { type NextRequest, NextResponse } from "next/server"
import { sendEmail, emailTemplates, generateOTP, storeOTP } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    console.log("[v0] Send OTP request received:", { name, email })

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    console.log("[v0] RESEND_API_KEY available:", !!process.env.RESEND_API_KEY)

    // Generate and store OTP
    const otpCode = generateOTP()
    storeOTP(email, otpCode)
    console.log("[v0] OTP generated and stored:", { email, code: otpCode })

    // Send OTP email
    const otpTemplate = emailTemplates.otpVerification(name, otpCode)
    console.log("[v0] Attempting to send email to:", email)

    const emailSent = await sendEmail({
      to: email,
      subject: otpTemplate.subject,
      html: otpTemplate.html,
      text: otpTemplate.text,
    })

    console.log("[v0] Email send result:", emailSent)

    if (!emailSent) {
      console.log("[v0] Email sending failed")
      return NextResponse.json({ error: "Failed to send verification email. Please try again." }, { status: 500 })
    }

    console.log("[v0] OTP sent successfully:", { name, email, timestamp: new Date().toISOString() })

    return NextResponse.json(
      {
        message: "Verification code sent! Please check your email.",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Send OTP error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
