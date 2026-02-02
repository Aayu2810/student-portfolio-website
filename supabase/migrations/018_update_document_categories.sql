-- Update document categories to match new category system
-- This migration updates the CHECK constraint to allow new categories

-- First, drop the old constraint
ALTER TABLE documents DROP CONSTRAINT documents_category_check;

-- Add the new constraint with updated categories
ALTER TABLE documents 
ADD CONSTRAINT documents_category_check 
CHECK (category = ANY (ARRAY['academic'::text, 'certificates'::text, 'professional'::text, 'identity'::text, 'personal'::text, 'property'::text, 'other'::text]));

-- Optional: Update existing documents with old categories to new ones
UPDATE documents 
SET category = CASE 
  WHEN category = 'resume' THEN 'professional'
  WHEN category = 'certificate' THEN 'certificates' 
  WHEN category = 'transcript' THEN 'academic'
  WHEN category = 'project' THEN 'professional'
  ELSE category
END
WHERE category IN ('resume', 'certificate', 'transcript', 'project');
