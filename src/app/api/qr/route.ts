// QR Code Generation API
import { createClient } from '../../../lib/supabase/server'
import { generateQRCode } from '../../../lib/qr-generator'

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { documentId, shareCode } = await request.json();
    
    if (!documentId) {
      return Response.json({ error: 'Document ID is required' }, { status: 400 });
    }
    
    // Verify that the user owns this document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();
    
    if (docError || !document) {
      return Response.json({ error: 'Document not found or access denied' }, { status: 403 });
    }
    
    // Check if a share link already exists for this document
    let existingShareLink = null;
    if (shareCode) {
      const { data: shareLink, error: shareError } = await supabase
        .from('share_links')
        .select('id, share_code')
        .eq('document_id', documentId)
        .eq('share_code', shareCode)
        .single();
      
      if (shareLink) {
        existingShareLink = shareLink;
      }
    }
    
    // If no existing share link, create one
    let shareCodeToUse = shareCode;
    if (!existingShareLink) {
      // Generate a unique share code
      const newShareCode = Math.random().toString(36).substring(2, 10);
      
      const { data: newShareLink, error: createShareError } = await supabase
        .from('share_links')
        .insert({
          document_id: documentId,
          user_id: user.id,
          share_code: newShareCode,
          is_active: true
        })
        .select()
        .single();
      
      if (newShareLink) {
        shareCodeToUse = newShareLink.share_code;
      }
    }
    
    // Construct the share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/share/${shareCodeToUse}`;
    
    // Generate QR code data
    const qrData = await generateQRCode(shareUrl);
    
    // Get the share link ID for the QR code
    let shareLinkId = null;
    if (shareCodeToUse) {
      const { data: shareLink, error: linkError } = await supabase
        .from('share_links')
        .select('id')
        .eq('share_code', shareCodeToUse)
        .single();
      
      if (shareLink) {
        shareLinkId = shareLink.id;
      }
    }
    
    // Save QR code to database
    const { data: newQRCode, error: qrError } = await supabase
      .from('qr_codes')
      .insert({
        share_link_id: shareLinkId,
        qr_data: qrData
      })
      .select()
      .single();
    
    if (qrError) {
      console.error('Error saving QR code:', qrError);
      // We can still return the QR code even if saving to DB fails
      return Response.json({ qrCode: qrData });
    }
    
    return Response.json({ qrCode: qrData, qrId: newQRCode.id });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return Response.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
