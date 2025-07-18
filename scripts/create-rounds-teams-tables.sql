-- Create rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  round_date DATE NOT NULL,
  start_time TIME,
  status VARCHAR(50) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, name) -- Team names must be unique within a round
);

-- Create team_players junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS team_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, player_id) -- A player can only be on a team once per team
);

-- Enable Row Level Security
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_players ENABLE ROW LEVEL SECURITY;

-- Create policies for rounds table
CREATE POLICY "Anyone can view rounds" ON rounds
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert rounds" ON rounds
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update rounds" ON rounds
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete rounds" ON rounds
  FOR DELETE USING (true);

-- Create policies for teams table
CREATE POLICY "Anyone can view teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert teams" ON teams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update teams" ON teams
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete teams" ON teams
  FOR DELETE USING (true);

-- Create policies for team_players table
CREATE POLICY "Anyone can view team_players" ON team_players
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert team_players" ON team_players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update team_players" ON team_players
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete team_players" ON team_players
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rounds_course_id ON rounds(course_id);
CREATE INDEX IF NOT EXISTS idx_rounds_date ON rounds(round_date);
CREATE INDEX IF NOT EXISTS idx_rounds_status ON rounds(status);
CREATE INDEX IF NOT EXISTS idx_teams_round_id ON teams(round_id);
CREATE INDEX IF NOT EXISTS idx_team_players_team_id ON team_players(team_id);
CREATE INDEX IF NOT EXISTS idx_team_players_player_id ON team_players(player_id);

-- Insert some sample data
DO $$
DECLARE
  camelot_course_id UUID;
  sample_round_id UUID;
  team1_id UUID;
  team2_id UUID;
  brusda_id UUID;
  nate_id UUID;
  mikey_id UUID;
  strauss_id UUID;
BEGIN
  -- Get the Camelot course ID
  SELECT id INTO camelot_course_id FROM courses WHERE name = 'Camelot' LIMIT 1;
  
  -- Get player IDs
  SELECT id INTO brusda_id FROM players WHERE name = 'Brusda' LIMIT 1;
  SELECT id INTO nate_id FROM players WHERE name = 'Nate' LIMIT 1;
  SELECT id INTO mikey_id FROM players WHERE name = 'Mikey' LIMIT 1;
  SELECT id INTO strauss_id FROM players WHERE name = 'Strauss' LIMIT 1;
  
  -- Only proceed if we have the course and players
  IF camelot_course_id IS NOT NULL AND brusda_id IS NOT NULL THEN
    -- Insert a sample round
    INSERT INTO rounds (course_id, name, description, round_date, start_time, status)
    VALUES (
      camelot_course_id,
      'Weekly Scramble - January 2025',
      'Regular weekly scramble tournament',
      '2025-01-25',
      '08:00:00',
      'upcoming'
    )
    RETURNING id INTO sample_round_id;
    
    -- Create Team 1
    INSERT INTO teams (round_id, name)
    VALUES (sample_round_id, 'Team Thunder')
    RETURNING id INTO team1_id;
    
    -- Create Team 2  
    INSERT INTO teams (round_id, name)
    VALUES (sample_round_id, 'Team Lightning')
    RETURNING id INTO team2_id;
    
    -- Add players to Team 1 (Brusda and Nate)
    IF brusda_id IS NOT NULL THEN
      INSERT INTO team_players (team_id, player_id) VALUES (team1_id, brusda_id);
    END IF;
    IF nate_id IS NOT NULL THEN
      INSERT INTO team_players (team_id, player_id) VALUES (team1_id, nate_id);
    END IF;
    
    -- Add players to Team 2 (Mikey and Strauss)
    IF mikey_id IS NOT NULL THEN
      INSERT INTO team_players (team_id, player_id) VALUES (team2_id, mikey_id);
    END IF;
    IF strauss_id IS NOT NULL THEN
      INSERT INTO team_players (team_id, player_id) VALUES (team2_id, strauss_id);
    END IF;
  END IF;
END $$;
