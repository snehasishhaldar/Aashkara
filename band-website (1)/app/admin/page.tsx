"use client"

import { useState, useEffect } from "react"
import {
  Shield,
  LogOut,
  Save,
  User,
  Phone,
  Instagram,
  Music,
  Plus,
  Trash2,
  Settings,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { getBandConfig, saveBandConfig, type BandConfig, type BandMember, type BandProject } from "@/lib/band-config"
import { signInWithGoogle, signOut, onAuthStateChange, getAuthStatus, type AdminUser } from "@/lib/auth-config"
import { getEmailJSStatus } from "@/lib/email-service"

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [bandConfig, setBandConfig] = useState<BandConfig | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [showConfigStatus, setShowConfigStatus] = useState(false)
  const [authError, setAuthError] = useState("")

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user)
      if (user && user.isAuthorized) {
        setBandConfig(getBandConfig())
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignIn = async () => {
    setIsSigningIn(true)
    setAuthError("")
    try {
      await signInWithGoogle()
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Failed to sign in")
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setBandConfig(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleSave = async () => {
    if (!bandConfig) return

    setIsSaving(true)
    setSaveStatus("idle")

    try {
      saveBandConfig(bandConfig)
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const updateBandConfig = (updates: Partial<BandConfig>) => {
    if (!bandConfig) return
    setBandConfig({ ...bandConfig, ...updates })
  }

  const updateContact = (field: string, value: string) => {
    if (!bandConfig) return
    setBandConfig({
      ...bandConfig,
      contact: { ...bandConfig.contact, [field]: value },
    })
  }

  const updateSocial = (field: string, value: string) => {
    if (!bandConfig) return
    setBandConfig({
      ...bandConfig,
      social: { ...bandConfig.social, [field]: value },
    })
  }

  const updateMember = (index: number, field: keyof BandMember, value: string) => {
    if (!bandConfig) return
    const newMembers = [...bandConfig.members]
    newMembers[index] = { ...newMembers[index], [field]: value }
    setBandConfig({ ...bandConfig, members: newMembers })
  }

  const addMember = () => {
    if (!bandConfig) return
    const newMember: BandMember = { name: "", role: "", bio: "" }
    setBandConfig({
      ...bandConfig,
      members: [...bandConfig.members, newMember],
    })
  }

  const removeMember = (index: number) => {
    if (!bandConfig) return
    const newMembers = bandConfig.members.filter((_, i) => i !== index)
    setBandConfig({ ...bandConfig, members: newMembers })
  }

  const updateProject = (index: number, field: keyof BandProject, value: string) => {
    if (!bandConfig) return
    const newProjects = [...(bandConfig.projects || [])]
    newProjects[index] = { ...newProjects[index], [field]: value }
    setBandConfig({ ...bandConfig, projects: newProjects })
  }

  const addProject = () => {
    if (!bandConfig) return
    const newProject: BandProject = { title: "", description: "", youtubeId: "" }
    setBandConfig({
      ...bandConfig,
      projects: [...(bandConfig.projects || []), newProject],
    })
  }

  const removeProject = (index: number) => {
    if (!bandConfig) return
    const newProjects = (bandConfig.projects || []).filter((_, i) => i !== index)
    setBandConfig({ ...bandConfig, projects: newProjects })
  }

  // Configuration status components
  const ConfigurationStatus = () => {
    const authStatus = getAuthStatus()
    const emailStatus = getEmailJSStatus()

    return (
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-500 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configuration Status
            </CardTitle>
            <Button
              onClick={() => setShowConfigStatus(!showConfigStatus)}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              {showConfigStatus ? "Hide" : "Show"} Details
            </Button>
          </div>
        </CardHeader>
        {showConfigStatus && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-white mb-2 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Firebase Authentication
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="text-green-400">{authStatus.config.firebaseAuth}</p>
                  <p className={authStatus.adminEmails ? "text-green-400" : "text-red-400"}>
                    {authStatus.config.authorizedEmails}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-white mb-2 flex items-center">
                  <Instagram className="h-4 w-4 mr-2" />
                  EmailJS
                </h4>
                <div className="space-y-1 text-sm">
                  <p className={emailStatus.config.publicKey.includes("✓") ? "text-green-400" : "text-red-400"}>
                    {emailStatus.config.publicKey}
                  </p>
                  <p className={emailStatus.config.serviceId.includes("✓") ? "text-green-400" : "text-red-400"}>
                    {emailStatus.config.serviceId}
                  </p>
                  <p className={emailStatus.config.inquiryTemplateId.includes("✓") ? "text-green-400" : "text-red-400"}>
                    {emailStatus.config.inquiryTemplateId}
                  </p>
                  <p
                    className={emailStatus.config.autoReplyTemplateId.includes("✓") ? "text-green-400" : "text-red-400"}
                  >
                    {emailStatus.config.autoReplyTemplateId}
                  </p>
                </div>
              </div>
            </div>
            {(!authStatus.adminEmails || !emailStatus.isConfigured) && (
              <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-semibold">Configuration Issues Detected</p>
                  <p className="text-yellow-300 text-sm mt-1">
                    Please check your .env.local file and ensure all required environment variables are set.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-500">Admin Access Required</CardTitle>
            <p className="text-gray-400">Sign in with your authorized Google account</p>
          </CardHeader>
          <CardContent>
            {authError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400 text-sm">{authError}</p>
              </div>
            )}
            <Button onClick={handleSignIn} disabled={isSigningIn} className="w-full bg-red-600 hover:bg-red-700">
              {isSigningIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user.isAuthorized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-500">Access Denied</CardTitle>
            <p className="text-gray-400">Your account is not authorized for admin access</p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <img
                src={user.picture || "/placeholder.svg"}
                alt={user.name}
                className="w-16 h-16 rounded-full mx-auto mb-2"
              />
              <p className="text-white">{user.name}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-gray-600 text-white hover:bg-gray-700"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!bandConfig) return null

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-500">Band Admin Panel</h1>
            <p className="text-gray-400">Manage your band's website content</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src={user.picture || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
              <span className="text-sm text-gray-300">{user.name}</span>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Configuration Status */}
        <ConfigurationStatus />

        {/* Save Button */}
        <div className="mb-6">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={`bg-red-600 hover:bg-red-700 ${saveStatus === "success" ? "bg-green-600" : saveStatus === "error" ? "bg-red-800" : ""}`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : saveStatus === "success" ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-red-500">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bandName">Band Name</Label>
                <Input
                  id="bandName"
                  value={bandConfig.name}
                  onChange={(e) => updateBandConfig({ name: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={bandConfig.tagline}
                  onChange={(e) => updateBandConfig({ tagline: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="about">About</Label>
                <Textarea
                  id="about"
                  value={bandConfig.about}
                  onChange={(e) => updateBandConfig({ about: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={bandConfig.contact.email}
                    onChange={(e) => updateContact("email", e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={bandConfig.contact.phone}
                    onChange={(e) => updateContact("phone", e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alternatePhone">Alternate Phone</Label>
                  <Input
                    id="alternatePhone"
                    value={bandConfig.contact.alternatePhone || ""}
                    onChange={(e) => updateContact("alternatePhone", e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={bandConfig.contact.address}
                    onChange={(e) => updateContact("address", e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center">
                <Instagram className="h-5 w-5 mr-2" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    value={bandConfig.social.instagram || ""}
                    onChange={(e) => updateSocial("instagram", e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="https://instagram.com/yourband"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube URL</Label>
                  <Input
                    id="youtube"
                    value={bandConfig.social.youtube || ""}
                    onChange={(e) => updateSocial("youtube", e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="https://youtube.com/yourband"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    value={bandConfig.social.facebook || ""}
                    onChange={(e) => updateSocial("facebook", e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="https://facebook.com/yourband"
                  />
                </div>
                <div>
                  <Label htmlFor="spotify">Spotify URL</Label>
                  <Input
                    id="spotify"
                    value={bandConfig.social.spotify || ""}
                    onChange={(e) => updateSocial("spotify", e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="https://open.spotify.com/artist/yourband"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Band Members */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-red-500 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Band Members
                </CardTitle>
                <Button onClick={addMember} size="sm" className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {bandConfig.members.map((member, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-white">Member {index + 1}</h4>
                    <Button
                      onClick={() => removeMember(index)}
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={member.name}
                        onChange={(e) => updateMember(index, "name", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={member.role}
                        onChange={(e) => updateMember(index, "role", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label>Bio</Label>
                    <Textarea
                      value={member.bio}
                      onChange={(e) => updateMember(index, "bio", e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-red-500 flex items-center">
                  <Music className="h-5 w-5 mr-2" />
                  Projects
                </CardTitle>
                <Button onClick={addProject} size="sm" className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {(bandConfig.projects || []).map((project, index) => (
                <div key={index} className="p-4 bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-white">Project {index + 1}</h4>
                    <Button
                      onClick={() => removeProject(index)}
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={project.title}
                        onChange={(e) => updateProject(index, "title", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => updateProject(index, "description", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label>YouTube Video ID</Label>
                      <Input
                        value={project.youtubeId}
                        onChange={(e) => updateProject(index, "youtubeId", e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="dQw4w9WgXcQ"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Extract the video ID from YouTube URL: youtube.com/watch?v=<strong>VIDEO_ID</strong>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
