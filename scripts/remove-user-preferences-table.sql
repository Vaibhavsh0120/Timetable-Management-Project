-- Migration: Remove user_preferences table
-- Date: 2026-03-27
-- Description: Remove the user_preferences table as theme preferences are now stored in browser cache (localStorage) via next-themes
-- This optimization reduces database queries and complexity while improving user experience

-- Drop the user_preferences table if it exists
DROP TABLE IF EXISTS public.user_preferences CASCADE;

-- Add a note about the change
-- Theme preferences are now managed entirely client-side using next-themes with browser storage
-- This provides better performance and offline support
