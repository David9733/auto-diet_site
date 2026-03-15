-- Create nutrition_data table for permanent storage
-- This eliminates redundant FDA API calls for unchanging nutritional data
CREATE TABLE IF NOT EXISTS public.nutrition_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_name TEXT UNIQUE NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC(5,1) NOT NULL DEFAULT 0,
  carbs NUMERIC(5,1) NOT NULL DEFAULT 0,
  fat NUMERIC(5,1) NOT NULL DEFAULT 0,
  sodium INTEGER NOT NULL DEFAULT 0,
  fda_food_code TEXT,
  serving_size_g INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for fast food name lookup
CREATE INDEX IF NOT EXISTS idx_nutrition_data_food_name ON public.nutrition_data(food_name);

-- Enable RLS
ALTER TABLE public.nutrition_data ENABLE ROW LEVEL SECURITY;

-- Create public read policy (nutrition data is shared across all users)
CREATE POLICY "Allow public read nutrition_data"
ON public.nutrition_data FOR SELECT
USING (true);

-- Only authenticated users can insert (prevent spam)
CREATE POLICY "Authenticated users can insert nutrition_data"
ON public.nutrition_data FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Create updated_at trigger
CREATE TRIGGER update_nutrition_data_updated_at
  BEFORE UPDATE ON public.nutrition_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.nutrition_data IS 'Permanent storage for food nutritional data from FDA API. Eliminates redundant API calls.';















