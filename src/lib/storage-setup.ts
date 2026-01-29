import { createClient } from './supabase/client'

export async function setupStorageBucket() {
  const supabase = createClient()
  
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents')
    
    if (!documentsBucket) {
      console.log('Creating documents bucket...')
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: true,
        allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      })
      
      if (error) {
        console.error('Error creating bucket:', error)
        return { success: false, error }
      }
      
      console.log('Documents bucket created successfully')
      return { success: true }
    } else {
      console.log('Documents bucket already exists')
      return { success: true }
    }
  } catch (error) {
    console.error('Error setting up storage:', error)
    return { success: false, error }
  }
}

export async function checkStorageAccess() {
  const supabase = createClient()
  
  try {
    // Try to list buckets to check access
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('Storage access error:', error)
      return { success: false, error }
    }
    
    console.log('Storage is accessible. Buckets:', data?.map(b => b.name))
    return { success: true, buckets: data }
  } catch (error) {
    console.error('Storage check error:', error)
    return { success: false, error }
  }
}
