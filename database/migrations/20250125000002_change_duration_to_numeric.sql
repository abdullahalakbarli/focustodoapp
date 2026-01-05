-- Migration: Change duration_minutes from INTEGER to NUMERIC to support decimal values
-- This ensures accurate time tracking for partial minutes

-- Change focus_sessions.duration_minutes to NUMERIC
ALTER TABLE public.focus_sessions 
ALTER COLUMN duration_minutes TYPE NUMERIC(10, 2) USING duration_minutes::NUMERIC(10, 2);

-- Change tasks.duration_minutes to NUMERIC for consistency
ALTER TABLE public.tasks 
ALTER COLUMN duration_minutes TYPE NUMERIC(10, 2) USING duration_minutes::NUMERIC(10, 2);

-- Add comment
COMMENT ON COLUMN public.focus_sessions.duration_minutes IS 'Duration in minutes with 2 decimal precision (e.g., 25.50 for 25 minutes 30 seconds)';
COMMENT ON COLUMN public.tasks.duration_minutes IS 'Duration in minutes with 2 decimal precision';

