// Document Search API

// Mock data for search results
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
    description: "Official degree certificate from RVCE"
  },
  {
    id: "2",
    name: "Transcript.pdf",
    type: "file",
    fileType: "application/pdf",
    size: 1843200,
    status: "pending",
    uploadedAt: "2024-11-20T14:15:00Z",
    description: "Academic transcript for all semesters"
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
    description: "Student identification card"
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    // In a real implementation, we would perform a full-text search
    // For now, we'll filter mock documents based on the query
    const results = mockDocuments.filter(doc => 
      doc.name.toLowerCase().includes(query.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(query.toLowerCase()))
    );
    
    return Response.json({ results });
  } catch (error) {
    console.error('Error searching documents:', error);
    return Response.json({ error: 'Failed to search documents' }, { status: 500 });
  }
}
