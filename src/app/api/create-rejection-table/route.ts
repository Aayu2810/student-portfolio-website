import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Create the document_rejections table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS document_rejections (
          document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
          rejected_by UUID REFERENCES auth.users(id),
          rejection_reason TEXT,
          rejected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Add indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_document_rejections_document_id ON document_rejections(document_id);
        CREATE INDEX IF NOT EXISTS idx_document_rejections_rejected_by ON document_rejections(rejected_by);
      `
    })
    
    if (error) {
      console.error('Error creating table:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Document rejections table created successfully' })
    
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
