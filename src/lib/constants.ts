// Application Constants
export const APP_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  STORAGE_LIMIT: 100 * 1024 * 1024, // 100MB per user
  
  DOCUMENT_CATEGORIES: [
    'Academic',
    'Certification',
    'Internship',
    'Project',
    'Achievement',
    'Other'
  ],
  
  VERIFICATION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  }
}
