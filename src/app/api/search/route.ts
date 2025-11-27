// Document Search API
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // TODO: Implement full-text search
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  return NextResponse.json({ results: [] })
}
