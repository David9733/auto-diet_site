-- Add user_id columns to tables for data isolation
ALTER TABLE public.store_settings ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.meal_plans ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_store_settings_user_id ON public.store_settings(user_id);
CREATE INDEX idx_meal_plans_user_id ON public.meal_plans(user_id);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Allow public delete meal_plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Allow public insert meal_plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Allow public read meal_plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Allow public update meal_plans" ON public.meal_plans;

DROP POLICY IF EXISTS "Allow public delete store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow public insert store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow public read store_settings" ON public.store_settings;
DROP POLICY IF EXISTS "Allow public update store_settings" ON public.store_settings;

-- Create new RLS policies for store_settings (user-specific)
CREATE POLICY "Users can view own store_settings"
ON public.store_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own store_settings"
ON public.store_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own store_settings"
ON public.store_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own store_settings"
ON public.store_settings FOR DELETE
USING (auth.uid() = user_id);

-- Create new RLS policies for meal_plans (user-specific)
CREATE POLICY "Users can view own meal_plans"
ON public.meal_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal_plans"
ON public.meal_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal_plans"
ON public.meal_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal_plans"
ON public.meal_plans FOR DELETE
USING (auth.uid() = user_id);