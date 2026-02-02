import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import * as path from 'path'

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

export async function GET(request: Request, { params }: { params: Promise<{ docId: string }> }) {
  try {
    const { docId } = await params
    const supabase = await createClient();
    
    // Fetch document details with verification status
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, title, category, created_at, is_public, file_url, storage_path, file_name, file_type')
      .eq('id', docId)
      .single();

    if (docError) {
      console.error('Error fetching document:', docError);
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if the document is verified and is a PDF to add the RVCE logo
    if (document.is_public && document.file_type === 'application/pdf') {
      // Download the original document
      const fileData = await downloadFileFromStorage(document.storage_path, supabase);
      const fileBuffer = await fileData.arrayBuffer();
      
      // Add the RVCE logo to the PDF
      const processedBuffer = await addRVCELogoToPDF(fileBuffer);
      
      // Create response with the processed document
      const response = new NextResponse(processedBuffer);
      
      // Set appropriate headers for inline display (not attachment)
      response.headers.set('Content-Type', 'application/pdf');
      response.headers.set('Content-Disposition', 'inline');
      response.headers.set('Content-Length', processedBuffer.byteLength.toString());
      response.headers.set('Cache-Control', 'no-cache');
      
      return response;
    } else {
      // For non-verified documents or non-PDF files, serve directly from storage
      const fileData = await downloadFileFromStorage(document.storage_path, supabase);
      const fileBuffer = await fileData.arrayBuffer();
      
      // Create response with the document
      const response = new NextResponse(fileBuffer);
      
      // Set appropriate headers for inline display
      response.headers.set('Content-Type', document.file_type);
      response.headers.set('Content-Disposition', 'inline');
      response.headers.set('Content-Length', fileBuffer.byteLength.toString());
      response.headers.set('Cache-Control', 'no-cache');
      
      return response;
    }
    
  } catch (error: any) {
    console.error('Error previewing document:', error);
    return NextResponse.json({ error: 'Failed to preview document' }, { status: 500 });
  }
}