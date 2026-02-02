import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { docId: string } }) {
  try {
    const supabase = await createClient()
    
    // Get current user to verify faculty role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user is faculty or admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile || (profile.role !== 'faculty' && profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Access denied. Faculty role required.' }, { status: 403 })
    }
    
    // Fetch document details (faculty can access all documents)
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, title, category, created_at, is_public, file_url, storage_path, file_name, file_type')
      .eq('id', params.docId)
      .single();

    if (docError) {
      console.error('Error fetching document:', docError);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Try to download from storage first
    if (document.storage_path) {
      try {
        const { data: fileData, error: storageError } = await supabase.storage
          .from('documents')
          .download(document.storage_path);

        if (storageError) {
          console.error('Storage download error:', storageError);
          // Fall back to file_url if storage fails
        } else {
          // Create response with the document from storage
          const fileBuffer = await fileData.arrayBuffer();
          const response = new NextResponse(fileBuffer);
          
          // Set appropriate headers
          response.headers.set('Content-Type', document.file_type || 'application/octet-stream');
          response.headers.set('Content-Disposition', `attachment; filename="${document.file_name || document.title}"`);
          response.headers.set('Content-Length', fileBuffer.byteLength.toString());
          
          return response;
        }
      } catch (storageError) {
        console.error('Storage error:', storageError);
      }
    }

    // Fallback to file_url if available
    if (document.file_url) {
      try {
        const response = await fetch(document.file_url);
        if (!response.ok) {
          throw new Error(`Failed to fetch from file_url: ${response.statusText}`);
        }
        
        const fileBuffer = await response.arrayBuffer();
        const downloadResponse = new NextResponse(fileBuffer);
        
        downloadResponse.headers.set('Content-Type', document.file_type || 'application/octet-stream');
        downloadResponse.headers.set('Content-Disposition', `attachment; filename="${document.file_name || document.title}"`);
        downloadResponse.headers.set('Content-Length', fileBuffer.byteLength.toString());
        
        return downloadResponse;
      } catch (urlError) {
        console.error('File URL error:', urlError);
      }
    }

    return NextResponse.json({ error: 'Unable to download document' }, { status: 500 });

  } catch (error: any) {
    console.error('Error in faculty download:', error);
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 });
  }
}
