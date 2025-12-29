import { createClient } from '../../../lib/supabase/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

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
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pages = pdfDoc.getPages()
    
    // Download the RVCE logo
    const logoUrl = 'https://i.ibb.co/wNwdtGfn/RVCE-Logo.png';
    const logoBytes = await downloadImageFromUrl(logoUrl);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const { width, height } = page.getSize()
      
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
        color: rgb(0.5, 0.5, 0.5),
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
    
    const modifiedPdfBytes = await pdfDoc.save()
    return modifiedPdfBytes.buffer.slice(modifiedPdfBytes.byteOffset, modifiedPdfBytes.byteOffset + modifiedPdfBytes.byteLength) as ArrayBuffer
  } catch (error) {
    console.error('Error adding logo to PDF:', error)
    return pdfBuffer
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId, fileUrl, fileName, fileType } = await request.json();

    if (!documentId || !fileUrl || !fileName || !fileType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only process PDF files for attestation
    if (fileType !== 'application/pdf') {
      return Response.json({ 
        attestedUrl: fileUrl,
        message: 'Only PDF files can be attested with RVCE logo'
      });
    }

    // Download the original file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download original file');
    }

    const fileBuffer = await fileResponse.arrayBuffer();

    // Add RVCE logo to the PDF
    const attestedBuffer = await addRVCELogoToPDF(fileBuffer);

    // Store the attested file temporarily (you could use a temporary storage or return as base64)
    const base64Data = Buffer.from(attestedBuffer).toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64Data}`;

    return Response.json({ 
      attestedUrl: dataUrl,
      message: 'Document attested successfully'
    });

  } catch (error: any) {
    console.error('Error creating attested document:', error);
    return Response.json({ error: 'Failed to create attested document' }, { status: 500 });
  }
}
