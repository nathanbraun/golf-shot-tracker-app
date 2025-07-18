-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  rating DECIMAL(4,1) CHECK (rating >= 0 AND rating <= 50), -- Golf handicap/rating (0.0 to 50.0)
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

-- Insert the current team players
INSERT INTO players (name, email, rating, city) VALUES 
  ('Brusda', 'brusda@example.com', 15.2, 'Milwaukee, WI'),
  ('Nate', 'nate@example.com', 12.8, 'Madison, WI'),
  ('Mikey', 'mikey@example.com', 18.5, 'Green Bay, WI'),
  ('Strauss', 'strauss@example.com', 14.1, 'Appleton, WI')
ON CONFLICT (email) DO NOTHING;

-- Add some additional players for variety
INSERT INTO players (name, email, rating, city) VALUES 
  ('Jake', 'jake@example.com', 16.7, 'Oshkosh, WI'),
  ('Tyler', 'tyler@example.com', 11.3, 'Fond du Lac, WI'),
  ('Connor', 'connor@example.com', 19.2, 'Sheboygan, WI'),
  ('Alex', 'alex@example.com', 13.9, 'Wausau, WI'),
  ('Ryan', 'ryan@example.com', 17.4, 'La Crosse, WI'),
  ('Matt', 'matt@example.com', 10.6, 'Eau Claire, WI')
ON CONFLICT (email) DO NOTHING;
