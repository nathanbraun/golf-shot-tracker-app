-- Create shots table for detailed shot tracking
CREATE TABLE IF NOT EXISTS shots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
  shot_number INTEGER NOT NULL CHECK (shot_number >= 1),
  shot_type VARCHAR(50) NOT NULL CHECK (shot_type IN ('Drive', 'Approach', 'Chip', 'Putt', 'Sand', 'Recovery')),
  start_distance INTEGER NOT NULL CHECK (start_distance >= 0),
  end_distance INTEGER NOT NULL CHECK (end_distance >= 0),
  calculated_distance INTEGER NOT NULL CHECK (calculated_distance >= 0),
  made BOOLEAN NOT NULL DEFAULT false,
  is_nut BOOLEAN NOT NULL DEFAULT false,
  is_clutch BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_hole_completions table for hole-level tracking and feed
CREATE TABLE IF NOT EXISTS team_hole_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
  par INTEGER NOT NULL CHECK (par >= 3 AND par <= 5),
  total_shots INTEGER NOT NULL CHECK (total_shots >= 1),
  score_to_par INTEGER NOT NULL, -- calculated: total_shots - par
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Optional aggregate stats for the feed
  longest_shot_distance INTEGER,
  longest_shot_player_id UUID REFERENCES players(id),
  longest_shot_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure one completion per team per hole per round
  UNIQUE(round_id, team_id, hole_number)
);

-- Enable Row Level Security
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_hole_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for shots table
-- Allow anyone to read shots (public data for team competition)
CREATE POLICY "Anyone can view shots" ON shots
  FOR SELECT USING (true);

-- Allow anyone to insert shots
CREATE POLICY "Anyone can insert shots" ON shots
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update shots
CREATE POLICY "Anyone can update shots" ON shots
  FOR UPDATE USING (true);

-- Allow anyone to delete shots
CREATE POLICY "Anyone can delete shots" ON shots
  FOR DELETE USING (true);

-- Create policies for team_hole_completions table
-- Allow anyone to read hole completions (public data for feed)
CREATE POLICY "Anyone can view team hole completions" ON team_hole_completions
  FOR SELECT USING (true);

-- Allow anyone to insert hole completions
CREATE POLICY "Anyone can insert team hole completions" ON team_hole_completions
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update hole completions
CREATE POLICY "Anyone can update team hole completions" ON team_hole_completions
  FOR UPDATE USING (true);

-- Allow anyone to delete hole completions
CREATE POLICY "Anyone can delete team hole completions" ON team_hole_completions
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shots_round_id ON shots(round_id);
CREATE INDEX IF NOT EXISTS idx_shots_team_id ON shots(team_id);
CREATE INDEX IF NOT EXISTS idx_shots_player_id ON shots(player_id);
CREATE INDEX IF NOT EXISTS idx_shots_hole_number ON shots(hole_number);
CREATE INDEX IF NOT EXISTS idx_shots_round_team_hole ON shots(round_id, team_id, hole_number);
CREATE INDEX IF NOT EXISTS idx_shots_created_at ON shots(created_at);

CREATE INDEX IF NOT EXISTS idx_team_hole_completions_round_id ON team_hole_completions(round_id);
CREATE INDEX IF NOT EXISTS idx_team_hole_completions_team_id ON team_hole_completions(team_id);
CREATE INDEX IF NOT EXISTS idx_team_hole_completions_hole_number ON team_hole_completions(hole_number);
CREATE INDEX IF NOT EXISTS idx_team_hole_completions_completed_at ON team_hole_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_team_hole_completions_round_completed ON team_hole_completions(round_id, completed_at DESC);

-- Insert some sample data for testing
DO $$
DECLARE
  sample_round_id UUID;
  team1_id UUID;
  team2_id UUID;
  brusda_id UUID;
  nate_id UUID;
  mikey_id UUID;
  strauss_id UUID;
BEGIN
  -- Get existing IDs
  SELECT id INTO sample_round_id FROM rounds WHERE name LIKE '%Weekly Scramble%' LIMIT 1;
  SELECT id INTO team1_id FROM teams WHERE name = 'Team Thunder' LIMIT 1;
  SELECT id INTO team2_id FROM teams WHERE name = 'Team Lightning' LIMIT 1;
  SELECT id INTO brusda_id FROM players WHERE name = 'Brusda' LIMIT 1;
  SELECT id INTO nate_id FROM players WHERE name = 'Nate' LIMIT 1;
  SELECT id INTO mikey_id FROM players WHERE name = 'Mikey' LIMIT 1;
  SELECT id INTO strauss_id FROM players WHERE name = 'Strauss' LIMIT 1;
  
  -- Only proceed if we have the required data
  IF sample_round_id IS NOT NULL AND team1_id IS NOT NULL AND brusda_id IS NOT NULL THEN
    -- Sample shots for Team Thunder, Hole 1 (Par 4)
    INSERT INTO shots (round_id, team_id, player_id, hole_number, shot_number, shot_type, start_distance, end_distance, calculated_distance, made, is_nut, is_clutch) VALUES
      (sample_round_id, team1_id, brusda_id, 1, 1, 'Drive', 376, 140, 236, false, true, false),
      (sample_round_id, team1_id, nate_id, 1, 2, 'Approach', 140, 15, 125, false, false, false),
      (sample_round_id, team1_id, mikey_id, 1, 3, 'Chip', 15, 3, 12, false, false, true),
      (sample_round_id, team1_id, strauss_id, 1, 4, 'Putt', 3, 0, 3, true, false, false);
    
    -- Sample hole completion for Team Thunder, Hole 1
    INSERT INTO team_hole_completions (round_id, team_id, hole_number, par, total_shots, score_to_par, longest_shot_distance, longest_shot_player_id, longest_shot_type) VALUES
      (sample_round_id, team1_id, 1, 4, 4, 0, 236, brusda_id, 'Drive');
    
    -- Sample shots for Team Lightning, Hole 1 (Par 4) - they got a birdie
    IF team2_id IS NOT NULL THEN
      INSERT INTO shots (round_id, team_id, player_id, hole_number, shot_number, shot_type, start_distance, end_distance, calculated_distance, made, is_nut, is_clutch) VALUES
        (sample_round_id, team2_id, mikey_id, 1, 1, 'Drive', 376, 120, 256, false, false, false),
        (sample_round_id, team2_id, strauss_id, 1, 2, 'Approach', 120, 8, 112, false, false, true),
        (sample_round_id, team2_id, nate_id, 1, 3, 'Putt', 8, 0, 8, true, true, false);
      
      -- Sample hole completion for Team Lightning, Hole 1 (Birdie!)
      INSERT INTO team_hole_completions (round_id, team_id, hole_number, par, total_shots, score_to_par, longest_shot_distance, longest_shot_player_id, longest_shot_type) VALUES
        (sample_round_id, team2_id, 1, 4, 3, -1, 256, mikey_id, 'Drive');
    END IF;
  END IF;
END $$;
