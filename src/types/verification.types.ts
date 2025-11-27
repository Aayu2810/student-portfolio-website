// Verification Type Definitions
export interface Verification {
  id: string
  document_id: string
  verifier_id: string
  status: 'pending' | 'approved' | 'rejected'
  comments?: string
  verified_at?: string
  created_at: string
}

export interface VerificationRequest {
  document_id: string
  verifier_email: string
  message?: string
}

export interface VerificationLog {
  id: string
  verification_id: string
  action: string
  performer_id: string
  timestamp: string
  details?: Record<string, any>
}
