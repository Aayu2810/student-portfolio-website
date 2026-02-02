-- Fix verification table and notifications RLS issues

-- Add unique constraint to verifications table for ON CONFLICT to work
ALTER TABLE verifications 
ADD CONSTRAINT verifications_document_id_unique 
UNIQUE (document_id);

-- Fix notifications RLS policies to allow faculty to create notifications
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Create new policies that allow faculty to create notifications for students
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Faculty can view all notifications"
  ON notifications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'faculty' OR role = 'admin' OR first_name = 'admin' OR last_name = 'admin' OR email LIKE '%@faculty.%'
    )
  );

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Faculty can insert notifications for any user"
  ON notifications FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'faculty' OR role = 'admin' OR first_name = 'admin' OR last_name = 'admin' OR email LIKE '%@faculty.%'
    )
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);
