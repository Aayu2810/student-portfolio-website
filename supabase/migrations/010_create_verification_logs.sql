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
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'requested', 'approved', 'rejected', 'updated'
  performer_id UUID NOT NULL REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_logs_verification_id ON public.verification_logs(verification_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_performer_id ON public.verification_logs(performer_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON public.verification_logs(created_at DESC);

-- 5) Enable RLS on the logs table
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- 6) Create RLS policies
-- Policy: users can SELECT logs for documents they own OR if they are the verifier
CREATE POLICY IF NOT EXISTS "Users can view verification logs for own documents"
  ON public.verification_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.verifications v
      JOIN public.documents d ON v.document_id = d.id
      WHERE v.id = public.verification_logs.verification_id
        AND (d.user_id = auth.uid() OR v.verifier_id = auth.uid())
    )
  );

-- Policy: allow authenticated users to INSERT logs where performer_id matches their auth.uid()
CREATE POLICY IF NOT EXISTS "System can create verification logs"
  ON public.verification_logs
  FOR INSERT
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
