import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: Request, 
  { params }: { params: { docId: string } }
) {
  try {
    const supabase = await createClient()
    const docId = params.docId

    // For shared documents, we need to check if the document exists and is accessible
    // We don't require authentication for shared documents
    
    // Fetch document details without authentication check
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, title, category, file_url, storage_path, file_name, file_type')
      .eq('id', docId)
      .single()

    if (docError || !document) {
      console.error('Error fetching shared document:', docError)
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.storage_path)

    if (downloadError) {
      console.error('Error downloading file from storage:', downloadError)
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    // Convert file data to buffer
    const fileBuffer = await fileData.arrayBuffer()

    // Create response with the document
    const response = new NextResponse(fileBuffer)

    // Set appropriate headers
    response.headers.set('Content-Type', document.file_type)
    response.headers.set('Content-Disposition', `attachment; filename="${document.file_name}"`)
    response.headers.set('Content-Length', fileBuffer.byteLength.toString())
    
    // Add CORS headers to allow downloads from any origin
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response

  } catch (error) {
    console.error('Error in shared download:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}
