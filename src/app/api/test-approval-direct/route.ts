import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    notifications: [{
      id: 'test-approval-123',
      title: 'Document Approved! 🎉',
      message: 'Your document "Test Document.pdf" has been approved by faculty and is now public.',
      type: 'success',
      read: false,
      created_at: new Date().toISOString()
    }]
  })
}
