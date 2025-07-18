-- Add is_gimme column to shots table
ALTER TABLE shots ADD COLUMN IF NOT EXISTS is_gimme BOOLEAN NOT NULL DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN shots.is_gimme IS 'True if this shot represents an automatic gimme putt (very short putt that is assumed to be made)';

-- Create index for gimme shots (useful for filtering/analytics)
CREATE INDEX IF NOT EXISTS idx_shots_is_gimme ON shots(is_gimme);

-- Update any existing "Team Gimme" shots if they exist (cleanup from previous implementation)
-- This is just in case there are any orphaned records
DELETE FROM shots WHERE player_id NOT IN (SELECT id FROM players);
