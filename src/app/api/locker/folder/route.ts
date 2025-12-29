// Folder Management API
import { createClient } from '../../../../lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch user's folders
    const { data: folders, error: dbError } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('name');
    
    if (dbError) {
      console.error('Error fetching folders:', dbError);
      return Response.json({ error: 'Failed to fetch folders' }, { status: 500 });
    }
    
    return Response.json({ folders });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return Response.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, parent_id } = await request.json();
    
    if (!name) {
      return Response.json({ error: 'Folder name is required' }, { status: 400 });
    }
    
    // Create a new folder
    const { data: newFolder, error: dbError } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name,
        parent_id: parent_id || null,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Error creating folder:', dbError);
      return Response.json({ error: 'Failed to create folder' }, { status: 500 });
    }
    
    return Response.json({ success: true, folder: newFolder });
  } catch (error) {
    console.error('Error creating folder:', error);
    return Response.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { folderId, name, parent_id } = await request.json();
    
    if (!folderId) {
      return Response.json({ error: 'Folder ID is required' }, { status: 400 });
    }
    
    // Update the folder
    const { error: dbError } = await supabase
      .from('folders')
      .update({
        name,
        parent_id,
        slug: name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', folderId)
      .eq('user_id', user.id);
    
    if (dbError) {
      console.error('Error updating folder:', dbError);
      return Response.json({ error: 'Failed to update folder' }, { status: 500 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating folder:', error);
    return Response.json({ error: 'Failed to update folder' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { folderId } = await request.json();
    
    if (!folderId) {
      return Response.json({ error: 'Folder ID is required' }, { status: 400 });
    }
    
    // Delete the folder
    const { error: dbError } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id);
    
    if (dbError) {
      console.error('Error deleting folder:', dbError);
      return Response.json({ error: 'Failed to delete folder' }, { status: 500 });
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return Response.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
