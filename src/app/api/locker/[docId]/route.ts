// Single Document API - DELETE/GET single document
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { docId: string } }) {
  // TODO: Fetch single document
  return NextResponse.json({ document: null })
}

export async function DELETE(request: Request, { params }: { params: { docId: string } }) {
  // TODO: Delete document
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: { docId: string } }) {
  // TODO: Update document
  return NextResponse.json({ success: true })
}
