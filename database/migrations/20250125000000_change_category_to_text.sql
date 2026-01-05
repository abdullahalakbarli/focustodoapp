-- Migration: Change category columns from enum to TEXT to support custom categories
-- This allows users to create and use custom categories beyond the predefined enum values

-- Step 1: Add new TEXT columns
ALTER TABLE public.focus_sessions 
ADD COLUMN category_text TEXT;

ALTER TABLE public.tasks 
ADD COLUMN category_text TEXT;

-- Step 2: Copy existing enum values to TEXT columns
UPDATE public.focus_sessions 
SET category_text = category::TEXT;

UPDATE public.tasks 
SET category_text = category::TEXT;

-- Step 3: Make TEXT columns NOT NULL
ALTER TABLE public.focus_sessions 
ALTER COLUMN category_text SET NOT NULL;

ALTER TABLE public.tasks 
ALTER COLUMN category_text SET NOT NULL;

-- Step 4: Drop old enum columns
ALTER TABLE public.focus_sessions 
DROP COLUMN category;

ALTER TABLE public.tasks 
DROP COLUMN category;

-- Step 5: Rename TEXT columns to original names
ALTER TABLE public.focus_sessions 
RENAME COLUMN category_text TO category;

ALTER TABLE public.tasks 
RENAME COLUMN category_text TO category;

-- Step 6: Add default value for tasks category
ALTER TABLE public.tasks 
ALTER COLUMN category SET DEFAULT 'other';

-- Note: The task_category enum type is kept for backward compatibility but is no longer used
-- It can be dropped in a future migration if needed: DROP TYPE task_category;

