import { createClient } from '../../../../lib/supabase/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import * as fs from 'fs/promises'
import * as path from 'path'
import { createAuditLog, createNotification } from '../../../../lib/audit'

// Notification helper function
async function triggerNotification(
  userId: string,
  type: 'success' | 'error',
  title: string,
  message: string,
  documentTitle?: string,
  documentUrl?: string
) {
  try {
    // Create notification in database
    await createNotification({
      user_id: userId,
      title,
      message,
      type,
      data: {
        document_title: documentTitle,
        document_url: documentUrl
      }
    });

    // Also trigger a global notification popup
    // This will be handled by the client-side real-time subscription
  } catch (error) {
    console.error('Error triggering notification:', error);
  }
}

interface VerificationHistory {
  id: string;
  action: string;
  created_at: string;
  details: any;
  profiles: {
    first_name: string;
    last_name: string;
  }[];
}

// Function to download file from Supabase storage
async function downloadFileFromStorage(storagePath: string, supabase: any) {
  const { data, error } = await supabase.storage
    .from('documents')
    .download(storagePath)

  if (error) {
    throw new Error(`Failed to download file from storage: ${error.message}`)
  }

  return data
}

// Function to upload file to Supabase storage
async function uploadFileToStorage(fileBuffer: ArrayBuffer, storagePath: string, supabase: any, contentType: string) {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(storagePath, fileBuffer, {
      contentType: contentType,
      upsert: true
    })

  if (error) {
    throw new Error(`Failed to upload file to storage: ${error.message}`)
  }

  return data
}

// Function to download an image from a URL
async function downloadImageFromUrl(url: string): Promise<Uint8Array> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

// Function to add RVCE logo to PDF document
async function addRVCELogoToPDF(pdfBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    
    // Get the first page (or all pages) to add the logo
    const pages = pdfDoc.getPages()
    
    // Download the RVCE logo from the provided URL
    // Using the image from the URL: https://i.ibb.co/wNwdtGfn/RVCE-Logo.png
    const logoUrl = 'https://i.ibb.co/wNwdtGfn/RVCE-Logo.png';
    const logoBytes = await downloadImageFromUrl(logoUrl);
    
    // Embed the image in the PDF
    const logoImage = await pdfDoc.embedPng(logoBytes);
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const { width, height } = page.getSize()
      
      // Embed a font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      
      // Draw the logo in the top right corner
      const logoWidth = 100;
      const logoHeight = 50;
      page.drawImage(logoImage, {
        x: width - logoWidth - 20,
        y: height - logoHeight - 20,
        width: logoWidth,
        height: logoHeight,
      });
      
      // Add RVCE verification text to the bottom right corner
      page.drawText('RVCE VERIFIED', {
        x: width - 100,
        y: 20,
        size: 12,
        font: font,
        color: rgb(0.5, 0.5, 0.5), // Gray color
      })
      
      // Add a date/time stamp
      page.drawText(`Verified: ${new Date().toISOString().split('T')[0]}`, {
        x: width - 100,
        y: 10,
        size: 8,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      })
    }
    
    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save()
    return modifiedPdfBytes.buffer.slice(modifiedPdfBytes.byteOffset, modifiedPdfBytes.byteOffset + modifiedPdfBytes.byteLength) as ArrayBuffer
  } catch (error) {
    console.error('Error adding logo to PDF:', error)
    // If there's an error, return the original buffer
    return pdfBuffer
  }
}

// Function to add RVCE logo to document
async function addRVCELogoToDocument(docId: string, documentUrl: string, supabase: any, storagePath: string, fileType: string, fileName: string) {
  try {
    console.log(`Adding RVCE logo to document ${docId}`);
    console.log(`Document URL: ${documentUrl}`);
    console.log(`Storage path: ${storagePath}`);
    console.log(`File type: ${fileType}`);
    
    // Download the original document from storage
    const fileData = await downloadFileFromStorage(storagePath, supabase)
    
    // Convert fileData to ArrayBuffer - explicitly handle the type
    const fileBuffer = await fileData.arrayBuffer()
    const fileArrayBuffer = fileBuffer instanceof ArrayBuffer ? fileBuffer : Buffer.from(fileBuffer).buffer as ArrayBuffer
    
    let processedBuffer: ArrayBuffer
    
    if (fileType === 'application/pdf') {
      // Process PDF file to add logo
      processedBuffer = await addRVCELogoToPDF(fileArrayBuffer) as ArrayBuffer
    } else {
      // For non-PDF files, return the original buffer for now
      // In a real implementation, you would process images differently
      processedBuffer = fileArrayBuffer as ArrayBuffer
    }
    
    // Create a new storage path for the modified document
    const fileExt = path.extname(fileName)
    const fileNameWithoutExt = path.basename(fileName, fileExt)
    const newFileName = `${fileNameWithoutExt}_verified_${Date.now()}${fileExt}`
    const newStoragePath = storagePath.replace(fileName, newFileName)
    
    // Upload the modified document back to storage
    await uploadFileToStorage(processedBuffer, newStoragePath, supabase, fileType)
    
    // Generate the public URL for the new file
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(newStoragePath)
    
    // Return both the public URL and the new storage path
    return { publicUrl, storagePath: newStoragePath };
  } catch (error) {
    console.error('Error adding RVCE logo to document:', error)
    // If processing fails, return the original URL and storage path
    return { publicUrl: documentUrl, storagePath };
  }
}

export async function GET(request: Request, { params }: { params: { docId: string } }) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch document details with verification status
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        id, 
        title, 
        category, 
        created_at, 
        is_public,
        file_url,
        user_id,
        profiles(first_name, last_name, email)
      `)
      .eq('id', params.docId)
      .single();

    if (docError) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user has access to this document (either owner or faculty/admin)
    if (document.user_id !== user.id) {
      // Check if user is faculty/admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profileError || (profileData?.role !== 'faculty' && profileData?.role !== 'admin')) {
        return Response.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Fetch verification history for this document
    // First, check if there's a verification record for this document
    const { data: verificationRecord, error: verifError } = await supabase
      .from('verifications')
      .select('id')
      .eq('document_id', params.docId)
      .single();
    
    let verificationHistory: VerificationHistory[] = [];
    if (verificationRecord) {
      // If there's a verification record, fetch logs related to it
      const { data: logs, error: historyError } = await supabase
        .from('verification_logs')
        .select(`
          id,
          action,
          created_at,
          details,
          profiles(first_name, last_name)
        `)
        .eq('verification_id', verificationRecord.id)
        .order('created_at', { ascending: false });
      
      if (!historyError && logs) {
        verificationHistory = logs;
      }
    }

    // Create verification status response
    const verificationStatus = {
      id: document.id,
      documentId: document.id,
      studentName: `${document.profiles?.[0]?.first_name || 'User'} ${document.profiles?.[0]?.last_name || ''}`.trim() || 'User',
      studentEmail: document.profiles?.[0]?.email || 'N/A',
      documentName: document.title,
      documentType: document.category,
      status: document.is_public ? 'verified' : 'pending',
      requestedAt: document.created_at,
      verificationNotes: document.is_public 
        ? 'Document has been verified successfully.' 
        : 'Document is currently under review. Please check back later for status updates.',
      history: verificationHistory ? verificationHistory.map(log => ({
        id: log.id,
        action: log.action,
        timestamp: log.created_at,
        user: `${log.profiles?.[0]?.first_name || 'User'} ${log.profiles?.[0]?.last_name || ''}`.trim() || 'User',
        details: log.details || ''
      })) : []
    };

    return Response.json({ verification: verificationStatus });
  } catch (error: any) {
    console.error('Error fetching verification status:', error);
    return Response.json({ error: 'Failed to fetch verification status' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { docId: string } }) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is faculty/admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError || (profileData?.role !== 'faculty' && profileData?.role !== 'admin')) {
      return Response.json({ error: 'Access denied. Faculty access only.' }, { status: 403 });
    }

    const data = await request.json();
    const { action, reason } = data;

    if (action === 'verify') {
      // First, fetch the document to get its URL and storage path
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('file_url, storage_path, file_name, file_type, title, user_id')
        .eq('id', params.docId)
        .single();

      if (docError) {
        console.error('Error fetching document:', docError);
        return Response.json({ error: 'Document not found' }, { status: 404 });
      }

      // Add RVCE logo to the document (this is where the actual logo overlay would happen)
      const processedResult = await addRVCELogoToDocument(params.docId, document.file_url, supabase, document.storage_path, document.file_type, document.file_name);
      const processedUrl = processedResult.publicUrl;
      const newStoragePath = processedResult.storagePath;

      // Update document status to verified (is_public = true) and update both URL and storage path if modified
      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({ 
          is_public: true,
          updated_at: new Date().toISOString(),
          file_url: processedUrl, // Update URL if the document was processed
          storage_path: newStoragePath // Update storage path as well
        })
        .eq('id', params.docId);
      
      if (docUpdateError) {
        console.error('Error updating document verification status:', docUpdateError);
        return Response.json({ error: 'Failed to verify document' }, { status: 500 });
      }
      
      // Check if a verification record already exists for this document
      const { data: existingVerification, error: fetchError } = await supabase
        .from('verifications')
        .select('id')
        .eq('document_id', params.docId)
        .single();
      
      let verificationResult;
      if (fetchError) {
        // No existing verification record, create a new one
        verificationResult = await supabase
          .from('verifications')
          .insert({
            document_id: params.docId,
            verifier_id: user.id,
            status: 'approved',
            updated_at: new Date().toISOString()
          });
      } else {
        // Update existing verification record
        verificationResult = await supabase
          .from('verifications')
          .update({
            status: 'approved',
            verifier_id: user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVerification.id);
      }
      
      if (verificationResult.error) {
        console.error('Error updating verification record:', verificationResult.error);
        return Response.json({ error: 'Failed to update verification status' }, { status: 500 });
      }

      // Create a verification log
      const logResult = await supabase
        .from('verification_logs')
        .insert({
          verification_id: params.docId,
          action: 'verified',
          performer_id: user.id,
          performer_role: profileData?.role,
          details: { message: 'Document verified successfully by faculty' },
          score: 100
        });
      
      if (logResult.error) {
        console.error('Error creating verification log:', logResult.error);
        // Don't fail the request if log creation fails
      }

      // Create notification for document owner
      await triggerNotification(
        document.user_id,
        'success',
        'Document Approved! 🎉',
        `Your document "${document.title}" has been approved and verified by faculty.`,
        document.title,
        document.file_url
      );

      // Create audit log
      try {
        await createAuditLog({
          user_id: user.id,
          action: 'approve',
          resource_type: 'document',
          resource_id: params.docId,
          details: {
            document_title: document.title,
            document_owner_id: document.user_id,
            verified_by: user.email
          }
        });
      } catch (auditError) {
        console.error('Error creating audit log:', auditError);
      }

      return Response.json({ 
        success: true, 
        message: 'Document verified successfully',
        processedUrl 
      });
    } else if (action === 'reject') {
      if (!reason) {
        return Response.json({ error: 'Rejection reason is required' }, { status: 400 });
      }
      
      // Update document status to rejected (is_public = false)
      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({ 
          is_public: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.docId);

      if (docUpdateError) {
        console.error('Error updating document verification status:', docUpdateError);
        return Response.json({ error: 'Failed to reject document' }, { status: 500 });
      }
      
      // Check if a verification record already exists for this document
      const { data: existingVerification, error: fetchError } = await supabase
        .from('verifications')
        .select('id')
        .eq('document_id', params.docId)
        .single();
      
      let verificationResult;
      if (fetchError) {
        // No existing verification record, create a new one
        verificationResult = await supabase
          .from('verifications')
          .insert({
            document_id: params.docId,
            verifier_id: user.id,
            status: 'rejected',
            rejection_reason: reason,
            updated_at: new Date().toISOString()
          });
      } else {
        // Update existing verification record
        verificationResult = await supabase
          .from('verifications')
          .update({
            status: 'rejected',
            verifier_id: user.id,
            rejection_reason: reason,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingVerification.id);
      }
      
      if (verificationResult.error) {
        console.error('Error updating verification record:', verificationResult.error);
        return Response.json({ error: 'Failed to update verification status' }, { status: 500 });
      }

      // Create notification for document owner
      await triggerNotification(
        document.user_id,
        'error',
        'Document Rejected ❌',
        `Your document "${document.title}" has been rejected. Reason: ${reason}`,
        document.title,
        document.file_url
      );

      // Create a rejection log
      const logResult = await supabase
        .from('verification_logs')
        .insert({
          verification_id: params.docId,
          action: 'rejected',
          performer_id: user.id,
          performer_role: profileData?.role,
          details: { message: 'Document rejected', reason: reason },
          score: 0
        });
      
      if (logResult.error) {
        console.error('Error creating rejection log:', logResult.error);
        // Don't fail the request if log creation fails
      }

      return Response.json({ success: true, message: 'Document rejected successfully' });
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error processing verification:', error);
    return Response.json({ error: 'Failed to process verification' }, { status: 500 });
  }
}
