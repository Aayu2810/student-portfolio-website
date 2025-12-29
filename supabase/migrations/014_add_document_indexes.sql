-- Add indexes for documents table to improve query performance

-- Index on user_id for filtering user documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents (user_id);

-- Index on created_at for ordering and time-based queries
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents (created_at DESC);

-- Index on is_public for filtering public documents
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents (is_public);

-- Index on category for filtering by category
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category);

-- Composite index for common query patterns (user_id and created_at)
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON documents (user_id, created_at DESC);

-- Index on title for search functionality
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents (title);

-- Index on file_type for filtering by file type
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents (file_type);

-- Index on file_size for storage calculations
CREATE INDEX IF NOT EXISTS idx_documents_file_size ON documents (file_size);