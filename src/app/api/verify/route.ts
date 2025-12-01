// Verification API - POST verification

// Mock data for verifications
const mockVerifications = [
  {
    id: "1",
    documentId: "doc1",
    studentName: "John Doe",
    studentEmail: "john.doe@rvce.edu.in",
    documentName: "Degree Certificate.pdf",
    documentType: "Academic Certificate",
    status: "pending",
    requestedAt: "2024-11-27T10:00:00Z",
  },
  {
    id: "2",
    documentId: "doc2",
    studentName: "Jane Smith",
    studentEmail: "jane.smith@rvce.edu.in",
    documentName: "Transcript.pdf",
    documentType: "Academic Transcript",
    status: "in-review",
    requestedAt: "2024-11-26T14:30:00Z",
  },
  {
    id: "3",
    documentId: "doc3",
    studentName: "Robert Johnson",
    studentEmail: "robert.j@rvce.edu.in",
    documentName: "ID Card.jpg",
    documentType: "Identity Document",
    status: "verified",
    requestedAt: "2024-11-25T09:15:00Z",
    verifiedAt: "2024-11-25T14:20:00Z",
    verifiedBy: "Admin User"
  },
];

export async function GET() {
  try {
    // Return mock verifications for now
    return Response.json({ verifications: mockVerifications });
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
