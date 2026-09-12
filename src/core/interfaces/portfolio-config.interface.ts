export interface SiteSettings {
  title: string
  description: string
  language: string
  favicon?: string
}

export interface SectionConfig {
  enabled: boolean
  title: string
  order: number
}

export interface SectionsSettings {
  about: SectionConfig
  skills: SectionConfig
  experience: SectionConfig
  education: SectionConfig
  projects: SectionConfig
  services: SectionConfig
  certifications: SectionConfig
  achievements: SectionConfig
  publications: SectionConfig
  volunteering: SectionConfig
  testimonials: SectionConfig
  contact: SectionConfig
}

export interface SettingsConfig {
  site: SiteSettings
  sections: SectionsSettings
}

export interface Profile {
  name: string
  title: string
  bio: string
  location?: string
  availability?: string
  avatar?: string
  resume?: string
}

export interface About {
  description: string
  extended?: string
}

export interface SocialLink {
  platform: string
  label: string
  url: string
}

export interface Skill {
  name: string
  category?: string
}

export interface Experience {
  company: string
  role: string
  location?: string
  startDate: string
  endDate: string
  description: string
  highlights?: string[]
}

export interface Education {
  institution: string
  degree: string
  field?: string
  location?: string
  startDate: string
  endDate: string
  description?: string
}

export interface Project {
  title: string
  description: string
  image?: string
  technologies: string[]
  url?: string
  sourceUrl?: string
  featured?: boolean
}

export interface Service {
  title: string
  description: string
}

export interface Certification {
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string | null
  credentialId?: string
  credentialUrl?: string
}

export interface Achievement {
  title: string
  organization: string
  date: string
  description?: string
}

export interface Publication {
  title: string
  publisher: string
  date: string
  description?: string
  url?: string
}

export interface Volunteering {
  organization: string
  role: string
  location?: string
  startDate: string
  endDate: string
  description?: string
}

export interface Testimonial {
  quote: string
  author: string
  role: string
  company: string
  avatar?: string
}

export interface Contact {
  title?: string
  description?: string
  email: string
}

export interface PortfolioConfig {
  settings: SettingsConfig
  profile: Profile
  about?: About
  social?: SocialLink[]
  skills?: Skill[]
  experience?: Experience[]
  education?: Education[]
  projects?: Project[]
  services?: Service[]
  certifications?: Certification[]
  achievements?: Achievement[]
  publications?: Publication[]
  volunteering?: Volunteering[]
  testimonials?: Testimonial[]
  contact?: Contact
}

export type SectionKey = keyof SectionsSettings
export type SupportedSectionKey = 'about' | 'skills' | 'experience' | 'projects' | 'contact'
