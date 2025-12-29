-- Add faculty access to documents table
-- This allows faculty and admin roles to view all documents

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

-- Create new policies with faculty access

-- Users can view own documents, faculty can view all documents
CREATE POLICY "Users can view own documents, faculty can view all"
  ON documents FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('faculty', 'admin')
    )
  );

-- Users can insert own documents
CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own documents, faculty can update all documents
CREATE POLICY "Users can update own documents, faculty can update all"
  ON documents FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('faculty', 'admin')
    )
  );

-- Users can delete own documents, faculty can delete all documents
CREATE POLICY "Users can delete own documents, faculty can delete all"
  ON documents FOR DELETE
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('faculty', 'admin')
    )
  );

-- Update verifications table policies as well
DROP POLICY IF EXISTS "Users can view verifications of own documents" ON verifications;
DROP POLICY IF EXISTS "Faculty can view all verifications" ON verifications;
DROP POLICY IF EXISTS "Faculty can insert verifications" ON verifications;

-- Users can view verifications of own documents, faculty can view all verifications
CREATE POLICY "Users can view verifications of own documents, faculty can view all"
  ON verifications FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('faculty', 'admin')
    )
  );

-- Faculty can insert/update verifications
CREATE POLICY "Faculty can manage verifications"
  ON verifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('faculty', 'admin')
    )
  );
