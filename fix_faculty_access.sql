-- Run this script in Supabase SQL Editor to fix faculty access issues
-- This will allow faculty to see ALL users' documents and verification requests

-- Step 1: Update documents table policies
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

-- Step 2: Create new documents policies with faculty access
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

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

-- Step 3: Update verifications table policies
DROP POLICY IF EXISTS "Users can view verifications of own documents" ON verifications;
DROP POLICY IF EXISTS "Faculty can view all verifications" ON verifications;
DROP POLICY IF EXISTS "Faculty can insert verifications" ON verifications;

-- Step 4: Create new verifications policies with proper role-based access
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

CREATE POLICY "Faculty can manage verifications"
  ON verifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('faculty', 'admin')
    )
  );

-- Step 5: Verify the policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('documents', 'verifications')
ORDER BY tablename, policyname;
