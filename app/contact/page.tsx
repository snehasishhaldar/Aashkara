"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, ArrowLeft, CheckCircle, AlertCircle, Mail, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { getBandConfig, type BandConfig } from "@/lib/band-config"
import { sendInquiryEmail, getEmailJSStatus } from "@/lib/email-service"

export default function ContactPage() {
  const [bandConfig, setBandConfig] = useState<BandConfig | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bookingDate: "",
    address: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    setBandConfig(getBandConfig())
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    if (!bandConfig) {
      setSubmitStatus("error")
      setErrorMessage("Band configuration not loaded")
      setIsSubmitting(false)
      return
    }

    const emailData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bookingDate: formData.bookingDate,
      address: formData.address,
      message: formData.message,
      bandName: bandConfig.name,
      bandEmail: bandConfig.contact.email,
    }

    try {
      await sendInquiryEmail(emailData)
      setSubmitStatus("success")
      setFormData({
        name: "",
        email: "",
        phone: "",
        bookingDate: "",
        address: "",
        message: "",
      })
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to send message")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (!bandConfig) return null

  const emailStatus = getEmailJSStatus()

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-red-500">Contact {bandConfig.name}</h1>
        </div>

        {submitStatus === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Message Sent Successfully!</h2>
            <p className="text-gray-300 mb-6">
              Thank you for your inquiry. We've sent you a confirmation email and will get back to you soon!
            </p>
            <Button onClick={() => setSubmitStatus("idle")} className="bg-red-600 hover:bg-red-700">
              Send Another Message
            </Button>
          </motion.div>
        ) : (
          <>
            {!emailStatus.isConfigured && (
              <Card className="bg-yellow-900/20 border-yellow-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-yellow-500 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    EmailJS Setup Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-300 mb-4">
                    To enable the contact form, you need to set up EmailJS. Follow these steps:
                  </p>
                  <ol className="text-sm text-yellow-200 space-y-2 mb-4">
                    <li>
                      1. Create a free account at{" "}
                      <a
                        href="https://www.emailjs.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline inline-flex items-center"
                      >
                        emailjs.com <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </li>
                    <li>2. Set up an email service (Gmail, Outlook, etc.)</li>
                    <li>
                      3. Create two email templates:
                      <ul className="ml-4 mt-1 space-y-1">
                        <li>• Inquiry template (for receiving messages)</li>
                        <li>• Auto-reply template (for confirming receipt)</li>
                      </ul>
                    </li>
                    <li>
                      4. Add these environment variables to your{" "}
                      <code className="bg-gray-800 px-1 rounded">.env.local</code> file:
                    </li>
                  </ol>
                  <div className="bg-gray-800 p-3 rounded text-xs font-mono text-gray-300">
                    <div>NEXT_PUBLIC_EMAILJS_PK=your_public_key</div>
                    <div>NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id</div>
                    <div>NEXT_PUBLIC_EMAILJS_INQUIRY_TEMPLATE_ID=your_inquiry_template_id</div>
                    <div>NEXT_PUBLIC_EMAILJS_AUTOREPLY_TEMPLATE_ID=your_autoreply_template_id</div>
                  </div>
                  <div className="mt-4 text-xs text-yellow-200">
                    <strong>Current Status:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>Public Key: {emailStatus.config.publicPk}</li>
                      <li>Service ID: {emailStatus.config.serviceId}</li>
                      <li>Inquiry Template: {emailStatus.config.inquiryTemplateId}</li>
                      <li>Auto-reply Template: {emailStatus.config.autoReplyTemplateId}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Send us a message
                </CardTitle>
                <p className="text-gray-400">Fill out the form below and we'll get back to you as soon as possible.</p>
              </CardHeader>
              <CardContent>
                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-start space-x-2"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-semibold">Failed to send message</p>
                      <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bookingDate">Event Date</Label>
                      <Input
                        id="bookingDate"
                        name="bookingDate"
                        type="date"
                        value={formData.bookingDate}
                        onChange={handleChange}
                        className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Event Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                      placeholder="Where is your event taking place?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message / Requirements *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 min-h-[120px]"
                      placeholder="Tell us about your event, music preferences, duration, budget, or any special requirements..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !emailStatus.isConfigured}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>

                  {!emailStatus.isConfigured && (
                    <p className="text-center text-sm text-yellow-400">
                      Contact form is disabled until EmailJS is configured
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
