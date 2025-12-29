-- Add rejection reason column to verifications table
ALTER TABLE verifications ADD COLUMN rejection_reason TEXT;

-- Update the RLS policies to include the new column
-- (No changes needed to existing policies since we're just adding a column)