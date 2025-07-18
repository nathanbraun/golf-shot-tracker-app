-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_holes table
CREATE TABLE IF NOT EXISTS course_holes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
  tee_name VARCHAR(50) NOT NULL DEFAULT 'Blue',
  par INTEGER NOT NULL CHECK (par >= 3 AND par <= 5),
  distance INTEGER NOT NULL CHECK (distance > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, hole_number, tee_name)
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_holes ENABLE ROW LEVEL SECURITY;

-- Create policies for courses table
-- Allow anyone to read courses (public data)
CREATE POLICY "Anyone can view courses" ON courses
  FOR SELECT USING (true);

-- Allow anyone to insert courses (for now - you can restrict this later)
CREATE POLICY "Anyone can insert courses" ON courses
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update courses (for now - you can restrict this later)
CREATE POLICY "Anyone can update courses" ON courses
  FOR UPDATE USING (true);

-- Allow anyone to delete courses (for now - you can restrict this later)
CREATE POLICY "Anyone can delete courses" ON courses
  FOR DELETE USING (true);

-- Create policies for course_holes table
-- Allow anyone to read course holes (public data)
CREATE POLICY "Anyone can view course holes" ON course_holes
  FOR SELECT USING (true);

-- Allow anyone to insert course holes (for now - you can restrict this later)
CREATE POLICY "Anyone can insert course holes" ON course_holes
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update course holes (for now - you can restrict this later)
CREATE POLICY "Anyone can update course holes" ON course_holes
  FOR UPDATE USING (true);

-- Allow anyone to delete course holes (for now - you can restrict this later)
CREATE POLICY "Anyone can delete course holes" ON course_holes
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_holes_course_id ON course_holes(course_id);
CREATE INDEX IF NOT EXISTS idx_course_holes_hole_number ON course_holes(hole_number);
CREATE INDEX IF NOT EXISTS idx_courses_name ON courses(name);

-- Insert the Camelot course data
INSERT INTO courses (name, location) VALUES 
  ('Camelot', 'Lomira, WI')
ON CONFLICT DO NOTHING;

-- Get the course ID for inserting holes
DO $$
DECLARE
  camelot_id UUID;
BEGIN
  SELECT id INTO camelot_id FROM courses WHERE name = 'Camelot' AND location = 'Lomira, WI';
  
  -- Insert hole data for Blue Tees
  INSERT INTO course_holes (course_id, hole_number, tee_name, par, distance) VALUES
    (camelot_id, 1, 'Blue', 4, 376),
    (camelot_id, 2, 'Blue', 3, 179),
    (camelot_id, 3, 'Blue', 4, 329),
    (camelot_id, 4, 'Blue', 5, 462),
    (camelot_id, 5, 'Blue', 4, 372),
    (camelot_id, 6, 'Blue', 4, 324),
    (camelot_id, 7, 'Blue', 3, 171),
    (camelot_id, 8, 'Blue', 4, 371),
    (camelot_id, 9, 'Blue', 5, 480),
    (camelot_id, 10, 'Blue', 4, 345),
    (camelot_id, 11, 'Blue', 4, 297),
    (camelot_id, 12, 'Blue', 3, 207),
    (camelot_id, 13, 'Blue', 3, 194),
    (camelot_id, 14, 'Blue', 5, 555),
    (camelot_id, 15, 'Blue', 4, 405),
    (camelot_id, 16, 'Blue', 5, 401),
    (camelot_id, 17, 'Blue', 4, 329),
    (camelot_id, 18, 'Blue', 4, 360)
  ON CONFLICT (course_id, hole_number, tee_name) DO NOTHING;
END $$;
