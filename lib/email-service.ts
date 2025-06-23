import { ENV_CONFIG, validateEmailJSConfig } from "./env-config"

interface EmailData {
  name: string
  email: string
  phone: string
  bookingDate?: string
  address?: string
  message: string
  bandName: string
  bandEmail: string
}

function ensureConfigIsValid() {
  if (!validateEmailJSConfig()) {
    throw new Error(
      "EmailJS configuration is incomplete. Please set up your EmailJS credentials in environment variables.",
    )
  }
}

export async function sendInquiryEmail(data: EmailData): Promise<boolean> {
  try {
    // Validate configuration
    ensureConfigIsValid()

    const { publicPk, serviceId, inquiryTemplateId, autoReplyTemplateId } = ENV_CONFIG.emailjs

    // Send inquiry to the band
    const inquiryResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: inquiryTemplateId,
        user_id: publicPk,
        template_params: {
          to_email: data.bandEmail,
          from_name: data.name,
          from_email: data.email,
          phone: data.phone,
          booking_date: data.bookingDate || "Not specified",
          address: data.address || "Not specified",
          message: data.message,
          band_name: data.bandName,
          reply_to: data.email,
        },
      }),
    })

    if (!inquiryResponse.ok) {
      const errorText = await inquiryResponse.text()
      console.error("EmailJS inquiry error:", errorText)
      throw new Error(`Failed to send inquiry email: ${inquiryResponse.status} ${inquiryResponse.statusText}`)
    }

    // Send auto-reply to the user
    try {
      const replyResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: autoReplyTemplateId,
          user_id: publicPk,
          template_params: {
            to_email: data.email,
            to_name: data.name,
            band_name: data.bandName,
            inquiry_date: new Date().toLocaleDateString(),
            user_message: data.message,
          },
        }),
      })

      if (!replyResponse.ok) {
        console.warn("Auto-reply email failed, but inquiry was sent successfully")
      }
    } catch (replyError) {
      console.warn("Auto-reply failed:", replyError)
      // Don't throw error for auto-reply failure
    }

    return true
  } catch (error) {
    console.error("Email sending failed:", error)
    throw error
  }
}

// Get current EmailJS configuration status
export function getEmailJSStatus() {
  return {
    isConfigured: validateEmailJSConfig(),
    config: {
      publicPk: ENV_CONFIG.emailjs.publicPk ? "✓ Set" : "✗ Missing",
      serviceId: ENV_CONFIG.emailjs.serviceId ? "✓ Set" : "✗ Missing",
      inquiryTemplateId: ENV_CONFIG.emailjs.inquiryTemplateId ? "✓ Set" : "✗ Missing",
      autoReplyTemplateId: ENV_CONFIG.emailjs.autoReplyTemplateId ? "✓ Set" : "✗ Missing",
    },
  }
}
