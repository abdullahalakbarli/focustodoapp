-- Migration: Create user_categories table for account-based category storage
-- This replaces browser-based localStorage storage with server-side persistence

-- Create user_categories table
CREATE TABLE IF NOT EXISTS public.user_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id ON public.user_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_categories_active ON public.user_categories(user_id, is_deleted) WHERE is_deleted = FALSE;

-- Create unique index for case-insensitive category names per user
-- This ensures no duplicate category names (case-insensitive) for the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_categories_unique_name 
ON public.user_categories(user_id, LOWER(name)) 
WHERE is_deleted = FALSE;

-- Enable Row Level Security
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own categories"
  ON public.user_categories FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = FALSE);

CREATE POLICY "Users can insert their own categories"
  ON public.user_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.user_categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.user_categories FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_user_categories_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER user_categories_updated_at
  BEFORE UPDATE ON public.user_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_categories_updated_at();

-- Add comment for documentation
COMMENT ON TABLE public.user_categories IS 'User-defined custom categories for focus sessions. Replaces browser-based localStorage storage.';
COMMENT ON COLUMN public.user_categories.is_deleted IS 'Soft delete flag. Categories are soft-deleted to preserve historical data.';

