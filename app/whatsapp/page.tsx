"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MessageCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { getBandConfig, type BandConfig } from "@/lib/band-config"

export default function WhatsAppPage() {
  const [bandConfig, setBandConfig] = useState<BandConfig | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bookingDate: "",
    address: "",
    message: "",
  })

  useEffect(() => {
    setBandConfig(getBandConfig())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!bandConfig) return

    // Create WhatsApp message
    const whatsappMessage = `Hi ${bandConfig.name}! 🎸

*New Booking Inquiry*

*Name:* ${formData.name}
*Email:* ${formData.email}
*Phone:* ${formData.phone}
${formData.bookingDate ? `*Booking Date:* ${formData.bookingDate}` : ""}
${formData.address ? `*Event Address:* ${formData.address}` : ""}

*Message:*
${formData.message}

Looking forward to hearing from you!`

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${bandConfig.contact.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`

    // Open WhatsApp
    window.open(whatsappUrl, "_blank")
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
          <h1 className="text-3xl font-bold text-green-500">WhatsApp Contact</h1>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-green-500 flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              Send WhatsApp Message to {bandConfig.name}
            </CardTitle>
            <p className="text-gray-300">
              Fill out the form below and we'll redirect you to WhatsApp with a pre-filled message.
            </p>
          </CardHeader>
          <CardContent>
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
                  />
                </div>
                <div>
                  <Label htmlFor="bookingDate">Booking Date</Label>
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
                <Label htmlFor="message">Message / Query *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 min-h-[120px]"
                  placeholder="Tell us about your event, requirements, or any questions you have..."
                />
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Open WhatsApp
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <h3 className="font-semibold text-green-400 mb-2">How it works:</h3>
          <ol className="text-sm text-gray-300 space-y-1">
            <li>1. Fill out the form above with your details</li>
            <li>2. Click "Open WhatsApp" to launch WhatsApp</li>
            <li>3. Your message will be pre-filled with all the information</li>
            <li>4. Just hit send to contact {bandConfig.name} directly!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
