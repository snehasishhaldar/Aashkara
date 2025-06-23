import { ENV_CONFIG } from "./env-config"

export interface BandMember {
  name: string
  role: string
  bio: string
}

export interface BandProject {
  title: string
  description: string
  youtubeId: string
}

export interface BandConfig {
  name: string
  tagline: string
  about: string
  contact: {
    email: string
    phone: string
    alternatePhone?: string
    address: string
  }
  social: {
    instagram?: string
    youtube?: string
    facebook?: string
    spotify?: string
  }
  members: BandMember[]
  projects?: BandProject[]
}

const defaultConfig: BandConfig = {
  name: ENV_CONFIG.band.name || "Aashkara",
  tagline: ENV_CONFIG.band.tagline || "Rock the Night Away",
  about:
    "Aashkara is a high-energy rock band that has been electrifying audiences for over a decade. With powerful vocals, crushing guitar riffs, and thunderous drums, we bring an unforgettable experience to every stage. Our passion for music and connection with our fans drives us to deliver performances that leave lasting memories.",
  contact: {
    email: ENV_CONFIG.band.email || "aashkaraband@gmail.com",
    phone: ENV_CONFIG.band.phone || "+91 87688 42665",
    alternatePhone: ENV_CONFIG.band.alternatePhone || "+91 86090301339",
    address: ENV_CONFIG.band.address || "Murshidabad, West Bengal, India",
  },
  social: {
    instagram: ENV_CONFIG.band.instagram || "https://instagram.com/aashkaraband",
    youtube: ENV_CONFIG.band.youtube || "https://youtube.com/aashkaraband",
    facebook: ENV_CONFIG.band.facebook || "https://facebook.com/aashkaraband",
    spotify: ENV_CONFIG.band.spotify || "https://open.spotify.com/artist/aashkara",
  },
  members: [
    {
      name: "Alex Thunder",
      role: "Lead Vocalist & Rhythm Guitar",
      bio: "The voice and heart of Aashkara, Alex brings raw energy and emotional depth to every performance.",
    },
    {
      name: "Jake Lightning",
      role: "Lead Guitarist",
      bio: "Master of the six strings, Jake's guitar solos are legendary and his stage presence is electrifying.",
    },
    {
      name: "Mike Storm",
      role: "Bass Guitar & Backing Vocals",
      bio: "The foundation of our sound, Mike's bass lines drive the rhythm and his harmonies complete our vocal blend.",
    },
    {
      name: "Danny Crash",
      role: "Drummer",
      bio: "The powerhouse behind the kit, Danny's thunderous beats are the heartbeat of Aashkara.",
    },
  ],
  projects: [
    {
      title: "Live at Rock Festival 2023",
      description: "Our electrifying performance at the biggest rock festival of the year",
      youtubeId: "dQw4w9WgXcQ",
    },
    {
      title: "Studio Session - New Album",
      description: "Behind the scenes footage from our latest album recording",
      youtubeId: "dQw4w9WgXcQ",
    },
  ],
}

export function getBandConfig(): BandConfig {
  if (typeof window === "undefined") return defaultConfig

  const stored = localStorage.getItem("bandConfig")
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Ensure projects array exists
      if (!parsed.projects) {
        parsed.projects = defaultConfig.projects
      }
      return parsed
    } catch {
      return defaultConfig
    }
  }
  return defaultConfig
}

export function saveBandConfig(config: BandConfig): void {
  if (typeof window === "undefined") return
  localStorage.setItem("bandConfig", JSON.stringify(config))
}
