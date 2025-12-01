// Locker API - GET/POST documents

// Mock data for documents
const mockDocuments = [
  {
    id: "1",
    name: "Degree Certificate.pdf",
    type: "file",
    fileType: "application/pdf",
    size: 2457600,
    status: "verified",
    uploadedAt: "2024-11-15T10:30:00Z",
    thumbnailUrl: "https://via.placeholder.com/400x300/6366f1/ffffff?text=Degree+Certificate",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  },
  {
    id: "2",
    name: "Transcript.pdf",
    type: "file",
    fileType: "application/pdf",
    size: 1843200,
    status: "pending",
    uploadedAt: "2024-11-20T14:15:00Z",
  },
  {
    id: "3",
    name: "ID Card.jpg",
    type: "file",
    fileType: "image/jpeg",
    size: 512000,
    status: "rejected",
    uploadedAt: "2024-11-22T09:45:00Z",
    thumbnailUrl: "https://via.placeholder.com/400x300/ec4899/ffffff?text=ID+Card",
  },
  {
    id: "4",
    name: "Resume.pdf",
    type: "file",
    fileType: "application/pdf",
    size: 327680,
    status: "verified",
    uploadedAt: "2024-11-25T16:20:00Z",
  },
];

export async function GET() {
  try {
    // Return mock documents for now
    return Response.json({ documents: mockDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return Response.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Process document upload...
    return Response.json({ success: true, documentId: `doc-${Date.now()}` });
  } catch (error) {
    console.error('Error creating document:', error);
    return Response.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
