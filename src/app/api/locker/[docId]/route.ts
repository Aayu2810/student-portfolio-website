// Single Document API - DELETE/GET single document

// Mock data for a document
const mockDocument = {
  id: "1",
  name: "Degree Certificate.pdf",
  type: "file",
  fileType: "application/pdf",
  size: 2457600,
  status: "verified",
  uploadedAt: "2024-11-15T10:30:00Z",
  thumbnailUrl: "https://via.placeholder.com/400x300/6366f1/ffffff?text=Degree+Certificate",
  fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  description: "Official degree certificate from RVCE",
  tags: ["academic", "certificate", "degree"]
};

export async function GET(request: Request, { params }: { params: { docId: string } }) {
  try {
    // In a real implementation, we would fetch the document by ID
    // For now, we'll return the mock document if the ID matches
    if (params.docId === "1") {
      return Response.json({ document: mockDocument });
    }
    
    return Response.json({ document: null });
  } catch (error) {
    console.error('Error fetching document:', error);
    return Response.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { docId: string } }) {
  try {
    // In a real implementation, we would delete the document by ID
    console.log(`Deleting document with ID: ${params.docId}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return Response.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { docId: string } }) {
  try {
    // In a real implementation, we would update the document by ID
    const data = await request.json();
    console.log(`Updating document with ID: ${params.docId}`, data);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating document:', error);
    return Response.json({ error: 'Failed to update document' }, { status: 500 });
  }
}
