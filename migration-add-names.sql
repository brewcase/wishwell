-- 🔄 MIGRATION: Add First Name and Last Name Fields
-- Run this SQL in your Supabase SQL Editor to update existing schema

-- Step 1: Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR,
ADD COLUMN IF NOT EXISTS last_name VARCHAR;

-- Step 2: Update the full_name column to be a generated column
-- First, drop the existing full_name column if it exists
ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;

-- Add the generated full_name column
ALTER TABLE public.profiles 
ADD COLUMN full_name VARCHAR GENERATED ALWAYS AS (
  CASE 
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN 
      CONCAT(first_name, ' ', last_name)
    WHEN first_name IS NOT NULL THEN 
      first_name
    WHEN last_name IS NOT NULL THEN 
      last_name
    ELSE 
      NULL
  END
) STORED;

-- Step 3: Update the trigger function to handle new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: For existing users, try to split existing full_name into first_name and last_name
-- This is optional and only if you have existing data
UPDATE public.profiles 
SET 
  first_name = CASE 
    WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
    THEN split_part(full_name, ' ', 1)
    ELSE full_name
  END,
  last_name = CASE 
    WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
    THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE NULL
  END
WHERE first_name IS NULL AND last_name IS NULL AND full_name IS NOT NULL;

-- Step 5: Verify the migration
-- You can run this to check the results:
-- SELECT id, email, first_name, last_name, full_name FROM public.profiles LIMIT 5;
