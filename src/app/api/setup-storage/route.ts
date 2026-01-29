import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check current storage access
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        message: 'Cannot access Supabase storage' 
      }, { status: 500 })
    }
    
    // Check if documents bucket exists
    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents')
    
    if (!documentsBucket) {
      // Create the documents bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('documents', {
        public: true,
        allowedMimeTypes: [
          'image/*', 
          'application/pdf', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
          'application/vnd.ms-excel', 
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/*',
          'application/octet-stream'
        ]
      })
      
      if (createError) {
        return NextResponse.json({ 
          success: false, 
          error: createError.message,
          message: 'Failed to create documents bucket' 
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Documents bucket created successfully',
        buckets: [...(buckets || []), newBucket]
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Documents bucket already exists',
      buckets: buckets
    })
    
  } catch (error: any) {
    console.error('Storage setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: 'Storage setup failed' 
    }, { status: 500 })
  }
}
