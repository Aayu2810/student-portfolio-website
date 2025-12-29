// Verification API - POST verification
import { createClient } from '../../../lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch documents with their verification status
    const { data: verifications, error: dbError } = await supabase
      .from('documents')
      .select('id, title, category, created_at, is_public')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (dbError) {
      console.error('Error fetching verifications:', dbError);
      return Response.json({ error: 'Failed to fetch verifications' }, { status: 500 });
    }
    
    // Transform the data to match expected format
    const transformedVerifications = verifications.map(verification => ({
      id: verification.id,
      documentId: verification.id,
      studentName: 'User', // Would need to join with profiles to get actual name
      studentEmail: 'N/A', // Would need to join with profiles to get actual email
      documentName: verification.title,
      documentType: verification.category,
      status: verification.is_public ? 'verified' : 'pending',
      requestedAt: verification.created_at,
    }));
    
    return Response.json({ verifications: transformedVerifications });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return Response.json({ error: 'Failed to fetch verifications' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // In a real implementation, we would create a verification request
    return Response.json({ success: true, verificationId: `verify-${Date.now()}` });
  } catch (error) {
    console.error('Error creating verification:', error);
    return Response.json({ error: 'Failed to create verification' }, { status: 500 });
  }
}
