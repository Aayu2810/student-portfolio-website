// Single Document Verification Status API

// Mock data for verification status
const mockVerificationStatus = {
  id: "1",
  documentId: "doc1",
  studentName: "John Doe",
  studentEmail: "john.doe@rvce.edu.in",
  documentName: "Degree Certificate.pdf",
  documentType: "Academic Certificate",
  status: "pending",
  requestedAt: "2024-11-27T10:00:00Z",
  verificationNotes: "Document is currently under review. Please check back later for status updates.",
  history: [
    {
      id: "hist1",
      action: "uploaded",
      timestamp: "2024-11-27T10:00:00Z",
      user: "John Doe",
      details: "Document uploaded for verification"
    },
    {
      id: "hist2",
      action: "in-review",
      timestamp: "2024-11-27T11:30:00Z",
      user: "Admin User",
      details: "Verification process started"
    }
  ]
};

export async function GET(request: Request, { params }: { params: { docId: string } }) {
  try {
    // In a real implementation, we would fetch the verification status by document ID
    // For now, we'll return the mock status
    return Response.json({ verification: mockVerificationStatus });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return Response.json({ error: 'Failed to fetch verification status' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { docId: string } }) {
  try {
    // In a real implementation, we would approve/reject the verification
    const data = await request.json();
    console.log(`Processing verification for document ID: ${params.docId}`, data);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error processing verification:', error);
    return Response.json({ error: 'Failed to process verification' }, { status: 500 });
  }
}
