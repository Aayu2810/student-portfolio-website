// Locker Type Definitions
export interface LockerDocument {
  id: string
  user_id: string
  folder_id?: string
  title: string
  description?: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  category: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  parent_id?: string
  name: string
  color?: string
  created_at: string
  updated_at: string
}

export interface DocumentMetadata {
  tags: string[]
  custom_fields?: Record<string, any>
}
