-- =====================================================
-- COMPLETE DATABASE RESET AND SETUP
-- WARNING: THIS WILL DELETE ALL DATA
-- Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL POLICIES
-- =====================================================
DROP POLICY IF EXISTS classes_select ON public.classes;
DROP POLICY IF EXISTS classes_insert ON public.classes;
DROP POLICY IF EXISTS classes_update ON public.classes;
DROP POLICY IF EXISTS classes_delete ON public.classes;
DROP POLICY IF EXISTS classes_all ON public.classes;

DROP POLICY IF EXISTS sections_all ON public.sections;
DROP POLICY IF EXISTS subjects_all ON public.subjects;
DROP POLICY IF EXISTS teachers_all ON public.teachers;
DROP POLICY IF EXISTS timeslots_all ON public.timeslots;
DROP POLICY IF EXISTS timetables_all ON public.timetables;
DROP POLICY IF EXISTS timetableentries_all ON public.timetableentries;
DROP POLICY IF EXISTS timetable_settings_all ON public.timetable_settings;

DROP POLICY IF EXISTS "Users can view their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can insert their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can update their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can delete their own classes" ON public.classes;
DROP POLICY IF EXISTS "Users can view their own sections" ON public.sections;
DROP POLICY IF EXISTS "Users can insert their own sections" ON public.sections;
DROP POLICY IF EXISTS "Users can update their own sections" ON public.sections;
DROP POLICY IF EXISTS "Users can delete their own sections" ON public.sections;
DROP POLICY IF EXISTS "Users can view their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can insert their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can update their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete their own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can view their own teachers" ON public.teachers;
DROP POLICY IF EXISTS "Users can insert their own teachers" ON public.teachers;
DROP POLICY IF EXISTS "Users can update their own teachers" ON public.teachers;
DROP POLICY IF EXISTS "Users can delete their own teachers" ON public.teachers;
DROP POLICY IF EXISTS "Users can view their own timeslots" ON public.timeslots;
DROP POLICY IF EXISTS "Users can insert their own timeslots" ON public.timeslots;
DROP POLICY IF EXISTS "Users can update their own timeslots" ON public.timeslots;
DROP POLICY IF EXISTS "Users can delete their own timeslots" ON public.timeslots;
DROP POLICY IF EXISTS "Users can view their own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Users can insert their own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Users can update their own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Users can delete their own timetables" ON public.timetables;
DROP POLICY IF EXISTS "Users can view their own timetable entries" ON public.timetableentries;
DROP POLICY IF EXISTS "Users can insert their own timetable entries" ON public.timetableentries;
DROP POLICY IF EXISTS "Users can update their own timetable entries" ON public.timetableentries;
DROP POLICY IF EXISTS "Users can delete their own timetable entries" ON public.timetableentries;
DROP POLICY IF EXISTS "Users can view their own timetable settings" ON public.timetable_settings;
DROP POLICY IF EXISTS "Users can insert their own timetable settings" ON public.timetable_settings;
DROP POLICY IF EXISTS "Users can update their own timetable settings" ON public.timetable_settings;
DROP POLICY IF EXISTS "Users can delete their own timetable settings" ON public.timetable_settings;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

-- =====================================================
-- STEP 2: DROP ALL TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_timetables_updated_at ON public.timetables;
DROP TRIGGER IF EXISTS trg_timetables_updated_at ON public.timetables;
DROP TRIGGER IF EXISTS update_timetable_settings_updated_at ON public.timetable_settings;
DROP TRIGGER IF EXISTS trg_timetable_settings_updated_at ON public.timetable_settings;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;

-- =====================================================
-- STEP 3: DROP ALL TABLES (in correct order)
-- =====================================================
DROP TABLE IF EXISTS public.timetableentries CASCADE;
DROP TABLE IF EXISTS public.timetable_settings CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;
DROP TABLE IF EXISTS public.timeslots CASCADE;
DROP TABLE IF EXISTS public.timetables CASCADE;
DROP TABLE IF EXISTS public.subjects CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;

-- =====================================================
-- STEP 4: DROP FUNCTIONS
-- =====================================================
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- =====================================================
-- STEP 5: ENABLE UUID EXTENSION
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 6: CREATE ALL TABLES
-- =====================================================

-- CLASSES TABLE
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL
);

-- SUBJECTS TABLE
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL
);

-- TEACHERS TABLE
CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE
);

-- SECTIONS TABLE
CREATE TABLE public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name text NOT NULL
);

-- TIMESLOTS TABLE
CREATE TABLE public.timeslots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time text NOT NULL,
  end_time text NOT NULL,
  is_lunch boolean DEFAULT false
);

-- TIMETABLES TABLE
CREATE TABLE public.timetables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled Timetable',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- TIMETABLE ENTRIES TABLE
CREATE TABLE public.timetableentries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timetable_id uuid NOT NULL REFERENCES public.timetables(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  time_slot_id uuid NOT NULL REFERENCES public.timeslots(id) ON DELETE CASCADE,
  day_id integer NOT NULL,
  CONSTRAINT timetableentries_unique UNIQUE (user_id, timetable_id, class_id, section_id, day_id, time_slot_id)
);

-- TIMETABLE SETTINGS TABLE
CREATE TABLE public.timetable_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id uuid UNIQUE NOT NULL REFERENCES public.timetables(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled_days integer[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
  max_lunch_slots integer NOT NULL DEFAULT 1,
  lunch_slot_ids text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT timetable_settings_timetable_user_unique UNIQUE (timetable_id, user_id)
);

-- USER PREFERENCES TABLE (for theme persistence)
CREATE TABLE public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('system','light','dark')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- STEP 7: CREATE INDEXES
-- =====================================================
CREATE INDEX idx_classes_user_id ON public.classes(user_id);
CREATE INDEX idx_subjects_user_id ON public.subjects(user_id);
CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX idx_teachers_subject_id ON public.teachers(subject_id);
CREATE INDEX idx_sections_user_id ON public.sections(user_id);
CREATE INDEX idx_sections_class_id ON public.sections(class_id);
CREATE INDEX idx_timeslots_user_id ON public.timeslots(user_id);
CREATE INDEX idx_timetables_user_id ON public.timetables(user_id);
CREATE INDEX idx_timetables_updated_at ON public.timetables(updated_at DESC);
CREATE INDEX idx_timetableentries_user_id ON public.timetableentries(user_id);
CREATE INDEX idx_timetableentries_timetable_id ON public.timetableentries(timetable_id);
CREATE INDEX idx_timetableentries_user_timetable ON public.timetableentries(user_id, timetable_id);
CREATE INDEX idx_timetable_settings_timetable_id ON public.timetable_settings(timetable_id);
CREATE INDEX idx_timetable_settings_user_id ON public.timetable_settings(user_id);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- =====================================================
-- STEP 8: CREATE TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 9: CREATE TRIGGERS
-- =====================================================
CREATE TRIGGER update_timetables_updated_at
  BEFORE UPDATE ON public.timetables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timetable_settings_updated_at
  BEFORE UPDATE ON public.timetable_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STEP 10: ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetableentries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 11: CREATE RLS POLICIES
-- =====================================================

-- CLASSES POLICIES
CREATE POLICY "Users can access their own classes"
  ON public.classes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SECTIONS POLICIES
CREATE POLICY "Users can access their own sections"
  ON public.sections
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SUBJECTS POLICIES
CREATE POLICY "Users can access their own subjects"
  ON public.subjects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TEACHERS POLICIES
CREATE POLICY "Users can access their own teachers"
  ON public.teachers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TIMESLOTS POLICIES
CREATE POLICY "Users can access their own timeslots"
  ON public.timeslots
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TIMETABLES POLICIES
CREATE POLICY "Users can access their own timetables"
  ON public.timetables
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TIMETABLE ENTRIES POLICIES
CREATE POLICY "Users can access their own timetable entries"
  ON public.timetableentries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TIMETABLE SETTINGS POLICIES
CREATE POLICY "Users can access their own timetable settings"
  ON public.timetable_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- USER PREFERENCES POLICIES
CREATE POLICY "Users can access their own preferences"
  ON public.user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 12: VERIFICATION
-- =====================================================
SELECT 'Database reset complete! All tables created with RLS enabled.' as status;

-- Verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify policies exist
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
