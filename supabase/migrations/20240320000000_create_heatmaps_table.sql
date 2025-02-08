CREATE TABLE IF NOT EXISTS heatmaps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  values TEXT NOT NULL DEFAULT '[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]]',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS policies
ALTER TABLE heatmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own heatmaps"
  ON heatmaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own heatmaps"
  ON heatmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own heatmaps"
  ON heatmaps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own heatmaps"
  ON heatmaps FOR DELETE
  USING (auth.uid() = user_id); 