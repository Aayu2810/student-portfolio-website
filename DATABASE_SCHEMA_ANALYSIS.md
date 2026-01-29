# Database Schema Analysis

## Issues Found

### 1. **CRITICAL: Status Value Mismatch in `verifications` table**

**Problem:**
- The code inserts `status: 'approved'` into the `verifications` table (lines 402, 419 in route.ts)
- But the frontend expects status values: `'pending' | 'in-review' | 'verified' | 'rejected'`
- There's a mismatch between what's stored (`'approved'`) and what's expected (`'verified'`)

**Current Schema:**
```sql
status text NOT NULL DEFAULT 'pending'
```

**Code Usage:**
- Inserts: `'approved'` or `'rejected'`
- Frontend expects: `'pending' | 'in-review' | 'verified' | 'rejected'`

**Recommendation:**
Add a CHECK constraint to ensure valid status values:
```sql
ALTER TABLE verifications 
ADD CONSTRAINT verifications_status_check 
CHECK (status IN ('pending', 'in-review', 'verified', 'rejected', 'approved'));
```

**OR** (Better solution): Update the code to use `'verified'` instead of `'approved'` to match frontend expectations.

### 2. **Missing Foreign Key Constraint**

**Problem:**
- `verifications.verifier_id` should reference `profiles(id)` or `auth.users(id)`
- Currently it's just `uuid` without a foreign key constraint

**Recommendation:**
```sql
ALTER TABLE verifications 
ADD CONSTRAINT verifications_verifier_id_fkey 
FOREIGN KEY (verifier_id) REFERENCES profiles(id) ON DELETE SET NULL;
```

### 3. **Missing Indexes**

**Recommendation:**
```sql
-- Index for faster lookups by status
CREATE INDEX IF NOT EXISTS verifications_status_idx ON verifications(status);

-- Index for rejection_reason lookups (if you query by this)
CREATE INDEX IF NOT EXISTS verifications_rejection_reason_idx ON verifications(rejection_reason) WHERE rejection_reason IS NOT NULL;
```

### 4. **verification_logs.performer_id Missing Foreign Key**

**Problem:**
- `performer_id` should reference `profiles(id)` or `auth.users(id)`

**Recommendation:**
```sql
ALTER TABLE verification_logs 
ADD CONSTRAINT verification_logs_performer_id_fkey 
FOREIGN KEY (performer_id) REFERENCES profiles(id) ON DELETE SET NULL;
```

### 5. **profiles.role Missing CHECK Constraint**

**Problem:**
- The code expects: `'student' | 'faculty' | 'admin'`
- No constraint ensures only valid roles

**Recommendation:**
```sql
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'faculty', 'admin'));
```

### 6. **Missing RLS Policies for UPDATE Operations**

**Problem:**
- The schema shows INSERT and SELECT policies for verifications
- But UPDATE policies are missing (needed for faculty to update verification status)

**Recommendation:**
```sql
CREATE POLICY "Faculty can update verifications"
  ON verifications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('faculty', 'admin')
    )
  );
```

### 7. **Missing RLS Policy for verification_logs INSERT**

**Problem:**
- The migration shows a policy "System can create verification logs" but it's incomplete
- Need proper policy for faculty/admin to insert logs

**Recommendation:**
```sql
CREATE POLICY "Faculty can create verification logs"
  ON verification_logs FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('faculty', 'admin')
    )
  );
```

## Schema Corrections Needed

### Fix Status Values
The code should be updated to use `'verified'` instead of `'approved'` OR the database should accept both. I recommend updating the code to use `'verified'` consistently.

### Add Missing Constraints
```sql
-- Add status constraint
ALTER TABLE verifications 
ADD CONSTRAINT verifications_status_check 
CHECK (status IN ('pending', 'in-review', 'verified', 'rejected', 'approved'));

-- Add role constraint  
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('student', 'faculty', 'admin'));

-- Add foreign keys
ALTER TABLE verifications 
ADD CONSTRAINT verifications_verifier_id_fkey 
FOREIGN KEY (verifier_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE verification_logs 
ADD CONSTRAINT verification_logs_performer_id_fkey 
FOREIGN KEY (performer_id) REFERENCES profiles(id) ON DELETE SET NULL;
```

## What's Correct ✅

1. ✅ All required tables exist (documents, verifications, verification_logs, profiles, etc.)
2. ✅ Foreign keys for document_id are correct
3. ✅ rejection_reason column exists in verifications
4. ✅ All required fields for documents table are present
5. ✅ verification_logs structure matches code usage
6. ✅ profiles.role field exists with default 'student'

## Summary

The schema is **mostly correct** but needs:
1. Status value consistency fix (use 'verified' instead of 'approved' OR add constraint)
2. Missing foreign key constraints
3. Missing CHECK constraints for role and status
4. Missing RLS UPDATE policies
5. Missing indexes for performance


