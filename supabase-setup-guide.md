# Supabase Database Setup Guide

Follow these steps in order to set up your Supabase database correctly.

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/gbrszptluqidqesyrubb
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query** to create a new SQL query

## Step 2: Create the Timetables Table

Run this SQL to create the `timetables` table:

```sql
-- Create timetables table
CREATE TABLE IF NOT EXISTS public.timetables (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled Timetable',
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT timetables_pkey PRIMARY KEY (id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_timetables_user_id ON public.timetables(user_id);
CREATE INDEX IF NOT EXISTS idx_timetables_updated_at ON public.timetables(updated_at DESC);
```

## Step 3: Add timetable_id to timetableentries

Run this SQL to add the `timetable_id` column:

```sql
-- Add timetable_id column to timetableentries
ALTER TABLE public.timetableentries 
ADD COLUMN IF NOT EXISTS timetable_id uuid REFERENCES public.timetables(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_timetableentries_timetable_id ON public.timetableentries(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetableentries_user_timetable ON public.timetableentries(user_id, timetable_id);
```

## Step 4: Update Unique Constraint

Run this SQL to update the unique constraint:

```sql
-- Drop old constraint if it exists (you may need to adjust the constraint name)
ALTER TABLE public.timetableentries 
DROP CONSTRAINT IF EXISTS timetableentries_user_id_class_id_section_id_day_id_time_slot_id_key;

-- Add new constraint with timetable_id
ALTER TABLE public.timetableentries 
ADD CONSTRAINT timetableentries_unique 
UNIQUE (user_id, timetable_id, class_id, section_id, day_id, time_slot_id);
```

## Step 5: Create Auto-Update Trigger for updated_at

Run this SQL to automatically update the `updated_at` timestamp:

```sql
-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for timetables table
DROP TRIGGER IF EXISTS update_timetables_updated_at ON public.timetables;
CREATE TRIGGER update_timetables_updated_at
  BEFORE UPDATE ON public.timetables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

## Step 6: Enable Row Level Security (RLS)

Run this SQL to enable RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeslots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetableentries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
```

## Step 7: Create RLS Policies for Timetables

Run this SQL to create security policies for the timetables table:

```sql
-- Policy: Users can view their own timetables
CREATE POLICY "Users can view their own timetables"
  ON public.timetables FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own timetables
CREATE POLICY "Users can insert their own timetables"
  ON public.timetables FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own timetables
CREATE POLICY "Users can update their own timetables"
  ON public.timetables FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own timetables
CREATE POLICY "Users can delete their own timetables"
  ON public.timetables FOR DELETE
  USING (auth.uid() = user_id);
```

## Step 8: Create RLS Policies for Existing Tables

Run this SQL to create security policies for your existing tables:

```sql
-- ============================================
-- CLASSES POLICIES
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
-- SECTIONS POLICIES
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
-- SUBJECTS POLICIES
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
-- TEACHERS POLICIES
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
-- TIMESLOTS POLICIES
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
-- TIMETABLEENTRIES POLICIES
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
```

## Step 9: (Optional) Migrate Existing Data

If you have existing `timetableentries` data, run this to create default timetables:

```sql
-- Create default timetables for existing users
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
```

## Step 10: Verify Setup

Run this query to verify everything is set up correctly:

```sql
-- Check if timetables table exists and has the correct structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'timetables'
ORDER BY ordinal_position;

-- Check if timetable_id column exists in timetableentries
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
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Step 11: (Recommended) Persist Theme Preference (Light/Dark/System)

To store the user’s theme preference globally (so it works across devices), create a `user_preferences` table.

```sql
-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('system','light','dark')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

## Troubleshooting

### If you get "constraint does not exist" error:
- The constraint name might be different. Check your actual constraint names:
```sql
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'timetableentries' 
  AND constraint_type = 'UNIQUE';
```

### If you get "policy already exists" error:
- Drop the existing policy first:
```sql
DROP POLICY IF EXISTS "policy_name" ON public.table_name;
```

### If RLS is blocking your queries:
- Temporarily disable RLS to test (NOT recommended for production):
```sql
ALTER TABLE public.timetables DISABLE ROW LEVEL SECURITY;
```

## Next Steps

After completing all steps:

1. ✅ Your database is ready
2. ✅ Test creating a timetable in your app
3. ✅ Verify that users can only see their own data
4. ✅ Check that timetable_id is being used correctly

## Important Notes

- **Never disable RLS in production** - it's your security layer
- **Always test with a real user account** after setup
- **Backup your database** before running migrations if you have important data
- **The timetable_id column is required** - make sure your app always provides it when creating entries
