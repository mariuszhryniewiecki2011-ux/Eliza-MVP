// Email service configuration and utilities
import { Resend } from "resend"

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

// Generate OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store OTP temporarily (in production, use Redis or database)
const otpStore = new Map<string, { code: string; expires: number }>()

export function storeOTP(email: string, code: string): void {
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutes
  otpStore.set(email, { code, expires })
}

export function verifyOTP(email: string, code: string): boolean {
  const stored = otpStore.get(email)
  if (!stored) return false

  if (Date.now() > stored.expires) {
    otpStore.delete(email)
    return false
  }

  if (stored.code === code) {
    otpStore.delete(email)
    return true
  }

  return false
}

// Email templates
export const emailTemplates = {
  contact: (name: string, email: string, message: string) => ({
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Contact Form Submission</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px;">${message}</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This message was sent from the Cloud SnS contact form.
        </p>
      </div>
    `,
    text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`,
  }),

  otpVerification: (name: string, code: string) => ({
    subject: "Verify your email for Cloud SnS Early Access",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Welcome to Cloud SnS Early Access!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for joining our early access list for Eliza AI. Please verify your email address using the code below:</p>
        <div style="background: #7c3aed; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="margin: 0; font-size: 32px; letter-spacing: 4px;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p style="color: #64748b; font-size: 14px;">
          Best regards,<br>
          The Cloud SnS Team
        </p>
      </div>
    `,
    text: `Welcome to Cloud SnS Early Access!\n\nHi ${name},\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
  }),

  welcomeConfirmation: (name: string) => ({
    subject: "Welcome to Cloud SnS Early Access!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Welcome aboard, ${name}!</h2>
        <p>Your email has been verified and you're now on our early access list for Eliza AI.</p>
        <p>We'll keep you updated on our progress and let you know as soon as Eliza AI is ready for testing.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #7c3aed;">What's Next?</h3>
          <ul>
            <li>We'll send you updates on Eliza AI development</li>
            <li>You'll get early access when we launch the beta</li>
            <li>Your feedback will help shape the final product</li>
          </ul>
        </div>
        <p>Thank you for your interest in mental health technology!</p>
        <p style="color: #64748b; font-size: 14px;">
          Best regards,<br>
          The Cloud SnS Team
        </p>
      </div>
    `,
    text: `Welcome aboard, ${name}!\n\nYour email has been verified and you're now on our early access list for Eliza AI.\n\nWe'll keep you updated on our progress and let you know as soon as Eliza AI is ready for testing.`,
  }),
}

// Real email sending function using Resend
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  try {
    console.log("[v0] Starting email send process...")

    if (!process.env.RESEND_API_KEY) {
      console.error("[v0] RESEND_API_KEY environment variable is not set")
      return false
    }

    console.log("[v0] RESEND_API_KEY is available")

    const resendClient = new Resend(process.env.RESEND_API_KEY)

    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev"
    console.log("[v0] Using from email:", fromEmail)

    const emailData = {
      from: `Cloud SnS <${fromEmail}>`,
      to: template.to,
      subject: template.subject,
      html: template.html,
      ...(template.text && { text: template.text }),
    }

    console.log("[v0] Email data prepared:", {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      hasHtml: !!emailData.html,
      hasText: !!emailData.text,
    })

    const response = await resendClient.emails.send(emailData)

    console.log("[v0] Resend API response:", response)

    if (response.error) {
      console.error("[v0] Email sending error:", response.error)
      return false
    }

    console.log("[v0] Email sent successfully:", { id: response.data?.id, to: template.to })
    return true
  } catch (error) {
    console.error("[v0] Email service error:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    return false
  }
}
