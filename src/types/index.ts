export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  role?: string
  avatar_url?: string
  bio?: string
  phone?: string
  portfolio_url?: string
  linkedin_url?: string
  github_url?: string
  twitter_url?: string
  website_url?: string
  storage_used: number
  storage_limit: number
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  title: string
  description?: string
  category: 'academic' | 'certificates' | 'professional' | 'identity' | 'personal' | 'property' | 'other'
  tags: string[]
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  thumbnail_url?: string
  is_favorite: boolean
  is_public: boolean
  views: number
  downloads: number
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  user_id: string
  theme_primary: string
  theme_secondary: string
  theme_background: string
  template: 'minimal' | 'modern' | 'creative' | 'professional' | 'dark'
  tagline?: string
  about?: string
  skills: string[]
  sections: PortfolioSection[]
  featured_documents: string[]
  is_public: boolean
  custom_domain?: string
  meta_title?: string
  meta_description?: string
  views: number
  created_at: string
  updated_at: string
}

export interface PortfolioSection {
  id: string
  title: string
  content: string
  order: number
}

export interface ShareLink {
  id: string
  document_id: string
  user_id: string
  share_code: string
  expires_at?: string
  access_count: number
  max_access?: number
  is_active: boolean
  created_at: string
}