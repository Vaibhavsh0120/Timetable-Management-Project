-- Migration script for Timetable Management System
-- Run this in your Supabase SQL Editor

-- 1. Create timetables table
CREATE TABLE IF NOT EXISTS timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Timetable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add timetable_id column to timetableentries table
ALTER TABLE timetableentries 
ADD COLUMN IF NOT EXISTS timetable_id UUID REFERENCES timetables(id) ON DELETE CASCADE;

-- 3. Update the unique constraint on timetableentries to include timetable_id
-- First, drop the old constraint if it exists
ALTER TABLE timetableentries 
DROP CONSTRAINT IF EXISTS timetableentries_user_id_class_id_section_id_day_id_time_slot_id_key;

-- Add new constraint with timetable_id
ALTER TABLE timetableentries 
ADD CONSTRAINT timetableentries_unique 
UNIQUE (user_id, timetable_id, class_id, section_id, day_id, time_slot_id);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timetables_user_id ON timetables(user_id);
CREATE INDEX IF NOT EXISTS idx_timetables_updated_at ON timetables(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_timetableentries_timetable_id ON timetableentries(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetableentries_user_timetable ON timetableentries(user_id, timetable_id);

-- 5. Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger to update updated_at on timetables
DROP TRIGGER IF EXISTS update_timetables_updated_at ON timetables;
CREATE TRIGGER update_timetables_updated_at
  BEFORE UPDATE ON timetables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for timetables
-- Policy: Users can view their own timetables
CREATE POLICY "Users can view their own timetables"
  ON timetables FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own timetables
CREATE POLICY "Users can insert their own timetables"
  ON timetables FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own timetables
CREATE POLICY "Users can update their own timetables"
  ON timetables FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own timetables
CREATE POLICY "Users can delete their own timetables"
  ON timetables FOR DELETE
  USING (auth.uid() = user_id);

-- 9. Update RLS policies for timetableentries to include timetable_id check
-- Note: You may need to update existing policies if they exist
-- This assumes you already have RLS enabled on timetableentries

-- Optional: Migrate existing data (if you have existing timetable entries)
-- This will create a default timetable for each user and assign their entries to it
-- Uncomment and run only if you have existing data to migrate:

/*
DO $$
DECLARE
  user_record RECORD;
  default_timetable_id UUID;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM timetableentries LOOP
    -- Create a default timetable for this user
    INSERT INTO timetables (user_id, name, created_at, updated_at)
    VALUES (user_record.user_id, 'Default Timetable', NOW(), NOW())
    RETURNING id INTO default_timetable_id;
    
    -- Update all entries for this user to use the new timetable
    UPDATE timetableentries
    SET timetable_id = default_timetable_id
    WHERE user_id = user_record.user_id AND timetable_id IS NULL;
  END LOOP;
END $$;
*/
