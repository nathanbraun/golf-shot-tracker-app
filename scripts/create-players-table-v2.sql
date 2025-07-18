-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  rating DECIMAL(4,1) CHECK (rating >= 0 AND rating <= 50), -- Golf rating/skill level (0.0 to 50.0)
  handicap DECIMAL(4,1) CHECK (handicap >= -10 AND handicap <= 54), -- Official USGA handicap (-10.0 to 54.0)
  city VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for players table
-- Allow anyone to read players (public data for team selection)
CREATE POLICY "Anyone can view players" ON players
  FOR SELECT USING (true);

-- Allow anyone to insert players (for now - you can restrict this later)
CREATE POLICY "Anyone can insert players" ON players
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update players (for now - you can restrict this later)
CREATE POLICY "Anyone can update players" ON players
  FOR UPDATE USING (true);

-- Allow anyone to delete players (for now - you can restrict this later)
CREATE POLICY "Anyone can delete players" ON players
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_city ON players(city);
CREATE INDEX IF NOT EXISTS idx_players_handicap ON players(handicap);

-- Insert the current team players
INSERT INTO players (name, email, rating, handicap, city) VALUES 
  ('Brusda', 'brusda@example.com', 15.2, 14.8, 'Milwaukee, WI'),
  ('Nate', 'nate@example.com', 12.8, 12.1, 'Madison, WI'),
  ('Mikey', 'mikey@example.com', 18.5, 19.2, 'Green Bay, WI'),
  ('Strauss', 'strauss@example.com', 14.1, 13.7, 'Appleton, WI')
ON CONFLICT (email) DO NOTHING;

-- Add some additional players for variety
INSERT INTO players (name, email, rating, handicap, city) VALUES 
  ('Jake', 'jake@example.com', 16.7, 17.3, 'Oshkosh, WI'),
  ('Tyler', 'tyler@example.com', 11.3, 10.9, 'Fond du Lac, WI'),
  ('Connor', 'connor@example.com', 19.2, NULL, 'Sheboygan, WI'), -- No official handicap
  ('Alex', 'alex@example.com', 13.9, 14.2, 'Wausau, WI'),
  ('Ryan', 'ryan@example.com', 17.4, NULL, 'La Crosse, WI'), -- No official handicap
  ('Matt', 'matt@example.com', 10.6, 9.8, 'Eau Claire, WI'),
  ('Pro Sam', 'sam@example.com', 2.1, -1.5, 'Milwaukee, WI'), -- Professional level
  ('Beginner Bob', 'bob@example.com', 28.5, 32.1, 'Madison, WI') -- High handicap beginner
ON CONFLICT (email) DO NOTHING;
