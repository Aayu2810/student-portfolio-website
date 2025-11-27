// Single Document Verification Status API
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { docId: string } }) {
  // TODO: Get verification status for document
  return NextResponse.json({ status: 'pending' })
}

export async function POST(request: Request, { params }: { params: { docId: string } }) {
  // TODO: Approve/reject verification
  return NextResponse.json({ success: true })
}
