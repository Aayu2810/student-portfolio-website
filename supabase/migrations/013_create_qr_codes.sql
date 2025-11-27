-- Create QR Codes Table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_link_id UUID NOT NULL REFERENCES shared_links(id) ON DELETE CASCADE,
  qr_data TEXT NOT NULL, -- Base64 encoded QR code image
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_qr_codes_share_link_id ON qr_codes(share_link_id);

-- Enable RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view QR codes for own shares" ON qr_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_links
      WHERE shared_links.id = qr_codes.share_link_id
      AND shared_links.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create QR codes for own shares" ON qr_codes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shared_links
      WHERE shared_links.id = qr_codes.share_link_id
      AND shared_links.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete QR codes for own shares" ON qr_codes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM shared_links
      WHERE shared_links.id = qr_codes.share_link_id
      AND shared_links.created_by = auth.uid()
    )
  );
