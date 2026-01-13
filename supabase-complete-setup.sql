-- ============================================
-- COMPLETE SUPABASE SETUP SCRIPT
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Create Timetables Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.timetables (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled Timetable',
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT timetables_pkey PRIMARY KEY (id)
);

-- Create indexes for timetables
CREATE INDEX IF NOT EXISTS idx_timetables_user_id ON public.timetables(user_id);
CREATE INDEX IF NOT EXISTS idx_timetables_updated_at ON public.timetables(updated_at DESC);

-- ============================================
-- STEP 2: Add timetable_id to timetableentries
-- ============================================
ALTER TABLE public.timetableentries 
ADD COLUMN IF NOT EXISTS timetable_id uuid REFERENCES public.timetables(id) ON DELETE CASCADE;

-- Create indexes for timetableentries
CREATE INDEX IF NOT EXISTS idx_timetableentries_timetable_id ON public.timetableentries(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetableentries_user_timetable ON public.timetableentries(user_id, timetable_id);

-- ============================================
-- STEP 3: Update Unique Constraint
-- ============================================
-- Drop old constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'timetableentries_user_id_class_id_section_id_day_id_time_slot_id_key'
  ) THEN
    ALTER TABLE public.timetableentries 
    DROP CONSTRAINT timetableentries_user_id_class_id_section_id_day_id_time_slot_id_key;
  END IF;
END $$;

-- Add new constraint with timetable_id
ALTER TABLE public.timetableentries 
DROP CONSTRAINT IF EXISTS timetableentries_unique;

ALTER TABLE public.timetableentries 
ADD CONSTRAINT timetableentries_unique 
UNIQUE (user_id, timetable_id, class_id, section_id, day_id, time_slot_id);

-- ============================================
-- STEP 4: Create Auto-Update Trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_timetables_updated_at ON public.timetables;
CREATE TRIGGER update_timetables_updated_at
  BEFORE UPDATE ON public.timetables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- STEP 5: Enable Row Level Security
-- ============================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetableentries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Drop Existing Policies (if any)
-- ============================================
-- Timetables policies
DROP POLICY IF EXISTS "Users can view their own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Users can insert their own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Users can update their own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Users can delete their own timetables" ON public.timetables;

-- Classes policies
DROP POLICY IF EXISTS "Users can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can insert their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can delete their own classes" ON public.classes;

-- Sections policies
DROP POLICY IF EXISTS "Users can view their own sections" ON public.sections;
DROP POLICY IF EXISTS "Users can insert their own sections" ON public.sections;
DROP POLICY IF EXISTS "Users can update their own sections" ON public.sections;
DROP POLICY IF EXISTS "Users can delete their own sections" ON public.sections;

-- Subjects policies
DROP POLICY IF EXISTS "Users can view their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can insert their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can update their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete their own subjects" ON public.subjects;

-- Teachers policies
DROP POLICY IF EXISTS "Users can view their own teachers" ON public.teachers;
DROP POLICY IF EXISTS "Users can insert their own teachers" ON public.teachers;
DROP POLICY IF EXISTS "Users can update their own teachers" ON public.teachers;
DROP POLICY IF EXISTS "Users can delete their own teachers" ON public.teachers;

-- Timeslots policies
DROP POLICY IF EXISTS "Users can view their own timeslots" ON public.timeslots;
DROP POLICY IF EXISTS "Users can insert their own timeslots" ON public.timeslots;
DROP POLICY IF EXISTS "Users can update their own timeslots" ON public.timeslots;
DROP POLICY IF EXISTS "Users can delete their own timeslots" ON public.timeslots;

-- Timetableentries policies
DROP POLICY IF EXISTS "Users can view their own timetable entries" ON public.timetableentries;
DROP POLICY IF EXISTS "Users can insert their own timetable entries" ON public.timetableentries;
DROP POLICY IF EXISTS "Users can update their own timetable entries" ON public.timetableentries;
DROP POLICY IF EXISTS "Users can delete their own timetable entries" ON public.timetableentries;

-- ============================================
-- STEP 7: Create RLS Policies for Timetables
-- ============================================
CREATE POLICY "Users can view their own timetables"
  ON public.timetables FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timetables"
  ON public.timetables FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timetables"
  ON public.timetables FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timetables"
  ON public.timetables FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 8: Create RLS Policies for Classes
-- ============================================
CREATE POLICY "Users can view their own classes"
  ON public.classes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classes"
  ON public.classes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes"
  ON public.classes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes"
  ON public.classes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 9: Create RLS Policies for Sections
-- ============================================
CREATE POLICY "Users can view their own sections"
  ON public.sections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sections"
  ON public.sections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sections"
  ON public.sections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sections"
  ON public.sections FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 10: Create RLS Policies for Subjects
-- ============================================
CREATE POLICY "Users can view their own subjects"
  ON public.subjects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects"
  ON public.subjects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects"
  ON public.subjects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 11: Create RLS Policies for Teachers
-- ============================================
CREATE POLICY "Users can view their own teachers"
  ON public.teachers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own teachers"
  ON public.teachers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teachers"
  ON public.teachers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teachers"
  ON public.teachers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 12: Create RLS Policies for Timeslots
-- ============================================
CREATE POLICY "Users can view their own timeslots"
  ON public.timeslots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timeslots"
  ON public.timeslots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timeslots"
  ON public.timeslots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timeslots"
  ON public.timeslots FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 13: Create RLS Policies for Timetableentries
-- ============================================
CREATE POLICY "Users can view their own timetable entries"
  ON public.timetableentries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timetable entries"
  ON public.timetableentries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timetable entries"
  ON public.timetableentries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timetable entries"
  ON public.timetableentries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 14: (Optional) Migrate Existing Data
-- ============================================
-- Uncomment this section if you have existing timetableentries data
/*
DO $$
DECLARE
  user_record RECORD;
  default_timetable_id UUID;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM public.timetableentries WHERE timetable_id IS NULL LOOP
    -- Create a default timetable for this user
    INSERT INTO public.timetables (user_id, name, created_at, updated_at)
    VALUES (user_record.user_id, 'Default Timetable', NOW(), NOW())
    RETURNING id INTO default_timetable_id;
    
    -- Update all entries for this user to use the new timetable
    UPDATE public.timetableentries
    SET timetable_id = default_timetable_id
    WHERE user_id = user_record.user_id AND timetable_id IS NULL;
  END LOOP;
END $$;
*/

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly:

-- Check timetables table structure
SELECT 
  'Timetables table structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'timetables'
ORDER BY ordinal_position;

-- Check timetable_id in timetableentries
SELECT 
  'Timetable ID column check:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'timetableentries'
  AND column_name = 'timetable_id';

-- Check RLS policies
SELECT 
  'RLS Policies:' as info;
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check indexes
SELECT 
  'Indexes:' as info;
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND (tablename = 'timetables' OR tablename = 'timetableentries')
ORDER BY tablename, indexname;
