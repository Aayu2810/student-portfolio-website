import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Try to disable RLS using SQL
    const { error } = await supabase
      .from('storage.buckets')
      .select('name')
      .limit(1)
    
    if (error) {
      // If we can't access storage, try to create the bucket directly
      console.log('Cannot access storage, trying to create bucket...')
      
      const { error: createError } = await supabase
        .storage
        .createBucket('documents', {
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
        console.error('Error creating bucket:', createError)
        return NextResponse.json({ 
          success: false, 
          error: createError.message 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Documents bucket created successfully' 
      })
    }
    
    // Check if documents bucket exists
    const { data: buckets } = await supabase
      .from('storage.buckets')
      .select('name')
      .limit(10)
    
    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents')
    
    if (!documentsBucket) {
      // Create the documents bucket
      const { data, error: createError } = await supabase
        .storage
        .createBucket('documents', {
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
        console.error('Error creating bucket:', createError)
        return NextResponse.json({ 
          success: false, 
          error: createError.message 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Documents bucket created successfully' 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Documents bucket already exists',
      buckets: buckets
    })
    
  } catch (error: any) {
    console.error('Error in disable-rls API:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check current storage status
    const { data: buckets, error } = await supabase
      .from('storage.buckets')
      .select('name, public, owner')
      .limit(10)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        message: 'Cannot access storage buckets' 
      }, { status: 500 })
    }
    
    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents')
    
    return NextResponse.json({
      success: true,
      hasDocumentsBucket: !!documentsBucket,
      buckets: buckets,
      message: documentsBucket ? 'Documents bucket exists' : 'Documents bucket not found'
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
