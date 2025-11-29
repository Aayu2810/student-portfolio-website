-- seed.sql (enhanced)
-- Add minimal sample data for testing new tables

-- Sample categories
INSERT INTO categories (slug, name, description)
VALUES ('certificate','Certificate','Official course or achievement certificate')
ON CONFLICT (slug) DO NOTHING;

-- Sample folders (owner_id must match an existing profile id in your DB)
-- Replace '00000000-0000-0000-0000-000000000000' with a real profiles.id in dev
INSERT INTO folders (owner_id, name, description)
VALUES ('00000000-0000-0000-0000-000000000000','Certificates','Official certificates folder')
ON CONFLICT DO NOTHING;

-- Sample document metadata (document_id must exist in documents table)
INSERT INTO document_metadata (document_id, title, doc_type, pages, file_size_bytes, mime_type, checksum)
VALUES ('00000000-0000-0000-0000-000000000001','Sample Certificate','certificate',2,230000,'application/pdf','sha256:examplechecksum')
ON CONFLICT DO NOTHING;

-- Sample verification log (document_id must exist)
INSERT INTO verification_logs (document_id, verified_by, status, comment)
VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'pending', 'Seed: pending verification')
ON CONFLICT DO NOTHING;
