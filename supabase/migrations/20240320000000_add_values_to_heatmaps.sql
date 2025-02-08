-- Add values column to heatmaps table
ALTER TABLE heatmaps 
ADD COLUMN IF NOT EXISTS values TEXT;

-- Initialize values for existing rows (optional)
UPDATE heatmaps 
SET values = '[[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]]'
WHERE values IS NULL; 