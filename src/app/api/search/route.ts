// Document Search API
import { createClient } from '../../../lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Perform search on documents table
    let queryBuilder = supabase
      .from('documents')
      .select('id, title, category, file_type, file_size, is_public, created_at, description, thumbnail_url')
      .or(`title.ilike.%${query}% or description.ilike.%${query}% or category.ilike.%${query}%`, { referencedTable: '' })
      .eq('user_id', user.id) // Only search user's documents
      .limit(20); // Limit results
    
    const { data: searchResults, error: dbError } = await queryBuilder;
    
    if (dbError) {
      console.error('Error searching documents:', dbError);
      return Response.json({ error: 'Failed to search documents' }, { status: 500 });
    }
    
    // Transform the results to match expected format
    const results = searchResults.map(doc => ({
      id: doc.id,
      name: doc.title,
      type: doc.category,
      fileType: doc.file_type,
      size: doc.file_size,
      status: doc.is_public ? 'verified' : 'pending',
      uploadedAt: doc.created_at,
      thumbnailUrl: doc.thumbnail_url,
      description: doc.description || ''
    }));
    
    // Add caching headers
    const headers = new Headers();
    headers.append('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: headers
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    return Response.json({ error: 'Failed to search documents' }, { status: 500 });
  }
}
