-- Create heatmap_data table for caching
CREATE TABLE IF NOT EXISTS heatmap_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  heatmap_id UUID REFERENCES heatmaps(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(heatmap_id)
);

-- Add RLS policies
ALTER TABLE heatmap_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own heatmap data"
  ON heatmap_data
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM heatmaps
      WHERE heatmaps.id = heatmap_data.heatmap_id
      AND heatmaps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own heatmap data"
  ON heatmap_data
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM heatmaps
      WHERE heatmaps.id = heatmap_data.heatmap_id
      AND heatmaps.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own heatmap data"
  ON heatmap_data
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM heatmaps
      WHERE heatmaps.id = heatmap_data.heatmap_id
      AND heatmaps.user_id = auth.uid()
    )
  ); 