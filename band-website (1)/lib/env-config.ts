// Environment configuration with validation
export const ENV_CONFIG = {
  // EmailJS Configuration
  emailjs: {
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "",
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "",
    inquiryTemplateId: process.env.NEXT_PUBLIC_EMAILJS_INQUIRY_TEMPLATE_ID || "",
    autoReplyTemplateId: process.env.NEXT_PUBLIC_EMAILJS_AUTOREPLY_TEMPLATE_ID || "",
  },

  // Admin Configuration
  admin: {
    authorizedEmails: process.env.AUTHORIZED_ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [],
  },

  // Band Configuration (Optional overrides)
  band: {
    name: process.env.BAND_NAME,
    tagline: process.env.BAND_TAGLINE,
    email: process.env.BAND_EMAIL,
    phone: process.env.BAND_PHONE,
    alternatePhone: process.env.BAND_ALTERNATE_PHONE,
    address: process.env.BAND_ADDRESS,
    instagram: process.env.BAND_INSTAGRAM,
    youtube: process.env.BAND_YOUTUBE,
    facebook: process.env.BAND_FACEBOOK,
    spotify: process.env.BAND_SPOTIFY,
  },
}

// Validation functions
export function validateEmailJSConfig(): boolean {
  const { publicKey, serviceId, inquiryTemplateId, autoReplyTemplateId } = ENV_CONFIG.emailjs
  return !!(publicKey && serviceId && inquiryTemplateId && autoReplyTemplateId)
}

export function validateAdminConfig(): boolean {
  const { authorizedEmails } = ENV_CONFIG.admin
  return authorizedEmails.length > 0 && !authorizedEmails.includes("")
}

// Helper to check if we're in development
export const isDevelopment = process.env.NODE_ENV === "development"
export const isProduction = process.env.NODE_ENV === "production"
