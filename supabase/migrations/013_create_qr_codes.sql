-- Create QR Codes Table
CREATE TABLE qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_link_id UUID NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
  qr_data TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index
CREATE INDEX qr_codes_share_link_id_idx ON qr_codes(share_link_id);

-- Enable RLS
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view QR codes for own shares" ON qr_codes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM share_links
      WHERE share_links.id = qr_codes.share_link_id
      AND share_links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create QR codes for own shares" ON qr_codes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM share_links
      WHERE share_links.id = qr_codes.share_link_id
      AND share_links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete QR codes for own shares" ON qr_codes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM share_links
      WHERE share_links.id = qr_codes.share_link_id
      AND share_links.user_id = auth.uid()
    )
  );