// Share Type Definitions
export interface ShareLink {
  id: string
  document_id: string
  created_by: string
  share_code: string
  expires_at?: string
  access_count: number
  max_access?: number
  password?: string
  permissions: SharePermissions
  created_at: string
}

export interface SharePermissions {
  can_download: boolean
  can_view: boolean
  can_comment: boolean
}

export interface QRCode {
  id: string
  share_link_id: string
  qr_data: string
  created_at: string
}

export interface ShareRequest {
  document_ids: string[]
  expires_in_days?: number
  max_access?: number
  password?: string
  permissions: SharePermissions
}
