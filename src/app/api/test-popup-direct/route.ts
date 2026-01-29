import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    notifications: [{
      id: 'test-notification-123',
      title: '🎉 Test Notification',
      message: 'This is a test popup to verify the notification system is working perfectly!',
      type: 'success',
      read: false,
      created_at: new Date().toISOString()
    }]
  })
}
