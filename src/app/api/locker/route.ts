// Locker API - GET/POST documents
import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Fetch user's documents
  return NextResponse.json({ documents: [] })
}

export async function POST() {
  // TODO: Create new document entry
  return NextResponse.json({ success: true })
}
