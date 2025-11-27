// Audit Type Definitions
export interface AuditLog {
  id: string
  user_id: string
  resource_type: string
  resource_id: string
  action: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface AccessEvent {
  id: string
  share_link_id: string
  accessor_ip: string
  accessed_at: string
  location?: string
  device?: string
}

export type AuditAction = 
  | 'view'
  | 'download'
  | 'upload'
  | 'delete'
  | 'share'
  | 'verify'
  | 'update'
