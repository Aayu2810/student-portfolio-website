-- 1) Extensions (create whichever your DB provides)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Alternatively you can use gen_random_uuid() from pgcrypto:
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Ensure referenced tables exist (minimal skeletons)
-- If these already exist in your project, these CREATE TABLE IF NOT EXISTS lines are safe and do nothing.

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  verifier_id UUID
);

-- Note: auth.users is provided by Supabase auth. If not present in your DB, remove the FK below or adjust accordingly.

-- 3) Create verification_logs table
CREATE TABLE verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  performer_id UUID NOT NULL,
  performer_role TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX verification_logs_verification_id_idx ON verification_logs(verification_id);
CREATE INDEX verification_logs_performer_id_idx ON verification_logs(performer_id);
CREATE INDEX verification_logs_created_at_idx ON verification_logs(created_at DESC);

-- Enable RLS
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view verification logs for own documents"
  ON verification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM verification_logs vl
      JOIN verifications v ON vl.verification_id = v.id
      JOIN documents d ON v.document_id = d.id
      WHERE vl.id = verification_logs.id
        AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create verification logs"
  ON verification_logs FOR INSERT
  WITH CHECK (auth.uid() = performer_id);

-- Optional: allow performers to delete/update their own logs (adjust as needed)
-- Example: allow performer to update their own log details
CREATE POLICY IF NOT EXISTS "Performer can update own logs"
  ON public.verification_logs
  FOR UPDATE
  USING (performer_id = auth.uid())
  WITH CHECK (performer_id = auth.uid());

-- Example: allow admins (custom claim 'role' = 'admin') to select all logs
CREATE POLICY IF NOT EXISTS "Admins can read all verification logs"
  ON public.verification_logs
  FOR SELECT
  USING ((auth.jwt() ->> 'role') = 'admin');

-- 7) Quick verification queries you can run to confirm objects exist
-- SHOW search_path;
-- SELECT table_schema, table_name FROM information_schema.tables WHERE table_name ILIKE 'verification%';
