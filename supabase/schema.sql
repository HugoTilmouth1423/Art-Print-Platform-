-- Custom Artwork Platform Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid_in_progress' CHECK (
    status IN (
      'paid_in_progress',
      'proof_ready',
      'revision_requested',
      'approved',
      'sent_to_print',
      'shipped'
    )
  ),
  size TEXT NOT NULL CHECK (size IN ('A4', 'A3', 'A2', 'A1')),
  frame TEXT NOT NULL CHECK (frame IN ('none', 'black', 'white', 'natural')),
  price_paid INTEGER NOT NULL, -- in pence
  stripe_session_id TEXT,
  prodigi_order_id TEXT,
  revision_used BOOLEAN NOT NULL DEFAULT FALSE,
  revision_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reference', 'layer', 'texture')),
  layer_role TEXT CHECK (layer_role IN ('background', 'ground', 'shading', 'highlight')),
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Palettes table
CREATE TABLE IF NOT EXISTS palettes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT,
  colors TEXT[] NOT NULL, -- Array of 5 hex colors
  is_selected BOOLEAN NOT NULL DEFAULT FALSE,
  is_preset BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_uploads_project_id ON uploads(project_id);
CREATE INDEX IF NOT EXISTS idx_palettes_project_id ON palettes(project_id);
CREATE INDEX IF NOT EXISTS idx_palettes_is_preset ON palettes(is_preset) WHERE is_preset = TRUE;

-- Row Level Security (RLS) policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE palettes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to preset palettes only
CREATE POLICY "Public can read preset palettes"
  ON palettes FOR SELECT
  USING (is_preset = TRUE);

-- Allow authenticated admin to do everything
CREATE POLICY "Admin full access to projects"
  ON projects FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Admin full access to uploads"
  ON uploads FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Admin full access to palettes"
  ON palettes FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Service role policies for API operations (webhooks, etc.)
-- These are handled by the service role key which bypasses RLS

-- Storage bucket for artwork files
-- Note: Run this separately in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('artwork', 'artwork', true);

-- Comments for documentation
COMMENT ON TABLE projects IS 'Customer artwork commission projects';
COMMENT ON TABLE uploads IS 'Uploaded files for projects (reference photos, artwork layers, textures)';
COMMENT ON TABLE palettes IS 'Color palettes for projects (customer selections and global presets)';
COMMENT ON COLUMN projects.price_paid IS 'Price in pence (GBP)';
COMMENT ON COLUMN uploads.layer_role IS 'Only set when type is layer: background, ground, shading, or highlight';
COMMENT ON COLUMN palettes.colors IS 'Array of 5 hex color strings';
