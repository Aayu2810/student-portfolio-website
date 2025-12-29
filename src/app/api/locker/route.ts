// Locker API - GET/POST documents
import { createClient } from '../../../lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch user's documents from the database
    const { data: documents, error: dbError } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        category,
        file_type,
        file_size,
        created_at,
        updated_at,
        is_public,
        is_favorite,
        file_url,
        storage_path,
        thumbnail_url,
        views,
        downloads
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (dbError) {
      console.error('Error fetching documents:', dbError);
      return Response.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
    
    // Transform documents to match expected format
    const transformedDocs = documents.map(doc => ({
      id: doc.id,
      name: doc.title,
      type: 'file',
      fileType: doc.file_type,
      size: doc.file_size,
      status: doc.is_public ? 'verified' : 'pending',
      uploadedAt: doc.created_at,
      thumbnailUrl: doc.thumbnail_url,
      fileUrl: doc.file_url,
      isFavorite: doc.is_favorite,
      views: doc.views,
      downloads: doc.downloads
    }));
    
    // Add caching headers
    const headers = new Headers();
    headers.append('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return new Response(JSON.stringify({ documents: transformedDocs }), {
      status: 200,
      headers: headers
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return Response.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, category, file_url, storage_path, file_type, file_size } = await request.json();
    
    if (!title || !category || !file_url || !storage_path) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create a new document record in the database
    const { data: newDocument, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        title,
        category,
        file_url,
        storage_path,
        file_type,
        file_size,
        thumbnail_url: null // Will be generated later if needed
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Error creating document:', dbError);
      return Response.json({ error: 'Failed to create document' }, { status: 500 });
    }
    
    return Response.json({ success: true, documentId: newDocument.id });
  } catch (error) {
    console.error('Error creating document:', error);
    return Response.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
