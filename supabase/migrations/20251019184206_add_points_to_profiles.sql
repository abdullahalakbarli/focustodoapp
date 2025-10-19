-- Up Migration: Add points column to profiles table
ALTER TABLE public.profiles
ADD COLUMN points integer NOT NULL DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.points IS 'Gamification points: 1 point per 10 minutes of focus time';

-- Down Migration: Remove points column (for rollback)
ALTER TABLE public.profiles
DROP COLUMN points;
