-- Migration to add description column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
