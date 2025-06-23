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
    throw new Error("EmailJS configuration is incomplete. Please check your environment variables in .env.local")
  }
}

export async function sendInquiryEmail(data: EmailData): Promise<boolean> {
  try {
    // Validate configuration
    ensureConfigIsValid()

    const { publicKey, serviceId, inquiryTemplateId, autoReplyTemplateId } = ENV_CONFIG.emailjs

    // Send inquiry to the band
    const inquiryRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: inquiryTemplateId,
        user_id: publicKey,
        template_params: {
          to_email: data.bandEmail,
          from_name: data.name,
          from_email: data.email,
          phone: data.phone,
          booking_date: data.bookingDate || "Not specified",
          address: data.address || "Not specified",
          message: data.message,
          band_name: data.bandName,
        },
      }),
    })

    if (!inquiryRes.ok) {
      const errBody = await inquiryRes.json().catch(() => ({}))
      throw new Error(`Inquiry API error ${inquiryRes.status}: ${JSON.stringify(errBody)}`)
    }

    // Send auto-reply to the user
    const replyRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: autoReplyTemplateId,
        user_id: publicKey,
        template_params: {
          to_email: data.email,
          to_name: data.name,
          band_name: data.bandName,
          inquiry_date: new Date().toLocaleDateString(),
        },
      }),
    })

    if (!replyRes.ok) {
      const errBody = await replyRes.json().catch(() => ({}))
      console.warn("Auto-reply failed: ", errBody)
    }

    return true
  } catch (err) {
    console.error("Email sending failed:", err)
    throw err
  }
}

// Get current EmailJS configuration status
export function getEmailJSStatus() {
  return {
    isConfigured: validateEmailJSConfig(),
    config: {
      publicKey: ENV_CONFIG.emailjs.publicKey ? "✓ Set" : "✗ Missing",
      serviceId: ENV_CONFIG.emailjs.serviceId ? "✓ Set" : "✗ Missing",
      inquiryTemplateId: ENV_CONFIG.emailjs.inquiryTemplateId ? "✓ Set" : "✗ Missing",
      autoReplyTemplateId: ENV_CONFIG.emailjs.autoReplyTemplateId ? "✓ Set" : "✗ Missing",
    },
  }
}
