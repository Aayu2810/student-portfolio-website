-- Add missing columns to portfolios table if they don't exist
DO $$
BEGIN
    -- Check if enable_qr_code column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolios' AND column_name = 'enable_qr_code'
    ) THEN
        ALTER TABLE portfolios ADD COLUMN enable_qr_code BOOLEAN DEFAULT true;
    END IF;

    -- Check if is_public column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolios' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE portfolios ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;

    -- Check if custom_domain column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolios' AND column_name = 'custom_domain'
    ) THEN
        ALTER TABLE portfolios ADD COLUMN custom_domain TEXT;
    END IF;

    -- Check if theme column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolios' AND column_name = 'theme'
    ) THEN
        ALTER TABLE portfolios ADD COLUMN theme TEXT DEFAULT 'modern';
    END IF;

    -- Check if skills column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolios' AND column_name = 'skills'
    ) THEN
        ALTER TABLE portfolios ADD COLUMN skills TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the table structure
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'portfolios' 
ORDER BY ordinal_position;
