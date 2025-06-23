"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Send, ArrowLeft, CheckCircle, AlertCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { getBandConfig, type BandConfig } from "@/lib/band-config"
import { sendInquiryEmail } from "@/lib/email-service"

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

                <Button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700">
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
              </form>
            </CardContent>
          </Card>
        )}

        {/* EmailJS Setup Notice */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-400 mb-2">📧 EmailJS Setup Required:</h3>
          <ol className="text-sm text-gray-300 space-y-1">
            <li>1. Create account at emailjs.com</li>
            <li>2. Set up email service (Gmail, Outlook, etc.)</li>
            <li>3. Create email templates</li>
            <li>
              4. Update credentials in <code className="bg-gray-800 px-1 rounded">/lib/email-service.ts</code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
